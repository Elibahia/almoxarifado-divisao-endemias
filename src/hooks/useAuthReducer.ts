import { useReducer, useCallback, useEffect } from 'react';
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

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_SESSION'; session: Session | null }
  | { type: 'SET_USER_PROFILE'; profile: UserProfile | null }
  | { type: 'SET_ONLINE_STATUS'; isOnline: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET_AUTH' }
  | { type: 'AUTH_STATE_CHANGED'; session: Session | null };

const initialState: AuthState = {
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  isOnline: networkStatus.getStatus(),
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    
    case 'SET_USER':
      return { ...state, user: action.user };
    
    case 'SET_SESSION':
      return { ...state, session: action.session };
    
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.profile };
    
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.isOnline };
    
    case 'SET_ERROR':
      return { ...state, error: action.error };
    
    case 'RESET_AUTH':
      return {
        ...state,
        user: null,
        session: null,
        userProfile: null,
        error: null
      };
    
    case 'AUTH_STATE_CHANGED':
      return {
        ...state,
        session: action.session,
        user: action.session?.user ?? null,
        userProfile: action.session ? state.userProfile : null,
        loading: false
      };
    
    default:
      return state;
  }
}

export function useAuthReducer() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const fetchUserProfile = useCallback(async (user: User) => {
    if (!state.isOnline) {
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
        }
        dispatch({ type: 'SET_ERROR', error: error.message });
      } else {
        console.log('Profile loaded:', profile);
        dispatch({ type: 'SET_USER_PROFILE', profile });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      dispatch({ type: 'SET_ERROR', error: 'Erro ao carregar perfil do usuário' });
    }
  }, [state.isOnline]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!state.isOnline) {
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
  }, [state.isOnline]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!state.isOnline) {
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
  }, [state.isOnline]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabaseWithRetry.auth.signOut();
      if (!error) {
        dispatch({ type: 'RESET_AUTH' });
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
  }, []);

  // Initialize auth state
  useEffect(() => {
    let initialized = false;
    let profileFetchTimeout: NodeJS.Timeout;

    // Monitor network status
    const unsubscribeNetwork = networkStatus.subscribe((online) => {
      dispatch({ type: 'SET_ONLINE_STATUS', isOnline: online });
      if (online && state.user && !state.userProfile) {
        setTimeout(() => {
          fetchUserProfile(state.user!);
        }, 1000);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabaseWithRetry.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        dispatch({ type: 'AUTH_STATE_CHANGED', session });
        
        if (session?.user && !initialized) {
          profileFetchTimeout = setTimeout(() => {
            fetchUserProfile(session.user);
          }, 100);
        }
        
        initialized = true;
      }
    );

    // Get initial session
    supabaseWithRetry.auth.getSession().then(({ data: { session } }) => {
      if (!initialized) {
        console.log('Initial session:', session?.user?.email);
        dispatch({ type: 'AUTH_STATE_CHANGED', session });
        
        if (session?.user) {
          profileFetchTimeout = setTimeout(() => {
            fetchUserProfile(session.user);
          }, 100);
        }
        
        initialized = true;
      }
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      dispatch({ type: 'SET_LOADING', loading: false });
      initialized = true;
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeNetwork();
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
    };
  }, [fetchUserProfile]);

  const isAdmin = useCallback(() => state.userProfile?.role === 'admin', [state.userProfile]);
  const isGestor = useCallback(() => state.userProfile?.role === 'gestor_almoxarifado', [state.userProfile]);
  const isSupervisor = useCallback(() => state.userProfile?.role === 'supervisor_geral', [state.userProfile]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isGestor,
    isSupervisor,
  };
}
