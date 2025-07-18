
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    let initialized = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !initialized) {
          // Only fetch profile data after auth state is established
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
        } else if (!session?.user) {
          setUserProfile(null);
        }
        
        setLoading(false);
        initialized = true;
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialized) {
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
        }
        
        setLoading(false);
        initialized = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create...');
          await createMissingProfile(user);
        }
      } else {
        console.log('Profile loaded:', profile);
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  const createMissingProfile = async (user: User) => {
    try {
      const role = user.email === 'resumovetorial@gmail.com' ? 'admin' : 'gestor_almoxarifado';
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email || 'Usuário',
          role: role,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating missing profile:', error);
      } else {
        console.log('Missing profile created:', profile);
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Exception creating missing profile:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
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
        }
        
        return { data: null, error: { ...error, message: friendlyMessage } };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
    } catch (err) {
      console.error('Sign in exception:', err);
      return { 
        data: null, 
        error: { 
          message: 'Erro inesperado durante o login. Tente novamente.',
          original: err 
        } as any 
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
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
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setUserProfile(null);
    }
    return { error };
  };

  const isAdmin = () => userProfile?.role === 'admin';
  const isGestor = () => userProfile?.role === 'gestor_almoxarifado';
  const isSupervisor = () => userProfile?.role === 'supervisor_geral';

  return {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isGestor,
    isSupervisor,
  };
}
