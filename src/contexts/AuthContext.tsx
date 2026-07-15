import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDevelopmentBypass: boolean;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isDevelopmentBypass: false,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

const developmentBypassEnabled = import.meta.env.DEV
  && import.meta.env.VITE_DEV_AUTH_BYPASS === "true"
  && Boolean(import.meta.env.VITE_DEV_AUTH_BYPASS_TOKEN);

const developmentBypassUser = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "local-ai-tester@gitanalyzer.test",
  app_metadata: {},
  user_metadata: { user_name: "Local AI tester" },
  created_at: "2026-01-01T00:00:00.000Z",
} as User;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => developmentBypassEnabled ? developmentBypassUser : null);
  const [session, setSession] = useState<Session | null>(() => developmentBypassEnabled
    ? { access_token: import.meta.env.VITE_DEV_AUTH_BYPASS_TOKEN, user: developmentBypassUser } as Session
    : null);
  const [loading, setLoading] = useState(!developmentBypassEnabled);

  useEffect(() => {
    if (developmentBypassEnabled) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('GitHub sign-in error:', error.message);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
    }
  };

  const signOut = async () => {
    if (developmentBypassEnabled) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error.message);
    } else {
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDevelopmentBypass: developmentBypassEnabled, signInWithGitHub, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
