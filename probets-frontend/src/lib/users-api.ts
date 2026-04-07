import api from './api';
import type { AdminUser, UserDetail } from '@/types/users';

type Query = {
  page: number;
  limit: number;
  role?: string;
  parentId?: string;
  status?: string;
  q?: string;
  minCredit?: string;
  maxCredit?: string;
};

const mockUsers: AdminUser[] = Array.from({ length: 42 }).map((_, i) => ({
  id: String(i + 1),
  username: `user_${i + 1}`,
  name: `User ${i + 1}`,
  role: i % 7 === 0 ? 'superagent' : i % 3 === 0 ? 'agent' : 'player',
  parentId: i > 5 ? '2' : null,
  parentName: i > 5 ? 'agent_hub' : null,
  creditBalance: 1000 + i * 533,
  creditLimit: 10000 + i * 1000,
  isActive: i % 5 !== 0,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export async function getUsers(query: Query, scopeParentId?: string) {
  try {
    const params: any = { ...query };
    if (scopeParentId) params.scopeParentId = scopeParentId;
    const res = await api.get('/admin/users', { params });
    return {
      items: (res.data?.data ?? []) as AdminUser[],
      meta: res.data?.meta ?? { page: query.page, limit: query.limit, total: (res.data?.data ?? []).length },
    };
  } catch {
    const filtered = mockUsers.filter((u) => {
      if (query.role && query.role !== 'all' && u.role !== query.role) return false;
      if (query.status === 'enabled' && !u.isActive) return false;
      if (query.status === 'disabled' && u.isActive) return false;
      if (query.q && !u.username.toLowerCase().includes(query.q.toLowerCase())) return false;
      if (scopeParentId && u.parentId !== scopeParentId && u.id !== scopeParentId) return false;
      return true;
    });
    const start = (query.page - 1) * query.limit;
    return {
      items: filtered.slice(start, start + query.limit),
      meta: { page: query.page, limit: query.limit, total: filtered.length },
    };
  }
}

export async function getUserDetail(id: string): Promise<UserDetail | null> {
  try {
    const res = await api.get(`/admin/users/${id}`);
    return res.data?.data ?? null;
  } catch {
    const user = mockUsers.find((x) => x.id === id);
    if (!user) return null;
    return {
      user,
      children: mockUsers.filter((u) => u.parentId === id).slice(0, 10).map((u) => ({ id: u.id, username: u.username, role: u.role, creditBalance: u.creditBalance })),
      recentCreditTx: Array.from({ length: 10 }).map((_, i) => ({ id: `${id}-tx-${i}`, amount: 200 * (i + 1), type: i % 2 ? 'ADD_CREDIT' : 'SUBTRACT_CREDIT', at: new Date(Date.now() - i * 3600000).toISOString() })),
      recentBets: Array.from({ length: 10 }).map((_, i) => ({ id: `${id}-bet-${i}`, game: ['Sports', 'Dice', 'Live Casino'][i % 3], stake: 80 * (i + 1), status: i % 2 ? 'open' : 'settled', at: new Date(Date.now() - i * 5400000).toISOString() })),
    };
  }
}

export async function createUser(payload: any) {
  return api.post('/admin/users', payload);
}

export async function updateUser(id: string, payload: any) {
  return api.patch(`/admin/users/${id}`, payload);
}

export async function adjustCredit(payload: {
  targetUserId: string;
  action: 'add' | 'subtract';
  amount: number;
  remark?: string;
}) {
  return api.post('/credit/adjust', {
    operatorId: 'self',
    ...payload,
  });
}
