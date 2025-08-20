import { useSession } from '@/providers/SessionProvider';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-128px)]">
        <h1 className="text-3xl font-bold text-primary mb-4">Mi Perfil</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Bienvenido, {session?.user?.email}. Desde aquí podrás gestionar tus citas y tu información personal.
        </p>
        <Button onClick={handleLogout} variant="destructive">
          Cerrar Sesión
        </Button>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;