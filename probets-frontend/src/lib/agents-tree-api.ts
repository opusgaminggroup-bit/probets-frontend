import api from './api';
import type { AgentTreeNode, AgentTreeResponse } from '@/types/agents-tree';

const mock: AgentTreeResponse = {
  roots: [
    {
      id: '1', username: 'admin_root', role: 'admin', creditBalance: 5000000, creditLimit: 9999999, parentId: null,
      children: [
        {
          id: '2', username: 'superagent_a', role: 'superagent', creditBalance: 1200000, creditLimit: 2500000, parentId: '1',
          children: [
            { id: '4', username: 'agent_a1', role: 'agent', creditBalance: 320000, creditLimit: 600000, parentId: '2', children: [
              { id: '7', username: 'player_a1_1', role: 'player', creditBalance: 12200, creditLimit: 50000, parentId: '4', children: [] },
            ] },
            { id: '5', username: 'agent_a2', role: 'agent', creditBalance: 220000, creditLimit: 400000, parentId: '2', children: [] },
          ],
        },
        {
          id: '3', username: 'superagent_b', role: 'superagent', creditBalance: 950000, creditLimit: 2200000, parentId: '1',
          children: [
            { id: '6', username: 'agent_b1', role: 'agent', creditBalance: 180000, creditLimit: 300000, parentId: '3', children: [] },
          ],
        },
      ],
    },
  ],
};

const countChildren = (n: AgentTreeNode): AgentTreeNode => ({
  ...n,
  childrenCount: n.children?.length ?? 0,
  children: (n.children ?? []).map(countChildren),
});

export async function getAgentsTree(scopeUserId?: string): Promise<AgentTreeResponse> {
  try {
    const res = await api.get('/admin/agents/tree', { params: scopeUserId ? { scopeUserId } : undefined });
    const data = res.data?.data ?? res.data;
    const roots = (Array.isArray(data) ? data : data?.roots ?? []).map(countChildren);
    return { roots };
  } catch {
    return { roots: mock.roots.map(countChildren) };
  }
}
