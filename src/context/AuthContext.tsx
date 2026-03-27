import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase, isValidConfig } from '@/supabase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  onlineUsers: number;
  signInWithGoogle: () => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'henokgirma648@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const joinPresence = (userId: string) => {
    if (presenceChannelRef.current) {
      presenceChannelRef.current.unsubscribe();
    }
    const channel = supabase.channel('online-users', {
      config: { presence: { key: userId } },
    });
    presenceChannelRef.current = channel;
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });
  };

  const leavePresence = () => {
    if (presenceChannelRef.current) {
      presenceChannelRef.current.unsubscribe();
      presenceChannelRef.current = null;
    }
    setOnlineUsers(0);
  };

  useEffect(() => {
    if (!isValidConfig) {
      setLoading(false);
      return;
    }

    console.log('Auth Initializing...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial Session:', session ? 'User Found' : 'No User');
      if (error) console.error('Session Error:', error.message);
      
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            null,
          photoURL: session.user.user_metadata?.avatar_url ?? null,
        });
        joinPresence(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth State Change:', event, session ? 'User Found' : 'No User');
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email ?? null,
          displayName:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            null,
          photoURL: session.user.user_metadata?.avatar_url ?? null,
        });
        joinPresence(session.user.id);
      } else {
        setUser(null);
        leavePresence();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      leavePresence();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isValidConfig) {
      alert('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  };

  const sendEmailLink = async (email: string) => {
    if (!isValidConfig) {
      alert('Supabase is not configured. Please add your credentials to the .env file.');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  };

  const completeEmailSignIn = async () => {
    // Supabase handles magic link automatically via onAuthStateChange
  };

  const logout = async () => {
    if (!isValidConfig) return;
    leavePresence();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, onlineUsers, signInWithGoogle, sendEmailLink, completeEmailSignIn, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
