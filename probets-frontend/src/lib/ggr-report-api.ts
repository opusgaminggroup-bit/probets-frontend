import api from './api';
import type { GgrReportData } from '@/types/ggr-report';

export async function getGgrReport(params: {
  days?: number;
  startDate?: string;
  endDate?: string;
  gameType?: 'all' | 'sports' | 'dice' | 'plinko' | 'baccarat' | 'live_casino';
}): Promise<{ data: GgrReportData; meta: any }> {
  const res = await api.get('/admin/reports/ggr', { params });
  return { data: res.data?.data, meta: res.data?.meta };
}
