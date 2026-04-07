'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, LogOut, PauseCircle, RefreshCcw, ShieldAlert, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/dialog';
import { DashboardSkeleton } from '@/components/dashboard/skeleton-dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { getDashboardData } from '@/lib/dashboard-api';
import { money, num, time } from '@/lib/format';
import type { DashboardPayload } from '@/types/dashboard';

const pieColors = ['#FFD700', '#33d17a', '#3b82f6', '#f97316', '#a855f7'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [site, setSite] = useState('probet-a');
  const [openCreditModal, setOpenCreditModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getDashboardData();
    setData(res);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const riskTone = useMemo(() => {
    if (!data) return 'warn' as const;
    if (data.kpi.riskStatus === 'danger') return 'bad' as const;
    if (data.kpi.riskStatus === 'warning') return 'warn' as const;
    return 'good' as const;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      <div className="flex">
        <aside className="hidden lg:flex w-64 min-h-screen border-r border-[#FFD700]/15 bg-[#111114] flex-col">
          <div className="p-6 border-b border-[#FFD700]/15">
            <div className="text-xl font-bold tracking-wide text-[#FFD700]">PROBETS Admin</div>
            <div className="text-xs text-zinc-400 mt-1">Credit Casino Control</div>
          </div>
          <nav className="p-4 space-y-2 text-sm">
            <div className="rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 px-4 py-3">Dashboard</div>
            <div className="rounded-xl hover:bg-white/5 px-4 py-3 text-zinc-300">Users</div>
            <div className="rounded-xl hover:bg-white/5 px-4 py-3 text-zinc-300">Credit</div>
            <div className="rounded-xl hover:bg-white/5 px-4 py-3 text-zinc-300">Sports</div>
            <div className="rounded-xl hover:bg-white/5 px-4 py-3 text-zinc-300">Live Casino</div>
            <div className="rounded-xl hover:bg-white/5 px-4 py-3 text-zinc-300">Payments</div>
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <header className="mb-6 rounded-2xl border border-[#FFD700]/20 bg-[#121217] px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">PROBETS Admin - Dashboard</h1>
              <p className="text-xs text-zinc-400">实时监控 / 风险控制 / 代理信用管理</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="rounded-lg bg-[#0e0e12] border border-[#FFD700]/30 px-3 py-2 text-sm"
              >
                <option value="probet-a">probet-a</option>
                <option value="probet-b">probet-b</option>
              </select>
              <Button variant="outline" onClick={() => setAutoRefresh((v) => !v)}>
                30s {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button variant="outline" onClick={load}><RefreshCcw size={14} className="mr-2" />刷新</Button>
              <Button variant="outline"><LogOut size={14} className="mr-2" />退出</Button>
            </div>
          </header>

          {loading || !data ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-6">
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard title="总信用余额" value={money(data.kpi.totalCreditBalance)} change={data.kpi.totalCreditChangePct} tone="good" subtitle="今日变化" />
                <KpiCard title="今日 GGR" value={money(data.kpi.todayGgr)} change={data.kpi.todayGgrChangePct} tone={data.kpi.todayGgr >= 0 ? 'good' : 'bad'} subtitle="vs 昨日" />
                <KpiCard title="活跃 Agent" value={num(data.kpi.activeAgents)} change={data.kpi.activeAgentsChangePct} tone="good" subtitle="环比" />
                <KpiCard title="风险暴露" value={money(data.kpi.maxRiskExposure)} tone={riskTone} subtitle={`状态: ${data.kpi.riskStatus}`} />
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="border-[#FFD700]/20 bg-[#131318]">
                  <CardHeader><CardTitle>7天 GGR 趋势</CardTitle></CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.ggrTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" />
                        <XAxis dataKey="day" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" />
                        <Tooltip />
                        <Bar dataKey="turnover" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="ggr" stroke="#FFD700" strokeWidth={3} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#33d17a]/30 bg-[#131318]">
                  <CardHeader><CardTitle>信用分配趋势（7天）</CardTitle></CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.creditTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" />
                        <XAxis dataKey="day" stroke="#a1a1aa" />
                        <YAxis stroke="#a1a1aa" />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#33d17a" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="bg-[#131318] border-white/10">
                  <CardHeader><CardTitle>热门游戏 / 投注统计</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">今日投注量 Top 5</div>
                      <div className="space-y-2">
                        {data.topGames.map((g, idx) => (
                          <div key={g.name} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                            <span>{idx + 1}. {g.name}</span>
                            <span className="text-[#FFD700]">{num(g.volume)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-64">
                      <div className="text-sm text-zinc-400 mb-2">GGR 占比</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.ggrShare} dataKey="value" nameKey="name" outerRadius={90}>
                            {data.ggrShare.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#131318] border-rose-500/20">
                  <CardHeader><CardTitle>风险监控</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">Sports Exposure Top 5</div>
                      <div className="space-y-2">
                        {data.topExposure.map((r) => (
                          <div key={r.event} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                            <span>{r.event}</span>
                            <span className={r.level === 'danger' ? 'text-rose-400' : r.level === 'warning' ? 'text-amber-400' : 'text-emerald-400'}>{money(r.exposure)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#FFD700]/20 bg-[#101014] p-3">
                      <div className="text-sm">Live Queue: <span className="text-[#FFD700]">{data.liveQueue.pending}</span> 待处理</div>
                      <Button variant="outline"><PauseCircle size={14} className="mr-1" />暂停</Button>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400 mb-2">最近异常警报</div>
                      <div className="space-y-2">
                        {data.alerts.map((a) => (
                          <div key={a.id} className="rounded-lg bg-white/5 px-3 py-2 text-xs flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2"><Bell size={12} className={a.level === 'danger' ? 'text-rose-400' : 'text-amber-400'} />{a.text}</span>
                            <span className="text-zinc-500">{new Date(a.at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="bg-[#131318] border-[#FFD700]/20">
                  <CardHeader><CardTitle>快捷操作</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => setOpenCreditModal(true)}><Wallet size={14} className="mr-2" />快速分配信用</Button>
                    <Button variant="outline" className="w-full justify-start">查看代理层级树</Button>
                    <Button variant="outline" className="w-full justify-start">手动结算投注</Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#131318] border-white/10 xl:col-span-1">
                  <CardHeader><CardTitle>最近10笔信用调整</CardTitle></CardHeader>
                  <CardContent className="space-y-2 max-h-80 overflow-auto text-xs">
                    {data.recentCreditTransactions.map((r) => (
                      <div key={r.id} className="rounded-lg bg-white/5 p-2">
                        <div>{r.from} → {r.to}</div>
                        <div className="text-[#FFD700]">{money(r.amount)}</div>
                        <div className="text-zinc-500">{time(r.at)}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-[#131318] border-white/10 xl:col-span-1">
                  <CardHeader><CardTitle>最近10笔大额投注</CardTitle></CardHeader>
                  <CardContent className="space-y-2 max-h-80 overflow-auto text-xs">
                    {data.recentBets.map((r) => (
                      <div key={r.id} className="rounded-lg bg-white/5 p-2">
                        <div>{r.user} · {r.game}</div>
                        <div className="text-emerald-400">Stake: {money(r.stake)}</div>
                        <div className="text-zinc-500">{time(r.at)} · {r.status}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          )}
        </main>
      </div>

      <Modal open={openCreditModal} onOpenChange={setOpenCreditModal} title="快速给 Agent 分配信用">
        <div className="space-y-3">
          <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="Agent ID" />
          <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="金额" type="number" />
          <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="备注" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpenCreditModal(false)}>取消</Button>
            <Button onClick={() => setOpenCreditModal(false)}><ShieldAlert size={14} className="mr-2" />提交</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
