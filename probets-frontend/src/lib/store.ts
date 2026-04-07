import { create } from 'zustand';

type Role = 'admin' | 'superagent' | 'super_master' | 'master' | 'agent' | 'player';

type AuthUser = {
  id?: string;
  username?: string;
  name?: string;
  role?: Role | string;
};

interface AppStore {
  isSuperMaster: boolean;
  credit: number;
  setCredit: (credit: number) => void;
  role: Role;
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isSuperMaster: true,
  credit: 9999999999,
  role: 'super_master',
  authUser: null,
  setCredit: (credit) => set({ credit }),
  setAuthUser: (authUser) => set({ authUser }),
}));
