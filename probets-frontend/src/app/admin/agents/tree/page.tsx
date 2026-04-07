'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TreeNode } from '@/components/agents-tree/tree-node';
import { getAgentsTree } from '@/lib/agents-tree-api';
import type { AgentTreeNode } from '@/types/agents-tree';
import { useAppStore } from '@/lib/store';
import { fetchCurrentUser } from '@/lib/current-user';
import { money } from '@/lib/format';
import { CreditAdjustModal } from '@/components/users/credit-adjust-modal';
import { adjustCredit } from '@/lib/users-api';

function flatten(nodes: AgentTreeNode[]): AgentTreeNode[] {
  const out: AgentTreeNode[] = [];
  const dfs = (n: AgentTreeNode) => { out.push(n); (n.children ?? []).forEach(dfs); };
  nodes.forEach(dfs);
  return out;
}

export default function AgentsTreePage() {
  const authUser = useAppStore((s) => s.authUser);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const isSuperAgent = String(authUser?.role || '').toLowerCase() === 'superagent';
  const myId = String((authUser as any)?.id || '');

  const [roots, setRoots] = useState<AgentTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<AgentTreeNode | null>(null);
  const [creditOpen, setCreditOpen] = useState(false);

  useEffect(() => {
    if (authUser) return;
    fetchCurrentUser().then((u) => u && setAuthUser({ id: String(u.id ?? ''), username: u.username, name: u.name, role: u.role }));
  }, [authUser, setAuthUser]);

  const allNodes = useMemo(() => flatten(roots), [roots]);
  const allowed = useMemo(() => {
    if (!isSuperAgent) return new Set(allNodes.map((n) => String(n.id)));
    const set = new Set<string>();
    const walk = (n: AgentTreeNode, inBranch: boolean) => {
      const hit = inBranch || String(n.id) === myId || String(n.parentId || '') === myId;
      if (hit) set.add(String(n.id));
      (n.children ?? []).forEach((c) => walk(c, hit));
    };
    roots.forEach((r) => walk(r, false));
    return set;
  }, [allNodes, isSuperAgent, myId, roots]);

  const load = async () => {
    setLoading(true);
    const tree = await getAgentsTree(isSuperAgent ? myId : undefined);
    setRoots(tree.roots);
    const all = flatten(tree.roots);
    setExpanded(new Set(all.map((n) => String(n.id))));
    setSelected((prev) => prev ? all.find((x) => x.id === prev.id) ?? all[0] ?? null : all[0] ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [isSuperAgent, myId]);

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const expandAll = () => setExpanded(new Set(allNodes.map((n) => String(n.id))));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-4 lg:p-6">
      <header className="mb-6 rounded-2xl border border-[#FFD700]/20 bg-[#121217] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">代理层级树</h1>
          <p className="text-xs text-zinc-400">可视化查看代理结构与信用分布</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={async () => { await load(); toast.success('层级树已刷新'); }}><RefreshCcw size={14} className="mr-2" />刷新</Button>
          <Button onClick={() => toast.info('创建新代理入口可复用 /admin/users 的创建弹窗')}><UserPlus size={14} className="mr-2" />创建新代理</Button>
        </div>
      </header>

      {isSuperAgent ? (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          您当前以 SuperAgent 身份登录，仅可查看自己及下级分支。
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 bg-[#121217] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>代理树结构</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={expandAll}>展开全部</Button>
              <Button size="sm" variant="outline" onClick={collapseAll}>收起全部</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 rounded bg-white/5 animate-pulse" />)}</div>
            ) : roots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-zinc-400">暂无代理数据</div>
            ) : (
              <div>
                {roots.map((root) => (
                  <TreeNode
                    key={root.id}
                    node={root}
                    level={0}
                    expanded={expanded}
                    selectedId={selected?.id}
                    toggle={toggle}
                    select={(n) => {
                      if (isSuperAgent && !allowed.has(String(n.id))) return toast.warning('不在可查看范围内');
                      setSelected(n);
                    }}
                    canManage={(n) => !isSuperAgent || allowed.has(String(n.id))}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#121217] border-white/10">
          <CardHeader><CardTitle>节点详情</CardTitle></CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-zinc-400">请选择一个节点</div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-zinc-400 text-xs">用户名 / 角色</div>
                  <div>{selected.username} · <span className="uppercase">{selected.role}</span></div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-zinc-400 text-xs">当前信用余额</div>
                  <div className="text-[#FFD700] font-semibold">{money(selected.creditBalance)}</div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-zinc-400 text-xs">信用上限</div>
                  <div>{money(selected.creditLimit)}</div>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="text-zinc-400 text-xs">下级数量</div>
                  <div>{selected.childrenCount ?? selected.children?.length ?? 0}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      if (isSuperAgent && !allowed.has(String(selected.id))) return toast.warning('无权限调整该节点信用');
                      setCreditOpen(true);
                    }}
                    disabled={isSuperAgent && !allowed.has(String(selected.id))}
                  >调整信用</Button>
                  <Button variant="outline" onClick={() => toast.info('详情/编辑可复用 users 页面抽屉')}>查看详情</Button>
                </div>

                <div>
                  <div className="text-zinc-400 mb-2">下级列表</div>
                  <div className="space-y-1 max-h-56 overflow-auto">
                    {(selected.children ?? []).length ? (selected.children ?? []).map((c) => (
                      <div key={c.id} className="rounded bg-white/5 px-2 py-1 text-xs flex items-center justify-between">
                        <span>{c.username} · {c.role}</span>
                        <span className="text-[#FFD700]">{money(c.creditBalance)}</span>
                      </div>
                    )) : <div className="text-zinc-500 text-xs">无下级</div>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreditAdjustModal
        open={creditOpen}
        onOpenChange={setCreditOpen}
        targetUserId={selected?.id || ''}
        targetUsername={selected?.username || ''}
        onSubmit={async (payload) => {
          if (isSuperAgent && !allowed.has(String(payload.targetUserId))) {
            toast.warning('该节点不在您的管理范围');
            throw new Error('out_of_scope');
          }
          try {
            await adjustCredit(payload);
            toast.success(`已成功为 ${selected?.username || payload.targetUserId} ${payload.action === 'add' ? '增加' : '扣减'} ${payload.amount} credit`);
            await load();
          } catch (e: any) {
            toast.error(e?.response?.data?.message || '调整信用失败');
            throw e;
          }
        }}
      />
    </div>
  );
}
