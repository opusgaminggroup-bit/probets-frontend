export type PlayerRankingRow = {
  id: string;
  username: string;
  agentName: string;
  superAgentName: string;
  totalBet: number;
  totalPnl: number;
  netContribution: number;
  creditBalance: number;
  lastActive: string;
};

export type PlayerRankingResponse = {
  items: PlayerRankingRow[];
  meta: { page: number; limit: number; total: number; totalPages?: number };
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
  player: {
    id: string;
    username: string;
    agentName: string;
    superAgentName: string;
    creditBalance: number;
  };
  creditHistory: Array<{ id: string; amount: number; type: string; remark?: string; at: string }>;
  betHistory: Array<{ id: string; betNo?: string; game: string; stake: number; payout?: number; result: string; at: string }>;
};
