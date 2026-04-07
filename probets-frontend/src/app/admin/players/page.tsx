'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCcw, Search } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { money, num, time } from '@/lib/format';
import { fetchCurrentUser } from '@/lib/current-user';
import { useAppStore } from '@/lib/store';
import { getPlayerDetail, getPlayersBettingBehavior, getPlayersCreditDistribution, getPlayersRanking } from '@/lib/players-api';
import type { BettingBehavior, CreditDistribution, PlayerDetail, PlayerRankingRow } from '@/types/players';

const tabs = ['ranking', 'credit-distribution', 'betting-behavior'] as const;

export default function PlayersAnalysisPage() {
  const authUser = useAppStore((s) => s.authUser);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const isSuperAgent = String(authUser?.role || '').toLowerCase() === 'superagent';

  const [tab, setTab] = useState<(typeof tabs)[number]>('ranking');
  const [range, setRange] = useState('30');
  const [q, setQ] = useState('');

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PlayerRankingRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'totalBet' | 'netContribution' | 'creditBalance' | 'lastActive'>('totalBet');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [creditDist, setCreditDist] = useState<CreditDistribution | null>(null);
  const [behavior, setBehavior] = useState<BettingBehavior | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<PlayerDetail | null>(null);

  useEffect(() => {
    if (authUser) return;
    fetchCurrentUser().then((u) => u && setAuthUser({ id: String(u.id ?? ''), username: u.username, name: u.name, role: u.role }));
  }, [authUser, setAuthUser]);

  const load = async () => {
    setLoading(true);
    const [ranking, dist, beh] = await Promise.all([
      getPlayersRanking({
        days: Number(range),
        page,
        limit,
        search: q || undefined,
        sort: sortBy,
        order: sortDir,
        agentId: isSuperAgent ? String((authUser as any)?.id || '') : undefined,
      }),
      getPlayersCreditDistribution(Number(range)),
      getPlayersBettingBehavior(Number(range)),
    ]);
    const items = [...ranking.items];
    setRows(items);
    setTotal(Number(ranking.meta.total || items.length));
    setCreditDist(dist);
    setBehavior(beh);
    setLoading(false);
  };

  useEffect(() => { load(); }, [range, page, limit, sortBy, sortDir, authUser?.id, isSuperAgent]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    const d = await getPlayerDetail(id);
    setDetail(d);
  };

  const exportCsv = () => {
    const header = ['rank', 'username', 'agent', 'superAgent', 'totalBet', 'totalPnl', 'netContribution', 'creditBalance', 'lastActive'];
    const lines = rows.map((r, i) => [
      String((page - 1) * limit + i + 1),
      r.username,
      r.agentName,
      r.superAgentName,
      r.totalBet,
      r.totalPnl,
      r.netContribution,
      r.creditBalance,
      r.lastActive,
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'players-ranking.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-4 lg:p-6">
      <header className="mb-4 rounded-2xl border border-[#FFD700]/20 bg-[#121217] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">会员分析</h1>
          <p className="text-xs text-zinc-400">Ranking / 信用分布 / 投注行为</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => { setPage(1); setRange(e.target.value); }} className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm">
            <option value="1">Today</option><option value="7">7天</option><option value="30">30天</option><option value="90">自定义(90)</option>
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={async (e) => { if (e.key === 'Enter') { setPage(1); await load(); } }} placeholder="搜索会员用户名" className="rounded-lg bg-black/40 border border-white/15 pl-8 pr-3 py-2 text-sm" />
          </div>
          <Button variant="outline" onClick={async () => { await load(); toast.success('会员分析已刷新'); }}><RefreshCcw size={14} className="mr-2" />刷新</Button>
          <Button onClick={exportCsv}><Download size={14} className="mr-2" />导出</Button>
        </div>
      </header>

      {isSuperAgent ? (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          您当前以 SuperAgent 身份登录，仅可查看自己下级 Agent 所管理的会员数据。
        </div>
      ) : null}

      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm border ${tab === t ? 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]' : 'bg-white/5 border-white/10 text-zinc-300'}`}>
            {t === 'ranking' ? '会员排行榜' : t === 'credit-distribution' ? '会员信用分布' : '会员投注行为'}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="bg-[#121217] border-white/10"><CardContent className="pt-6 space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-10 rounded bg-white/5 animate-pulse" />)}</CardContent></Card>
      ) : tab === 'ranking' ? (
        <Card className="bg-[#121217] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>会员排行榜</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded bg-black/40 border border-white/15 px-2 py-1">
                <option value="totalBet">总投注</option>
                <option value="netContribution">净贡献</option>
                <option value="creditBalance">信用余额</option>
                <option value="lastActive">最近活跃</option>
              </select>
              <button onClick={() => setSortDir((x) => x === 'asc' ? 'desc' : 'asc')} className="rounded bg-black/40 border border-white/15 px-2 py-1">{sortDir}</button>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-zinc-400">暂无会员数据</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-zinc-400 border-b border-white/10">
                    <tr>
                      <th className="text-left py-2">排名</th><th className="text-left">会员</th><th className="text-left">Agent</th><th className="text-left">SuperAgent</th><th className="text-right">总投注</th><th className="text-right">总输赢</th><th className="text-right">净贡献(GGR)</th><th className="text-right">信用余额</th><th className="text-left">最近活跃</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const rank = (page - 1) * limit + i + 1;
                      return (
                        <tr key={r.id} onClick={() => openDetail(r.id)} className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${rank <= 10 ? 'bg-[#FFD700]/6' : ''}`}>
                          <td className="py-2 font-semibold">{rank}</td>
                          <td>{r.username}</td>
                          <td>{r.agentName}</td>
                          <td>{r.superAgentName}</td>
                          <td className="text-right">{money(r.totalBet)}</td>
                          <td className={`text-right ${r.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(r.totalPnl)}</td>
                          <td className="text-right text-[#FFD700]">{money(r.netContribution)}</td>
                          <td className="text-right">{money(r.creditBalance)}</td>
                          <td>{time(r.lastActive)}</td>
                        </tr>
                      );
                    })}
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
      ) : tab === 'credit-distribution' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-[#121217] border-white/10"><CardHeader><CardTitle>信用余额分布</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={creditDist?.buckets || []} dataKey="value" nameKey="label" outerRadius={95}>{(creditDist?.buckets || []).map((_, i) => <Cell key={i} fill={['#FFD700','#33d17a','#3b82f6','#6b7280'][i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card className="bg-[#121217] border-white/10"><CardHeader><CardTitle>按 Agent 分组信用总额</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={creditDist?.byAgent || []}><CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" /><XAxis dataKey="agent" stroke="#a1a1aa" /><YAxis stroke="#a1a1aa" /><Tooltip /><Bar dataKey="totalCredit" fill="#FFD700" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></CardContent></Card>
          <Card className="bg-[#121217] border-white/10 xl:col-span-2"><CardHeader><CardTitle>信用与投注关系（散点）</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" /><XAxis dataKey="credit" name="credit" stroke="#a1a1aa" /><YAxis dataKey="bet" name="bet" stroke="#a1a1aa" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter data={creditDist?.relation || []} fill="#33d17a" /></ScatterChart></ResponsiveContainer></CardContent></Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-[#121217] border-white/10 xl:col-span-2"><CardHeader><CardTitle>最近30天会员总投注趋势</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={behavior?.trend || []}><CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" /><XAxis dataKey="day" stroke="#a1a1aa" /><YAxis stroke="#a1a1aa" /><Tooltip /><Line dataKey="totalBet" stroke="#FFD700" strokeWidth={3} /></LineChart></ResponsiveContainer></CardContent></Card>
          <Card className="bg-[#121217] border-white/10"><CardHeader><CardTitle>活跃会员 Top 20</CardTitle></CardHeader><CardContent className="space-y-1 text-sm max-h-80 overflow-auto">{(behavior?.activeTop || []).map((p, i) => <div key={p.username} className="rounded bg-white/5 px-2 py-1 flex justify-between"><span>{i+1}. {p.username}</span><span>{num(p.frequency)} 次 · {money(p.totalBet)}</span></div>)}</CardContent></Card>
          <Card className="bg-[#121217] border-white/10"><CardHeader><CardTitle>游戏类型投注占比</CardTitle></CardHeader><CardContent className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={behavior?.gameShare || []} dataKey="value" nameKey="game" outerRadius={100}>{(behavior?.gameShare || []).map((_, i) => <Cell key={i} fill={['#FFD700','#3b82f6','#33d17a','#f97316'][i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
        </div>
      )}

      <Drawer open={detailOpen} onOpenChange={setDetailOpen} title="会员详情">
        {!detail ? (
          <div className="h-20 rounded bg-white/5 animate-pulse" />
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-white/5 p-2">会员: {detail.player.username}</div>
              <div className="rounded bg-white/5 p-2">所属Agent: {detail.player.agentName}</div>
              <div className="rounded bg-white/5 p-2">信用余额: <span className="text-[#FFD700]">{money(detail.player.creditBalance)}</span></div>
              <div className="rounded bg-white/5 p-2">最近活跃: {detail.betHistory?.[0]?.at ? time(detail.betHistory[0].at) : '-'}</div>
            </div>
            <div>
              <h3 className="text-[#FFD700] mb-2">信用历史</h3>
              <div className="space-y-1">{detail.creditHistory.map((x) => <div key={x.id} className="rounded bg-white/5 px-2 py-1">{x.type} · {money(x.amount)} · {time(x.at)}</div>)}</div>
            </div>
            <div>
              <h3 className="text-[#FFD700] mb-2">投注记录</h3>
              <div className="space-y-1">{detail.betHistory.map((x) => <div key={x.id} className="rounded bg-white/5 px-2 py-1">{x.game} · {money(x.stake)} · {x.result} · {time(x.at)}</div>)}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
