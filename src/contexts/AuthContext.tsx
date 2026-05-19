import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

// Fetch profile with automatic retry — handles the edge case where the DB
// trigger hasn't finished writing when this is called right after sign-in.
export async function getProfile(userId: string, retries = 3): Promise<Profile | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching profile (attempt ${attempt}):`, error);
      if (attempt === retries) return null;
    } else if (data) {
      return data;
    }

    // Profile not found yet — wait before retrying (DB trigger may still be writing)
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 600 * attempt));
    }
  }
  return null;
}

// Ensure a profile row exists for OAuth users (Google, GitHub, etc.)
// The DB trigger handle_new_user fires on INSERT to auth.users and creates the profile.
// This fallback only runs if for some reason the trigger didn't fire.
async function ensureOAuthProfile(user: User): Promise<void> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existing) return; // already exists via DB trigger — nothing to do

  const email = user.email ?? '';
  const rawUsername = email.split('@')[0] || `user_${user.id.substring(0, 8)}`;
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    rawUsername;

  // Insert using only columns that exist in the actual DB schema
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email,
      username: rawUsername,
      name,
      full_name: name,
    } as any,
    { onConflict: 'id', ignoreDuplicates: true }
  );
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Wait for profile before clearing loading — prevents "Profile Not Found" flash
        const profileData = await getProfile(session.user.id);
        setProfile(profileData);
      }
      setLoading(false);
    });

    // Do NOT use await inside this callback — use .then() to avoid deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // For OAuth sign-ins (SIGNED_IN after redirect), ensure profile exists
        if (event === 'SIGNED_IN') {
          ensureOAuthProfile(session.user).then(() => {
            getProfile(session.user.id).then(setProfile);
          });
        } else {
          getProfile(session.user.id).then(setProfile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
