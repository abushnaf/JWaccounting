import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: AppRole[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string, role?: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  // Demo auth helpers (localStorage-based)
  type DemoUser = { id: string; email: string; password: string; full_name: string; roles: AppRole[] };
  const DEMO_USERS_KEY = 'demo_users_v1';

  const seedDemoUsers = () => {
    const existing = localStorage.getItem(DEMO_USERS_KEY);
    if (existing) return;
    const demoUsers: DemoUser[] = [
      { id: cryptoRandomId(), email: 'admin@example.com', password: 'password123', full_name: 'مدير النظام', roles: ['admin'] as AppRole[] },
      { id: cryptoRandomId(), email: 'seller@example.com', password: 'password123', full_name: 'بائع', roles: ['seller'] as AppRole[] },
      { id: cryptoRandomId(), email: 'accountant@example.com', password: 'password123', full_name: 'محاسب', roles: ['accountant'] as AppRole[] },
    ];
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUsers));
  };

  function cryptoRandomId(): string {
    try {
      // Best effort random ID even if Node crypto not available
      const arr = new Uint8Array(16);
      (globalThis.crypto as any)?.getRandomValues?.(arr);
      return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  const enableDemoMode = () => {
    setIsDemo(true);
    seedDemoUsers();
    setLoading(false);
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      const roles = rolesData.map(r => r.role);
      
      setProfile({
        id: profileData.id,
        full_name: profileData.full_name,
        email: profileData.email,
        roles
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    const missingSupabaseEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (missingSupabaseEnv) {
      enableDemoMode();
      // Check for existing demo session
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        try {
          const sessionData = JSON.parse(demoSession);
          setUser({} as User);
          setProfile(sessionData.profile);
        } catch (error) {
          console.error('Error parsing demo session:', error);
          localStorage.removeItem('demo_session');
        }
      }
      return;
    }

    // Try Supabase; if it fails, fall back to demo mode
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
        setLoading(false);
      })
      .catch(() => {
        enableDemoMode();
      });

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isDemo) return; // ignore in demo
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => data?.subscription?.unsubscribe();
  }, [isDemo]);

  const signIn = async (email: string, password: string) => {
    if (isDemo) {
      const users: DemoUser[] = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
      const found = users.find(u => u.email === email && u.password === password);
      if (!found) throw new Error('بيانات الدخول غير صحيحة');
      const profile = { id: found.id, email: found.email, full_name: found.full_name, roles: found.roles };
      setUser({} as User);
      setProfile(profile);
      // Save demo session
      localStorage.setItem('demo_session', JSON.stringify({ profile }));
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (fullName: string, email: string, password: string, role: AppRole = 'seller') => {
    if (isDemo) {
      const users: DemoUser[] = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
      if (users.some(u => u.email === email)) throw new Error('البريد مستخدم مسبقًا');
      const newUser: DemoUser = { id: cryptoRandomId(), email, password, full_name: fullName, roles: [role] };
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...users, newUser]));
      return;
    }
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (authData.user) {
      await supabase.from('user_roles').insert({ user_id: authData.user.id, role });
    }
  };

  const signOut = async () => {
    if (isDemo) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('demo_session');
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
