import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Droplet, MapPin, Fingerprint } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PatientProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
      } else {
        setPatient(data);
      }
      setLoading(false);
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="p-8">Cargando perfil del paciente...</div>;
  }

  if (!patient) {
    return <div className="p-8">No se encontró el paciente.</div>;
  }

  const profileItems = [
    { icon: <Mail className="h-5 w-5 text-muted-foreground" />, label: 'Email', value: patient.email },
    { icon: <Phone className="h-5 w-5 text-muted-foreground" />, label: 'Teléfono', value: patient.phone },
    { icon: <Fingerprint className="h-5 w-5 text-muted-foreground" />, label: 'Cédula', value: patient.id_number },
    { icon: <Droplet className="h-5 w-5 text-muted-foreground" />, label: 'Tipo de Sangre', value: patient.blood_type },
    { icon: <MapPin className="h-5 w-5 text-muted-foreground" />, label: 'Dirección', value: patient.address },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/admin/pacientes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pacientes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <User className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">{patient.full_name}</CardTitle>
              <CardDescription>
                Paciente desde {format(new Date(patient.created_at), 'PPP', { locale: es })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {profileItems.map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                {item.icon}
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value || 'No especificado'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfilePage;