import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: { full_name: string | null; phone: string | null; role: string } | null;
  loading: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getUser();
    set({ user: data.user ?? null });
    if (data.user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', data.user.id)
        .maybeSingle();
      set({ profile: p ?? null });
    }
    set({ loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      if (session?.user) get().refreshProfile();
      else set({ profile: null });
    });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, role')
      .eq('id', user.id)
      .maybeSingle();
    set({ profile: data ?? null });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
