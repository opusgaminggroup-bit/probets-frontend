export type AgentTreeNode = {
  id: string;
  username: string;
  role: string;
  creditBalance: number;
  creditLimit: number;
  childrenCount?: number;
  parentId?: string | null;
  children?: AgentTreeNode[];
};

export type AgentTreeResponse = {
  roots: AgentTreeNode[];
};
