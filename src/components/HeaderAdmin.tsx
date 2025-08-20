import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/providers/SessionProvider';
import { useNavigate } from 'react-router-dom';

const HeaderAdmin = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary">Centro Médico Vitalis - Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            {session && (
              <p className="text-sm text-gray-600">Hola, {session.user.email}</p>
            )}
            <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;