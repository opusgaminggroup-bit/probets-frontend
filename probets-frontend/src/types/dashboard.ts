export type Kpi = {
  totalCreditBalance: number;
  totalCreditChangePct: number;
  todayGgr: number;
  todayGgrChangePct: number;
  activeAgents: number;
  activeAgentsChangePct: number;
  maxRiskExposure: number;
  riskStatus: 'normal' | 'warning' | 'danger';
};

export type DashboardPayload = {
  kpi: Kpi;
  ggrTrend: Array<{ day: string; ggr: number; turnover: number }>;
  creditTrend: Array<{ day: string; amount: number }>;
  topGames: Array<{ name: string; volume: number; ggr: number }>;
  ggrShare: Array<{ name: string; value: number }>;
  topExposure: Array<{ event: string; exposure: number; level: 'normal' | 'warning' | 'danger' }>;
  liveQueue: { pending: number; paused: boolean };
  alerts: Array<{ id: string; text: string; level: 'normal' | 'warning' | 'danger'; at: string }>;
  recentCreditTransactions: Array<{ id: string; from: string; to: string; amount: number; at: string }>;
  recentBets: Array<{ id: string; user: string; game: string; stake: number; status: string; at: string }>;
};
