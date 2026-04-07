export type GgrOverview = {
  totalGgr: number;
  todayGgr: number;
  wow: number;
  totalStake: number;
  totalBets: number;
};

export type GgrReportData = {
  overview: GgrOverview;
  trend: Array<{ date: string; totalStake: number; ggr: number }>;
  weekly: Array<{ period: string; ggr: number }>;
  gameBreakdown: Array<{ game: string; totalStake: number; ggr: number; rtp: number; winRate: number; betCount: number }>;
  agentContribution: Array<{ agentId: string; agentName: string; ggr: number; contributionRatio: number; playersCount: number }>;
};
