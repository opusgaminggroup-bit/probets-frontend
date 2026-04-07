export type AdminUser = {
  id: string;
  username: string;
  name?: string;
  role: 'admin' | 'superagent' | 'agent' | 'player' | string;
  parentId?: string | null;
  parentName?: string | null;
  creditBalance: number;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
};

export type UserDetail = {
  user: AdminUser;
  children: Array<{ id: string; username: string; role: string; creditBalance: number }>;
  recentCreditTx: Array<{ id: string; amount: number; type: string; at: string }>;
  recentBets: Array<{ id: string; game: string; stake: number; status: string; at: string }>;
};
