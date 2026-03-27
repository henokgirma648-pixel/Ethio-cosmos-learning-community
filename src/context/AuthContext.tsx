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
  isNewUser: boolean;
  completeRegistration: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'henokgirma648@gmail.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [isNewUser, setIsNewUser] = useState(false);

  const completeRegistration = async () => {
    if (!user) return;
    const { error } = await supabase.auth.updateUser({
      data: { registration_completed: true }
    });
    if (error) throw error;
    setIsNewUser(false);
  };

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
      console.error('Supabase configuration is invalid.');
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Get session error:', error);
          throw error;
        }
        
        console.log('Session data:', session);
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
          setIsNewUser(!session.user.user_metadata?.registration_completed);
          joinPresence(session.user.id);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed event:', event);
      console.log('Auth state changed session:', session);
      
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
        setIsNewUser(!session.user.user_metadata?.registration_completed);
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
      alert('Supabase configuration missing.');
      return;
    }

    console.log('Initiating Google Sign-In...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  const sendEmailLink = async (email: string) => {
    if (!isValidConfig) {
      alert('Supabase configuration missing.');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const completeEmailSignIn = async () => {
    // Handled by onAuthStateChange
  };

  const logout = async () => {
    if (!isValidConfig) return;
    leavePresence();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, onlineUsers, signInWithGoogle, sendEmailLink, completeEmailSignIn, logout, isAdmin, isNewUser, completeRegistration }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
