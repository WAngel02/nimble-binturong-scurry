import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Hospital } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/'); // Redirigir a la página de inicio después de iniciar sesión
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <Hospital className="h-10 w-10 text-primary" />
        <span className="ml-3 text-2xl font-bold text-primary">Centro Médico Vitalis</span>
      </div>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar sesión',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                link_text: '¿No tienes una cuenta? Regístrate',
              },
              forgotten_password: {
                email_label: 'Correo electrónico',
                button_label: 'Enviar instrucciones',
                link_text: '¿Olvidaste tu contraseña?',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;