'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCcw, Eye, Pencil, UserPlus, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { UserCreateModal } from '@/components/users/user-create-modal';
import { CreditAdjustModal } from '@/components/users/credit-adjust-modal';
import { clearToken } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import { fetchCurrentUser } from '@/lib/current-user';
import { adjustCredit, createUser, getUserDetail, getUsers, updateUser } from '@/lib/users-api';
import type { AdminUser, UserDetail } from '@/types/users';
import { money, time } from '@/lib/format';

const roles = ['all', 'admin', 'superagent', 'agent', 'player'];

export default function AdminUsersPage() {
  const router = useRouter();
  const authUser = useAppStore((s) => s.authUser);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [parentId, setParentId] = useState('');
  const [minCredit, setMinCredit] = useState('');
  const [maxCredit, setMaxCredit] = useState('');
  const [sortBy, setSortBy] = useState<'username' | 'creditBalance' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditTarget, setCreditTarget] = useState<{ id: string; username?: string }>({ id: '' });

  const scopeParentId = authUser?.role === 'superagent' ? (authUser as any)?.id || undefined : undefined;

  const load = async () => {
    setLoading(true);
    const res = await getUsers({ page, limit, role, status, parentId, q, minCredit, maxCredit }, scopeParentId);
    let sorted = [...res.items];
    sorted.sort((a: any, b: any) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    setItems(sorted);
    setTotal(Number(res.meta?.total ?? sorted.length));
    setLoading(false);
  };

  useEffect(() => {
    if (authUser) return;
    fetchCurrentUser().then((u) => u && setAuthUser(u));
  }, [authUser, setAuthUser]);

  useEffect(() => { load(); }, [page, limit, role, status, parentId, sortBy, sortDir]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const viewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
    const d = await getUserDetail(id);
    setDetail(d);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-4 lg:p-6">
      <header className="mb-6 rounded-2xl border border-[#FFD700]/20 bg-[#121217] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">用户管理</h1>
          <p className="text-xs text-zinc-400">管理代理层级、信用上限、状态与账户详情</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#8a6a00] text-black font-bold grid place-items-center">{(authUser?.name?.[0] || authUser?.username?.[0] || 'A').toUpperCase()}</div>
            <div className="leading-tight">
              <div className="text-sm">{authUser?.name || authUser?.username || 'Admin'}</div>
              <div className="text-[11px] uppercase text-zinc-400">{String(authUser?.role || 'admin')}</div>
            </div>
          </div>
          <Button variant="outline" onClick={load}><RefreshCcw size={14} className="mr-2" />刷新</Button>
          <Button onClick={() => setCreateOpen(true)}><UserPlus size={14} className="mr-2" />创建用户</Button>
          <Button variant="outline" onClick={() => { clearToken(); router.replace('/admin/login'); }}><LogOut size={14} className="mr-2" />退出</Button>
        </div>
      </header>

      <Card className="mb-4 bg-[#121217] border-white/10">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-2">
          <div className="xl:col-span-2 relative">
            <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索用户名" className="w-full rounded-lg bg-black/40 border border-white/15 pl-9 pr-3 py-2 text-sm" />
          </div>
          <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }} className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm">{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm">
            <option value="all">all status</option>
            <option value="enabled">enabled</option>
            <option value="disabled">disabled</option>
          </select>
          <input value={parentId} onChange={(e) => setParentId(e.target.value)} placeholder="parentId" className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input value={minCredit} onChange={(e) => setMinCredit(e.target.value)} placeholder="min" className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm" />
            <input value={maxCredit} onChange={(e) => setMaxCredit(e.target.value)} placeholder="max" className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#121217] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户列表</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <span>排序:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded bg-black/40 border border-white/15 px-2 py-1">
              <option value="createdAt">createdAt</option>
              <option value="username">username</option>
              <option value="creditBalance">creditBalance</option>
            </select>
            <button className="rounded bg-black/40 border border-white/15 px-2 py-1" onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}>{sortDir}</button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: limit }).map((_, i) => <div key={i} className="h-10 rounded bg-white/5 animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-zinc-400">暂无用户数据</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-white/10">
                  <tr>
                    <th className="text-left py-2">用户名</th><th className="text-left">角色</th><th className="text-left">上级代理</th><th className="text-right">信用余额</th><th className="text-right">信用上限</th><th className="text-center">状态</th><th className="text-left">创建时间</th><th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2">{u.username}</td>
                      <td>{u.role}</td>
                      <td>{u.parentName || u.parentId || '-'}</td>
                      <td className="text-right">{money(Number(u.creditBalance || 0))}</td>
                      <td className="text-right">{money(Number(u.creditLimit || 0))}</td>
                      <td className="text-center"><span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{u.isActive ? '启用' : '禁用'}</span></td>
                      <td>{time(u.createdAt)}</td>
                      <td className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => viewDetail(u.id)}><Eye size={12} /></Button>
                          <Button size="sm" variant="outline" onClick={async () => { await updateUser(u.id, { isActive: !u.isActive }); await load(); }}><Pencil size={12} /></Button>
                          <Button size="sm" onClick={() => { setCreditTarget({ id: u.id, username: u.username }); setCreditOpen(true); }}>+/-信用</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-zinc-400">共 {total} 条</div>
            <div className="flex items-center gap-2">
              <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} className="rounded bg-black/40 border border-white/15 px-2 py-1 text-xs">
                <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>上一页</Button>
              <span className="text-xs">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>下一页</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Drawer open={detailOpen} onOpenChange={setDetailOpen} title="用户详情">
        {!detail ? <div className="h-20 rounded bg-white/5 animate-pulse" /> : (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 p-3"><div className="text-zinc-400 text-xs">用户名</div><div>{detail.user.username}</div></div>
              <div className="rounded-lg bg-white/5 p-3"><div className="text-zinc-400 text-xs">角色</div><div>{detail.user.role}</div></div>
              <div className="rounded-lg bg-white/5 p-3"><div className="text-zinc-400 text-xs">信用余额</div><div>{money(detail.user.creditBalance)}</div></div>
              <div className="rounded-lg bg-white/5 p-3"><div className="text-zinc-400 text-xs">信用上限</div><div>{money(detail.user.creditLimit)}</div></div>
            </div>

            <div>
              <h3 className="text-[#FFD700] mb-2">下级代理</h3>
              <div className="space-y-1">
                {detail.children.length ? detail.children.map((c) => <div key={c.id} className="rounded bg-white/5 px-3 py-2">{c.username} · {c.role} · {money(c.creditBalance)}</div>) : <div className="text-zinc-500">无下级</div>}
              </div>
            </div>

            <div>
              <h3 className="text-[#FFD700] mb-2">最近10笔信用流水</h3>
              <div className="space-y-1">
                {detail.recentCreditTx.map((t) => <div key={t.id} className="rounded bg-white/5 px-3 py-2">{t.type} · {money(t.amount)} · {time(t.at)}</div>)}
              </div>
            </div>

            <div>
              <h3 className="text-[#FFD700] mb-2">最近10笔投注</h3>
              <div className="space-y-1">
                {detail.recentBets.map((b) => <div key={b.id} className="rounded bg-white/5 px-3 py-2">{b.game} · {money(b.stake)} · {b.status} · {time(b.at)}</div>)}
              </div>
            </div>

            <Button onClick={() => { setCreditTarget({ id: detail.user.id, username: detail.user.username }); setCreditOpen(true); }}>调整信用</Button>
          </div>
        )}
      </Drawer>

      <UserCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (payload) => {
          await createUser(payload);
          await load();
        }}
      />

      <CreditAdjustModal
        open={creditOpen}
        onOpenChange={setCreditOpen}
        targetUserId={creditTarget.id}
        targetUsername={creditTarget.username}
        onSubmit={async (payload) => {
          await adjustCredit(payload);
          await load();
          if (selectedId) {
            const d = await getUserDetail(selectedId);
            setDetail(d);
          }
        }}
      />
    </div>
  );
}
