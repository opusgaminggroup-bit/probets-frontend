'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const quickAmounts = [100, 500, 1000, 5000];

export function CreditAdjustModal({
  open,
  onOpenChange,
  targetUserId,
  targetUsername,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targetUserId: string;
  targetUsername?: string;
  onSubmit: (payload: { targetUserId: string; action: 'add' | 'subtract'; amount: number; remark?: string }) => Promise<void>;
}) {
  const [action, setAction] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const amountNum = useMemo(() => Number(amount || 0), [amount]);

  const submit = async () => {
    if (!targetUserId || amountNum <= 0) return;
    const ok = window.confirm(`${action === 'add' ? '增加' : '扣减'} ${targetUsername || targetUserId} 信用 ${amountNum} ?`);
    if (!ok) return;
    setLoading(true);
    try {
      await onSubmit({ targetUserId, action, amount: amountNum, remark: remark || undefined });
      onOpenChange(false);
      setAmount('');
      setRemark('');
      setAction('add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="调整信用">
      <div className="space-y-3">
        <div className="text-sm text-zinc-400">目标用户：<span className="text-white">{targetUsername || targetUserId || '-'}</span></div>
        <div className="flex gap-2">
          <Button variant={action === 'add' ? 'default' : 'outline'} onClick={() => setAction('add')}>Add</Button>
          <Button variant={action === 'subtract' ? 'default' : 'outline'} onClick={() => setAction('subtract')}>Subtract</Button>
        </div>
        <input
          className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2"
          placeholder="金额"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map((n) => (
            <button key={n} className="rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-1 text-xs" onClick={() => setAmount(String(n))}>+{n}</button>
          ))}
        </div>
        <input
          className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2"
          placeholder="备注（可选）"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit} disabled={loading || amountNum <= 0}>{loading ? '提交中...' : '确认提交'}</Button>
        </div>
      </div>
    </Modal>
  );
}
