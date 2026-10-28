import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase, supabaseConfigured, type Profile, type UserPermissions } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  permissions: UserPermissions | null;
  loading: boolean;
  isAdmin: boolean;
  configured: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const DEV_PROFILE: Profile = {
  id: 'dev',
  email: 'dev@local',
  full_name: 'Dev Mode',
  role: 'admin',
  is_active: true,
  created_at: '',
  updated_at: '',
};

const DEV_PERMISSIONS: UserPermissions = {
  id: 'dev',
  user_id: 'dev',
  can_manual_notification: true,
  can_auto_system: true,
  allowed_platforms: [],
  created_at: '',
  updated_at: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(
    supabaseConfigured ? null : DEV_PROFILE
  );
  const [permissions, setPermissions] = useState<UserPermissions | null>(
    supabaseConfigured ? null : DEV_PERMISSIONS
  );
  const [loading, setLoading] = useState(supabaseConfigured);

  async function fetchProfile(userId: string) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: perms } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();

    setProfile(prof);
    setPermissions(perms);
  }

  async function refreshProfile() {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
        setPermissions(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabaseConfigured) return 'Supabase not configured';
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  }

  async function signOut() {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setPermissions(null);
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        permissions,
        loading,
        isAdmin,
        configured: supabaseConfigured,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
