import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, UserPlus } from 'lucide-react';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/admin/dashboard');
    }
  }, [session, loading, navigate]);

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Hospital className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Centro Médico Vitalis
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Registro para Profesionales Médicos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Información del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Únete a Nuestro Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">¿Eres un profesional médico?</h3>
                <p className="text-gray-600 text-sm">
                  Regístrate en nuestro sistema para gestionar tus citas y pacientes de manera eficiente.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Beneficios del sistema:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gestión de citas automatizada</li>
                  <li>• Calendario personalizado</li>
                  <li>• Historial de pacientes</li>
                  <li>• Notificaciones en tiempo real</li>
                  <li>• Reportes y estadísticas</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Especialidades disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Consulta General</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Cardiología</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Odontología</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de registro */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Cuenta de Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
                theme="light"
                view="sign_up"
                showLinks={true}
                additionalData={{
                  role: 'doctor'
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <a href="/admin/login" className="text-primary hover:underline">
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;