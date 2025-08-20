import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle(); // Usar maybeSingle() en lugar de single() para evitar errores cuando no hay resultados
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profileData) {
            setProfile(profileData as Profile);
          } else {
            // Si no existe el perfil, crear uno básico
            console.log('No profile found, creating one...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: session.user.email || 'Usuario',
                role: 'doctor' // rol por defecto
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              setProfile(newProfile as Profile);
            }
          }
        } catch (err) {
          console.error('Unexpected error handling profile:', err);
        }
      }
      setLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Fetch profile again on auth change
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Error fetching profile on auth change:', profileError);
          } else if (profileData) {
            setProfile(profileData as Profile);
          }
        } catch (err) {
          console.error('Unexpected error fetching profile on auth change:', err);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};