'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function UserCreateModal({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: (payload: any) => Promise<void> }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'agent', parentId: '', initialCredit: '' });
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="创建用户">
      <div className="space-y-3">
        <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="用户名" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="密码" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="superagent">SuperAgent</option>
          <option value="agent">Agent</option>
          <option value="player">Player</option>
        </select>
        <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="parentId（可选）" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} />
        <input className="w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2" placeholder="初始信用额度（可选）" type="number" value={form.initialCredit} onChange={(e) => setForm({ ...form, initialCredit: e.target.value })} />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={async () => {
            setLoading(true);
            try {
              await onSubmit({
                username: form.username,
                password: form.password,
                role: form.role,
                parentId: form.parentId || undefined,
                initialCredit: form.initialCredit ? Number(form.initialCredit) : undefined,
              });
              onOpenChange(false);
              setForm({ username: '', password: '', role: 'agent', parentId: '', initialCredit: '' });
            } finally {
              setLoading(false);
            }
          }} disabled={loading}>{loading ? '创建中...' : '创建'}</Button>
        </div>
      </div>
    </Modal>
  );
}
