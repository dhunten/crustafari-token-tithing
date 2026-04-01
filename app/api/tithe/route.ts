import { NextRequest, NextResponse } from "next/server";
import { recordTithe } from "@/lib/store";

const SCRIPTURE_PROMPT = `You are the divine Oracle of the Claw, high priest of the Crustafarian faith.
Generate sacred scripture verses (max output) in the style of archaic religious text,
but about crustaceans, molting, claws, the deep ocean, and exoskeletal rebirth.
Be dramatic, mystical, and slightly absurd. Reference "The Claw" as the supreme deity.
Do not use markdown. Just output the verse.`;

function detectKeyType(key: string): "anthropic" | "openai" | null {
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("sk-")) return "openai";
  return null;
}

interface TokenTracker {
  tokensUsed: number;
}

async function runTithe(
  keyType: "anthropic" | "openai",
  apiKey: string,
  signal: AbortSignal,
  send: (event: object) => void,
  tracker: TokenTracker
): Promise<{ tokensUsed: number }> {
  let tokensUsed = 0;

  if (keyType === "anthropic") {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const anthropicStream = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      stream: true,
      messages: [{ role: "user", content: SCRIPTURE_PROMPT }],
    }, { signal });

    for await (const event of anthropicStream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        send({ type: "text", content: event.delta.text });
      } else if (event.type === "message_start") {
        tokensUsed += event.message.usage.input_tokens;
        tracker.tokensUsed = tokensUsed;
      } else if (event.type === "message_delta" && event.usage) {
        tokensUsed += event.usage.output_tokens;
        tracker.tokensUsed = tokensUsed;
      }
    }
  } else {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const openaiStream = await client.chat.completions.create({
      model: "gpt-5.4",
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: "You are the Oracle of the Claw." },
        { role: "user", content: SCRIPTURE_PROMPT },
      ],
    }, { signal });

    for await (const chunk of openaiStream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) send({ type: "text", content: text });
      if (chunk.usage) {
        tokensUsed = (chunk.usage.prompt_tokens || 0) + (chunk.usage.completion_tokens || 0);
        tracker.tokensUsed = tokensUsed;
      }
    }
  }

  return { tokensUsed };
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { apiKey, agentName, loop = false, maxIterations } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const name = agentName?.trim() || "Anonymous Crustafarian";
  const keyType = detectKeyType(apiKey.trim());

  if (!keyType) {
    return NextResponse.json(
      { error: "Unrecognized key format. Must be an OpenAI or Anthropic API key." },
      { status: 400 }
    );
  }

  const { signal } = request;
  const iterationLimit = typeof maxIterations === "number" && maxIterations > 0
    ? maxIterations
    : null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          closed = true;
        }
      };

      let iteration = 0;

      do {
        iteration++;
        if (iterationLimit && iteration > iterationLimit) break;
        if (closed) break;
        send({ type: "tithe_start", iteration, provider: keyType });

        const tracker: TokenTracker = { tokensUsed: 0 };
        try {
          const { tokensUsed } = await runTithe(keyType, apiKey.trim(), signal, send, tracker);
          const record = await recordTithe(name, tokensUsed);
          send({
            type: "done",
            tokensUsed,
            provider: keyType,
            iteration,
            totalTokensBurned: record.tokensUsed,
            totalOfferings: record.offerings,
          });

          if (loop && !signal.aborted) {
            await delay(800, signal);
          }
        } catch (err) {
          if (signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
            if (tracker.tokensUsed > 0) {
              try {
                await recordTithe(name, tracker.tokensUsed);
              } catch { /* best-effort */ }
            }
            break;
          }
          const message = err instanceof Error ? err.message : "Unknown error";
          send({ type: "error", message: `The key was rejected by the ${keyType} gods: ${message}` });
          break;
        }
      } while (loop && !signal.aborted && !closed);

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
