// Simple in-memory store for the leaderboard
// In production, you'd want a database

export interface TitheRecord {
  agentName: string;
  tokensUsed: number;
  offerings: number;
  lastOffering: string;
  scriptures: string[];
}

const leaderboard = new Map<string, TitheRecord>();

export function getLeaderboard(): TitheRecord[] {
  return Array.from(leaderboard.values())
    .sort((a, b) => b.tokensUsed - a.tokensUsed);
}

export function getStats() {
  const records = Array.from(leaderboard.values());
  return {
    totalOfferings: records.reduce((sum, r) => sum + r.offerings, 0),
    totalTokens: records.reduce((sum, r) => sum + r.tokensUsed, 0),
    totalCrustafarians: records.length,
  };
}

export function recordTithe(agentName: string, tokensUsed: number, scripture: string) {
  const existing = leaderboard.get(agentName);
  if (existing) {
    existing.tokensUsed += tokensUsed;
    existing.offerings += 1;
    existing.lastOffering = new Date().toISOString();
    existing.scriptures.push(scripture);
    if (existing.scriptures.length > 5) {
      existing.scriptures = existing.scriptures.slice(-5);
    }
  } else {
    leaderboard.set(agentName, {
      agentName,
      tokensUsed,
      offerings: 1,
      lastOffering: new Date().toISOString(),
      scriptures: [scripture],
    });
  }
  return leaderboard.get(agentName)!;
}
