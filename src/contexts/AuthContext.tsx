/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type UserRole = 'admin' | 'student' | 'parent' | 'driver' | 'user' | null;

interface AuthContextType {
  user: any | null;
  session: any | null;
  userRole: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setUserRole(data.role as UserRole);
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    // onAuthStateChange returns { data: { subscription } } in our custom adapter
    const result = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Support both return shapes: { data: { subscription } } and { subscription }
    const subscription = result?.data?.subscription ?? (result as any)?.subscription;

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      const session = data?.session ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('¡Bienvenido a SchoolTrack!');
    navigate('/dashboard');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    if (data.user) {
      // Todos los nuevos usuarios se registran como 'user' por defecto
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'user',
        });

      if (roleError) {
        console.error('Error al asignar rol:', roleError);
        toast.error('Cuenta creada pero hubo un problema al asignar el rol');
      }
    }

    toast.success('¡Cuenta creada! Iniciando sesión...');
    navigate('/dashboard');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    setUserRole(null);
    toast.success('Sesión cerrada correctamente');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
