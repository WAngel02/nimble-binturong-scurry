import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const HeaderAdmin = () => {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          <div className="flex items-center space-x-4">
            {session && (
              <p className="text-sm text-gray-600">Hola, {profile?.full_name || session.user.email}</p>
            )}
            <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;