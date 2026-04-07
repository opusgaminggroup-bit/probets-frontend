'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getGgrReport } from '@/lib/ggr-report-api';
import type { GgrReportData } from '@/types/ggr-report';

type RangeKey = 'today' | '7' | '30' | 'custom';

type TabKey = 'overview' | 'byGame' | 'byAgent';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'GGR 总览趋势' },
  { key: 'byGame', label: '按游戏类型拆分' },
  { key: 'byAgent', label: '按 Agent 贡献' },
];

function toCsv(rows: any[], headers: { key: string; label: string }[]) {
  const headerLine = headers.map((h) => h.label).join(',');
  const lines = rows.map((r) => headers.map((h) => String(r[h.key] ?? '')).join(','));
  return [headerLine, ...lines].join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GgrReportPage() {
  const [tab, setTab] = useState<TabKey>('overview');

  const [rangeKey, setRangeKey] = useState<RangeKey>('30');
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gameType, setGameType] = useState<'all' | 'sports' | 'dice' | 'plinko' | 'baccarat' | 'live_casino'>('all');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GgrReportData | null>(null);

  const computedDays = useMemo(() => {
    if (rangeKey === 'today') return 1;
    if (rangeKey === '7') return 7;
    if (rangeKey === '30') return 30;
    return Math.max(1, Number(days || 30));
  }, [rangeKey, days]);

  const load = async () => {
    setLoading(true);
    try {
      const query: any = {
        days: computedDays,
        gameType,
      };
      if (rangeKey === 'custom' && startDate && endDate) {
        query.startDate = startDate;
        query.endDate = endDate;
      }
      const res = await getGgrReport(query);
      setData(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '加载 GGR 报表失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey, computedDays, gameType, startDate, endDate]);

  const exportCsv = () => {
    if (!data) return;
    if (tab === 'byAgent') {
      const csv = toCsv(
        data.agentContribution,
        [
          { key: 'agentName', label: 'agentName' },
          { key: 'ggr', label: 'ggr' },
          { key: 'contributionRatio', label: 'contributionRatio' },
          { key: 'playersCount', label: 'playersCount' },
        ],
      );
      downloadCsv('ggr-agent-contribution.csv', csv);
      toast.success('已导出 Agent 贡献 CSV');
      return;
    }
    if (tab === 'byGame') {
      const csv = toCsv(
        data.gameBreakdown,
        [
          { key: 'game', label: 'game' },
          { key: 'totalStake', label: 'totalStake' },
          { key: 'ggr', label: 'ggr' },
          { key: 'rtp', label: 'rtp' },
          { key: 'betCount', label: 'betCount' },
        ],
      );
      downloadCsv('ggr-by-game.csv', csv);
      toast.success('已导出 游戏拆分 CSV');
      return;
    }

    const csv = toCsv(
      data.trend,
      [
        { key: 'date', label: 'date' },
        { key: 'totalStake', label: 'totalStake' },
        { key: 'ggr', label: 'ggr' },
      ],
    );
    downloadCsv('ggr-trend.csv', csv);
    toast.success('已导出 GGR 趋势 CSV');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-4 lg:p-6">
      <header className="mb-4 rounded-2xl border border-[#FFD700]/20 bg-[#121217] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">GGR 报表</h1>
          <p className="text-xs text-zinc-400">总览趋势 / 游戏拆分 / Agent 贡献</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value as RangeKey)}
            className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="7">7 天</option>
            <option value="30">30 天</option>
            <option value="custom">自定义</option>
          </select>

          {rangeKey === 'custom' ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm"
              />
              <span className="text-zinc-400 text-sm">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value as any)}
            className="rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm"
          >
            <option value="all">All Games</option>
            <option value="sports">Sports</option>
            <option value="dice">Dice</option>
            <option value="plinko">Plinko</option>
            <option value="baccarat">Baccarat</option>
            <option value="live_casino">Live Casino</option>
          </select>

          <Button
            variant="outline"
            onClick={async () => {
              await load();
              toast.success('GGR 报表已刷新');
            }}
          >
            <RefreshCcw size={14} className="mr-2" />刷新
          </Button>

          <Button onClick={exportCsv}>
            <Download size={14} className="mr-2" />导出
          </Button>
        </div>
      </header>

      <div className="mb-4 flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm border transition-colors ${
              tab === t.key
                ? 'bg-[#FFD700]/15 border-[#FFD700]/40 text-[#FFD700]'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="bg-[#121217] border-white/10">
          <CardContent className="pt-6 space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-white/5 animate-pulse" />
            ))}
          </CardContent>
        </Card>
      ) : !data ? (
        <div className="rounded-xl border border-dashed border-white/15 p-10 text-center text-zinc-400">暂无 GGR 数据</div>
      ) : tab === 'overview' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <KpiCard title="总 GGR" value={data.overview.totalGgr} gold />
            <KpiCard title="今日 GGR" value={data.overview.todayGgr} />
            <KpiCard title="环比" value={data.overview.wow} isPercent />
            <KpiCard title="总投注" value={data.overview.totalStake} />
          </div>

          <Card className="bg-[#121217] border-white/10">
            <CardHeader><CardTitle>每日 GGR 趋势</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" />
                  <XAxis dataKey="date" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Line dataKey="totalStake" stroke="#33d17a" strokeWidth={2} dot={false} />
                  <Line dataKey="ggr" stroke="#FFD700" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121217] border-white/10">
            <CardHeader><CardTitle>按周汇总 GGR</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" />
                  <XAxis dataKey="period" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Bar dataKey="ggr" fill="#FFD700" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : tab === 'byGame' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="bg-[#121217] border-white/10 xl:col-span-1">
            <CardHeader><CardTitle>游戏 GGR 占比</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.gameBreakdown}
                    dataKey="ggr"
                    nameKey="game"
                    outerRadius={95}
                    label={({ game, percent }: any) => `${game} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.gameBreakdown.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#FFD700', '#33d17a', '#3b82f6', '#f97316', '#8b5cf6'][i % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#121217] border-white/10 xl:col-span-2">
            <CardHeader><CardTitle>游戏明细</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-zinc-400 border-b border-white/10">
                    <tr>
                      <th className="text-left py-2">游戏</th>
                      <th className="text-right">总投注</th>
                      <th className="text-right">GGR</th>
                      <th className="text-right">RTP</th>
                      <th className="text-right">胜率</th>
                      <th className="text-right">笔数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gameBreakdown.map((g) => (
                      <tr key={g.game} className="border-b border-white/5">
                        <td className="py-2">{g.game}</td>
                        <td className="text-right">{g.totalStake.toFixed(2)}</td>
                        <td className={`text-right ${g.ggr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{g.ggr.toFixed(2)}</td>
                        <td className="text-right">{g.rtp.toFixed(2)}%</td>
                        <td className="text-right">{g.winRate.toFixed(2)}%</td>
                        <td className="text-right">{g.betCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.gameBreakdown.length === 0 ? (
                <div className="p-10 text-center text-zinc-400">暂无游戏数据</div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="bg-[#121217] border-white/10 xl:col-span-2">
            <CardHeader><CardTitle>Top Agent GGR 贡献</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-zinc-400 border-b border-white/10">
                    <tr>
                      <th className="text-left py-2">Agent</th>
                      <th className="text-right">贡献 GGR</th>
                      <th className="text-right">贡献比例</th>
                      <th className="text-right">会员数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agentContribution.map((a, idx) => (
                      <tr
                        key={a.agentId}
                        className={`border-b border-white/5 ${idx < 10 ? 'bg-[#FFD700]/6' : ''}`}
                      >
                        <td className="py-2">{a.agentName}</td>
                        <td className={`text-right ${a.ggr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{a.ggr.toFixed(2)}</td>
                        <td className="text-right text-[#FFD700]">{a.contributionRatio.toFixed(2)}%</td>
                        <td className="text-right">{a.playersCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.agentContribution.length === 0 ? (
                <div className="p-10 text-center text-zinc-400">暂无 Agent 数据</div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-[#121217] border-white/10">
            <CardHeader><CardTitle>Top 10 Agent 对比</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.agentContribution.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f2f36" />
                  <XAxis dataKey="agentName" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Bar dataKey="ggr" fill="#FFD700" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, gold, isPercent }: { title: string; value: number; gold?: boolean; isPercent?: boolean }) {
  const isPos = value >= 0;
  return (
    <div className={`rounded-xl border bg-white/5 p-4 ${gold ? 'border-[#FFD700]/30' : 'border-white/10'}`}>
      <div className="text-xs text-zinc-400">{title}</div>
      <div className={`mt-1 text-xl font-semibold ${gold ? 'text-[#FFD700]' : isPos ? 'text-emerald-300' : 'text-rose-300'}`}>
        {isPercent ? `${Number(value).toFixed(2)}%` : value.toFixed(2)}
      </div>
    </div>
  );
}
