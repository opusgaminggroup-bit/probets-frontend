'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState('/admin/dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next) setNextPath(next);
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      const token = data?.data?.token || data?.token;
      if (!token) throw new Error('Token missing from response');
      setToken(token);
      router.replace(nextPath);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#FFD700]/30 bg-[#131318] p-8 shadow-2xl shadow-black/50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#FFD700]">PROBETS Admin Login</h1>
          <p className="text-sm text-zinc-400 mt-1">请输入管理员账号登录后台</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-zinc-400">用户名</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#FFD700]/50"
              placeholder="admin username"
              required
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none focus:border-[#FFD700]/50"
              placeholder="password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#FFD700] to-[#c99b00] py-2.5 font-semibold text-black hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
