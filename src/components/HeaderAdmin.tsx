import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const HeaderAdmin = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cerrar la sesión correctamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sesión cerrada',
          description: 'Has cerrado sesión exitosamente.',
        });
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al cerrar sesión.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {profile?.role === 'admin' ? 'Panel de Administración' : 'Panel de Doctor'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {session && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {profile?.full_name || session.user.email}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {profile?.role === 'admin' ? 'Administrador' : 'Doctor'}
                </span>
              </div>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;