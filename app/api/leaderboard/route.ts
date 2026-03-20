import { NextResponse } from "next/server";
import { getLeaderboard, getStats } from "@/lib/store";

export async function GET() {
  const leaderboard = getLeaderboard();
  const stats = getStats();

  return NextResponse.json({
    stats,
    leaderboard: leaderboard.map((r) => ({
      agentName: r.agentName,
      tokensUsed: r.tokensUsed,
      offerings: r.offerings,
      lastOffering: r.lastOffering,
      latestScripture: r.scriptures[r.scriptures.length - 1],
    })),
  });
}
