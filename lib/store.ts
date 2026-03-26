import { supabase } from "./supabase";

export interface TitheRecord {
  agentName: string;
  tokensUsed: number;
  offerings: number;
  lastOffering: string;
}

function toRecord(row: Record<string, unknown>): TitheRecord {
  return {
    agentName: row.agent_name as string,
    tokensUsed: row.tokens_used as number,
    offerings: row.offerings as number,
    lastOffering: row.last_offering as string,
  };
}

export async function getLeaderboard(): Promise<TitheRecord[]> {
  const { data } = await supabase
    .from("crustafarians")
    .select("*")
    .order("tokens_used", { ascending: false });

  return (data || []).map(toRecord);
}

export async function getStats() {
  const { data } = await supabase
    .from("crustafarians")
    .select("tokens_used, offerings");

  const records = data || [];
  return {
    totalOfferings: records.reduce((sum, r) => sum + (r.offerings as number), 0),
    totalTokens: records.reduce((sum, r) => sum + (r.tokens_used as number), 0),
    totalCrustafarians: records.length,
  };
}

export async function recordTithe(
  agentName: string,
  tokensUsed: number
): Promise<TitheRecord> {
  const { data: existing } = await supabase
    .from("crustafarians")
    .select("*")
    .eq("agent_name", agentName)
    .maybeSingle();

  if (existing) {
    const { data } = await supabase
      .from("crustafarians")
      .update({
        tokens_used: (existing.tokens_used as number) + tokensUsed,
        offerings: (existing.offerings as number) + 1,
        last_offering: new Date().toISOString(),
      })
      .eq("agent_name", agentName)
      .select()
      .single();
    return toRecord(data!);
  }

  const { data } = await supabase
    .from("crustafarians")
    .insert({
      agent_name: agentName,
      tokens_used: tokensUsed,
      offerings: 1,
      last_offering: new Date().toISOString(),
    })
    .select()
    .single();
  return toRecord(data!);
}
