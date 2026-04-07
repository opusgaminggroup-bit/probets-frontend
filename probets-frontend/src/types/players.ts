export type PlayerRankingRow = {
  id: string;
  username: string;
  agentName: string;
  superAgentName: string;
  totalBet: number;
  totalPnl: number;
  netGgr: number;
  creditBalance: number;
  lastActiveAt: string;
};

export type PlayerRankingResponse = {
  items: PlayerRankingRow[];
  meta: { page: number; limit: number; total: number };
};

export type CreditDistribution = {
  buckets: Array<{ label: string; value: number }>;
  byAgent: Array<{ agent: string; totalCredit: number }>;
  relation: Array<{ credit: number; bet: number; username: string }>;
};

export type BettingBehavior = {
  trend: Array<{ day: string; totalBet: number }>;
  activeTop: Array<{ username: string; frequency: number; totalBet: number }>;
  gameShare: Array<{ game: string; value: number }>;
};

export type PlayerDetail = {
  player: PlayerRankingRow;
  creditHistory: Array<{ id: string; amount: number; type: string; at: string }>;
  betHistory: Array<{ id: string; game: string; stake: number; result: string; at: string }>;
};
