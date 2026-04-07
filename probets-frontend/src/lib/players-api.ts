import api from './api';
import type { BettingBehavior, CreditDistribution, PlayerDetail, PlayerRankingResponse } from '@/types/players';

const mockRanking = Array.from({ length: 100 }).map((_, i) => ({
  id: String(i + 1),
  username: `player_${i + 1}`,
  agentName: `agent_${(i % 8) + 1}`,
  superAgentName: `super_${(i % 3) + 1}`,
  totalBet: 5000 + (100 - i) * 1200,
  totalPnl: (i % 2 ? -1 : 1) * (200 + i * 17),
  netGgr: 700 + (100 - i) * 90,
  creditBalance: 1000 + (i % 20) * 450,
  lastActiveAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export async function getPlayersRanking(params: any): Promise<PlayerRankingResponse> {
  try {
    const res = await api.get('/admin/players/ranking', { params });
    return { items: res.data?.data ?? [], meta: res.data?.meta ?? { page: 1, limit: 20, total: 0 } };
  } catch {
    let items = [...mockRanking];
    if (params?.q) items = items.filter((x) => x.username.toLowerCase().includes(String(params.q).toLowerCase()));
    const start = (Number(params?.page ?? 1) - 1) * Number(params?.limit ?? 20);
    const limit = Number(params?.limit ?? 20);
    return { items: items.slice(start, start + limit), meta: { page: Number(params?.page ?? 1), limit, total: items.length } };
  }
}

export async function getPlayersCreditDistribution(days = 30): Promise<CreditDistribution> {
  try {
    const res = await api.get('/admin/players/credit-distribution', { params: { days } });
    return res.data?.data;
  } catch {
    return {
      buckets: [
        { label: '高信用', value: 18 },
        { label: '中信用', value: 39 },
        { label: '低信用', value: 27 },
        { label: '零信用', value: 16 },
      ],
      byAgent: Array.from({ length: 8 }).map((_, i) => ({ agent: `agent_${i + 1}`, totalCredit: 50000 + i * 18000 })),
      relation: mockRanking.slice(0, 40).map((p) => ({ credit: p.creditBalance, bet: p.totalBet, username: p.username })),
    };
  }
}

export async function getPlayersBettingBehavior(days = 30): Promise<BettingBehavior> {
  try {
    const res = await api.get('/admin/players/betting-behavior', { params: { days } });
    return res.data?.data;
  } catch {
    return {
      trend: Array.from({ length: 30 }).map((_, i) => ({ day: `D-${29 - i}`, totalBet: 120000 + (i % 7) * 22000 + i * 3000 })),
      activeTop: mockRanking.slice(0, 20).map((p, i) => ({ username: p.username, frequency: 60 - i, totalBet: p.totalBet })),
      gameShare: [
        { game: 'Sports', value: 42 },
        { game: 'Dice', value: 19 },
        { game: 'Plinko', value: 14 },
        { game: 'Live Casino', value: 25 },
      ],
    };
  }
}

export async function getPlayerDetail(id: string): Promise<PlayerDetail | null> {
  try {
    const res = await api.get(`/admin/players/${id}`);
    return res.data?.data ?? null;
  } catch {
    const p = mockRanking.find((x) => x.id === id);
    if (!p) return null;
    return {
      player: p,
      creditHistory: Array.from({ length: 10 }).map((_, i) => ({ id: `${id}-c${i}`, amount: (i % 2 ? 1 : -1) * (100 + i * 40), type: i % 2 ? 'ADD' : 'SUBTRACT', at: new Date(Date.now() - i * 3600000).toISOString() })),
      betHistory: Array.from({ length: 10 }).map((_, i) => ({ id: `${id}-b${i}`, game: ['Sports', 'Dice', 'Plinko', 'Live Casino'][i % 4], stake: 120 + i * 30, result: i % 2 ? 'win' : 'lose', at: new Date(Date.now() - i * 4600000).toISOString() })),
    };
  }
}
