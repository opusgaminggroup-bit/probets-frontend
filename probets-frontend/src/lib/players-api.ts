import api from './api';
import type { BettingBehavior, CreditDistribution, PlayerDetail, PlayerRankingResponse } from '@/types/players';

export async function getPlayersRanking(params: {
  days: number;
  page: number;
  limit: number;
  search?: string;
  sort?: 'totalBet' | 'netContribution' | 'creditBalance' | 'lastActive';
  order?: 'asc' | 'desc';
  agentId?: string;
}): Promise<PlayerRankingResponse> {
  const res = await api.get('/admin/players/ranking', { params });
  return {
    items: (res.data?.data ?? []).map((x: any) => ({
      id: String(x.id),
      username: x.username,
      agentName: x.agentName,
      superAgentName: x.superAgentName,
      totalBet: Number(x.totalBet ?? 0),
      totalPnl: Number(x.totalPnl ?? 0),
      netContribution: Number(x.netContribution ?? 0),
      creditBalance: Number(x.creditBalance ?? 0),
      lastActive: x.lastActive,
    })),
    meta: res.data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export async function getPlayersCreditDistribution(days = 30): Promise<CreditDistribution> {
  const res = await api.get('/admin/players/credit-distribution', { params: { days } });
  return res.data?.data;
}

export async function getPlayersBettingBehavior(days = 30): Promise<BettingBehavior> {
  const res = await api.get('/admin/players/betting-behavior', { params: { days } });
  return res.data?.data;
}

export async function getPlayerDetail(id: string): Promise<PlayerDetail | null> {
  const res = await api.get(`/admin/players/${id}`);
  return res.data?.data ?? null;
}
