import { supabase } from '@/lib/supabase';
import type { AuthError, User, Session } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Servicio de Autenticación con OAuth
 */
export const authService = {
  /**
   * Iniciar sesión con Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { error };
  },

  /**
   * Iniciar sesión con Email y Contraseña
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  /**
   * Registrarse con Email y Contraseña
   */
  async signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Obtener sesión actual
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Listener para cambios en el estado de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },

  /**
   * Restablecer contraseña
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { error };
  }
};
