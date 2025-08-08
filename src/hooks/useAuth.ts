
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseWithRetry, networkStatus } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'gestor_almoxarifado' | 'supervisor_geral';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(networkStatus.getStatus());

  useEffect(() => {
    let initialized = false;
    let profileFetchTimeout: NodeJS.Timeout;

    // Monitor network status
    const unsubscribeNetwork = networkStatus.subscribe((online) => {
      setIsOnline(online);
      if (online && user && !userProfile) {
        // Retry profile fetch when back online
        setTimeout(() => {
          fetchUserProfile(user);
        }, 1000);
      }
    });

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabaseWithRetry.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !initialized) {
          // Only fetch profile data after auth state is established
          profileFetchTimeout = setTimeout(() => {
            fetchUserProfile(session.user);
          }, 100);
        } else if (!session?.user) {
          setUserProfile(null);
        }
        
        setLoading(false);
        initialized = true;
      }
    );

    // Get initial session
    supabaseWithRetry.auth.getSession().then(({ data: { session } }) => {
      if (!initialized) {
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          profileFetchTimeout = setTimeout(() => {
            fetchUserProfile(session.user);
          }, 100);
        }
        
        setLoading(false);
        initialized = true;
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      setLoading(false);
      initialized = true;
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeNetwork();
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
    };
  }, []);

  const fetchUserProfile = async (user: User) => {
    if (!isOnline) {
      console.log('Skipping profile fetch - offline');
      return;
    }

    try {
      const result = await supabaseWithRetry
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const { data: profile, error } = result;
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, user needs to contact administrator');
          // SECURITY FIX: Remove automatic profile creation
          // Only authorized admins should create profiles
        }
      } else {
        console.log('Profile loaded:', profile);
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Don't set loading to false here as it might be a temporary network issue
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isOnline) {
      return { 
        data: null, 
        error: { 
          message: 'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
          code: 'NETWORK_ERROR'
        } 
      };
    }

    try {
      console.log('Attempting to sign in with:', email);
      const { data, error } = await supabaseWithRetry.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Tratamento específico para diferentes tipos de erro
        let friendlyMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.';
        } else if (error.message.includes('fetch')) {
          friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        
        return { data: null, error: { ...error, message: friendlyMessage } };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
    } catch (err: unknown) {
      console.error('Sign in exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Erro inesperado durante o login. Tente novamente.',
          original: err as unknown 
        }
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isOnline) {
      return { 
        data: null, 
        error: { 
          message: 'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
          code: 'NETWORK_ERROR'
        } 
      };
    }

    try {
      const { data, error } = await supabaseWithRetry.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email,
          },
          emailRedirectTo: `${window.location.origin}/`
        },
      });
      return { data, error };
    } catch (err: unknown) {
      console.error('Sign up exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Erro inesperado durante o cadastro. Tente novamente.',
          original: err as unknown 
        }
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseWithRetry.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }
      return { error };
    } catch (err: unknown) {
      console.error('Sign out exception:', err);
      return { 
        error: { 
          message: 'Erro inesperado durante o logout. Tente novamente.',
          original: err as unknown 
        }
      };
    }
  };

  const isAdmin = () => userProfile?.role === 'admin';
  const isGestor = () => userProfile?.role === 'gestor_almoxarifado';
  const isSupervisor = () => userProfile?.role === 'supervisor_geral';

  return {
    user,
    session,
    userProfile,
    loading,
    isOnline,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isGestor,
    isSupervisor,
  };
}
