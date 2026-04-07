import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { pct } from '@/lib/format';

export function KpiCard({ title, value, change, tone = 'neutral', subtitle }: {
  title: string;
  value: string;
  change?: number;
  tone?: 'good' | 'bad' | 'warn' | 'neutral';
  subtitle?: string;
}) {
  const colorMap = {
    good: 'text-emerald-400',
    bad: 'text-rose-400',
    warn: 'text-amber-400',
    neutral: 'text-[#FFD700]',
  } as const;

  return (
    <Card className="bg-gradient-to-br from-[#171717] to-[#101010] border-[#FFD700]/15 hover:border-[#FFD700]/45 transition-all hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-sm text-zinc-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        <div className="mt-2 text-xs text-zinc-400">
          {typeof change === 'number' ? <span className={colorMap[tone]}>{pct(change)}</span> : null}
          {subtitle ? <span className="ml-2">{subtitle}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
