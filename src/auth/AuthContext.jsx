import { useEffect, useState } from 'react';
import { AuthContext } from './authContextValue.js';
import { supabase, supabaseConfigError } from '../lib/supabaseClient.js';
import { getProfile, updateProfile, upsertProfile } from '../services/profileService.js';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!error) {
        setSession(data.session);
        await loadProfile(data.session?.user);
      }

      setLoading(false);
    }

    async function loadProfile(user) {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        setProfile((await getProfile(user.id)) ?? (await upsertProfile(user)));
      } catch {
        setProfile(null);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadProfile(nextSession?.user);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    if (!supabase) {
      throw new Error(supabaseConfigError);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async function register(email, password, displayName, city) {
    if (!supabase) {
      throw new Error(supabaseConfigError);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          city,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      setProfile(await upsertProfile(data.session.user, displayName, city));
    }

    return data;
  }

  async function logout() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (!session?.user) {
      setProfile(null);
      return null;
    }

    const nextProfile = await getProfile(session.user.id);
    setProfile(nextProfile);
    return nextProfile;
  }

  async function saveProfile(updates) {
    if (!session?.user) {
      return null;
    }

    const nextProfile = await updateProfile(session.user.id, updates);
    setProfile(nextProfile);
    return nextProfile;
  }

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    loading,
    configError: supabaseConfigError,
    login,
    register,
    logout,
    refreshProfile,
    saveProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
