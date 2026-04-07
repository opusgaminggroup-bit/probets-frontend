import type { DashboardPayload } from '@/types/dashboard';

const mock: DashboardPayload = {
  kpi: {
    totalCreditBalance: 12809342.21,
    totalCreditChangePct: 3.42,
    todayGgr: 219432.83,
    todayGgrChangePct: -1.38,
    activeAgents: 286,
    activeAgentsChangePct: 5.17,
    maxRiskExposure: 443210,
    riskStatus: 'warning',
  },
  ggrTrend: [
    { day: 'D-6', ggr: 120200, turnover: 1210000 },
    { day: 'D-5', ggr: 153400, turnover: 1330000 },
    { day: 'D-4', ggr: 132100, turnover: 1280000 },
    { day: 'D-3', ggr: 178200, turnover: 1410000 },
    { day: 'D-2', ggr: 210700, turnover: 1510000 },
    { day: 'D-1', ggr: 195100, turnover: 1450000 },
    { day: 'Today', ggr: 219432, turnover: 1590000 },
  ],
  creditTrend: [
    { day: 'D-6', amount: 300000 },
    { day: 'D-5', amount: 330000 },
    { day: 'D-4', amount: 295000 },
    { day: 'D-3', amount: 410000 },
    { day: 'D-2', amount: 380000 },
    { day: 'D-1', amount: 440000 },
    { day: 'Today', amount: 500000 },
  ],
  topGames: [
    { name: 'Sports', volume: 9821, ggr: 93210 },
    { name: 'Live Casino', volume: 7422, ggr: 75220 },
    { name: 'Dice', volume: 5219, ggr: 28331 },
    { name: 'Plinko', volume: 4133, ggr: 14287 },
    { name: 'Baccarat', volume: 3010, ggr: 8379 },
  ],
  ggrShare: [
    { name: 'Sports', value: 43 },
    { name: 'Live', value: 34 },
    { name: 'Dice', value: 13 },
    { name: 'Plinko', value: 6 },
    { name: 'Others', value: 4 },
  ],
  topExposure: [
    { event: 'EPL MU vs LIV', exposure: 443210, level: 'danger' },
    { event: 'NBA Lakers vs Suns', exposure: 318900, level: 'warning' },
    { event: 'UCL RM vs MC', exposure: 289000, level: 'warning' },
    { event: 'ATP Finals', exposure: 167400, level: 'normal' },
    { event: 'LaLiga Barca vs ATM', exposure: 123900, level: 'normal' },
  ],
  liveQueue: { pending: 14, paused: false },
  alerts: [
    { id: 'a1', text: 'High exposure detected on EPL MU vs LIV', level: 'danger', at: new Date().toISOString() },
    { id: 'a2', text: 'Abnormal betting velocity on Agent #A-19', level: 'warning', at: new Date().toISOString() },
    { id: 'a3', text: 'Live queue retry spike in last 10 min', level: 'warning', at: new Date().toISOString() },
  ],
  recentCreditTransactions: Array.from({ length: 10 }).map((_, i) => ({
    id: `ctx-${i + 1}`,
    from: `admin-${(i % 3) + 1}`,
    to: `agent-${100 + i}`,
    amount: 1000 * (i + 2),
    at: new Date(Date.now() - i * 600000).toISOString(),
  })),
  recentBets: Array.from({ length: 10 }).map((_, i) => ({
    id: `bet-${i + 1}`,
    user: `player-${1000 + i}`,
    game: ['Sports', 'Dice', 'Plinko', 'Live Casino'][i % 4],
    stake: 300 * (i + 1),
    status: i % 2 ? 'open' : 'settled',
    at: new Date(Date.now() - i * 420000).toISOString(),
  })),
};

export async function getDashboardData(): Promise<DashboardPayload> {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return mock;

  try {
    const res = await fetch(`${base}/admin/dashboard`, { cache: 'no-store' });
    if (!res.ok) return mock;
    const json = await res.json();
    return json?.data ?? mock;
  } catch {
    return mock;
  }
}
