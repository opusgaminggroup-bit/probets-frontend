import api from './api';

export async function fetchCurrentUser() {
  try {
    const me = await api.get('/auth/me');
    return me.data?.data ?? me.data ?? null;
  } catch {
    try {
      const profile = await api.get('/admin/profile');
      return profile.data?.data ?? profile.data ?? null;
    } catch {
      return null;
    }
  }
}
