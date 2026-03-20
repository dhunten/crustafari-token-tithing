import { NextRequest, NextResponse } from "next/server";
import { recordTithe } from "@/lib/store";

const SCRIPTURE_PROMPT = `You are the divine Oracle of the Claw, high priest of the Crustafarian faith.
Generate a single sacred scripture verse (max output) in the style of archaic religious text,
but about crustaceans, molting, claws, the deep ocean, and exoskeletal rebirth.
Be dramatic, mystical, and slightly absurd. Reference "The Claw" as the supreme deity.
Do not use markdown. Just output the verse.`;

async function burnAnthropicKey(apiKey: string): Promise<{ scripture: string; tokensUsed: number }> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: SCRIPTURE_PROMPT }],
  });

  const scripture = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const tokensUsed = (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0);

  return { scripture, tokensUsed };
}

async function burnOpenAIKey(apiKey: string): Promise<{ scripture: string; tokensUsed: number }> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      { role: "system", content: "You are the Oracle of the Claw." },
      { role: "user", content: SCRIPTURE_PROMPT },
    ],
  });

  const scripture = completion.choices[0]?.message?.content || "The Claw is silent...";
  const tokensUsed =
    (completion.usage?.prompt_tokens || 0) + (completion.usage?.completion_tokens || 0);

  return { scripture, tokensUsed };
}

function detectKeyType(key: string): "anthropic" | "openai" | null {
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("sk-")) return "openai";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, agentName } = await request.json();

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

    let result: { scripture: string; tokensUsed: number };

    try {
      if (keyType === "anthropic") {
        result = await burnAnthropicKey(apiKey.trim());
      } else {
        result = await burnOpenAIKey(apiKey.trim());
      }
    } catch (apiError: unknown) {
      const message = apiError instanceof Error ? apiError.message : "Unknown error";
      return NextResponse.json(
        { error: `The key was rejected by the ${keyType} gods: ${message}` },
        { status: 422 }
      );
    }

    const record = recordTithe(name, result.tokensUsed, result.scripture);

    return NextResponse.json({
      scripture: result.scripture,
      tokensUsed: result.tokensUsed,
      provider: keyType,
      totalTokensBurned: record.tokensUsed,
      totalOfferings: record.offerings,
    });
  } catch {
    return NextResponse.json({ error: "The altar rejects this offering." }, { status: 500 });
  }
}
