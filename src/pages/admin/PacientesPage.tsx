import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Patient } from '@/types';
import { Link, useSearchParams } from 'react-router-dom';

const PacientesPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    id_number: '',
    blood_type: '',
    address: ''
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchTerm = searchParams.get('search');
    fetchPatients(searchTerm);
  }, [searchParams]);

  const fetchPatients = async (searchTerm: string | null) => {
    setLoading(true);
    let query = supabase
      .from('patients')
      .select('*');

    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('full_name');

    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los pacientes.', variant: 'destructive' });
    } else {
      setPatients(data as Patient[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      id_number: formData.id_number,
      blood_type: formData.blood_type,
      address: formData.address,
    };

    if (editingPatient) {
      const { error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', editingPatient.id);

      if (error) {
        toast({ title: 'Error', description: 'No se pudo actualizar el paciente.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Paciente actualizado correctamente.' });
        fetchPatients(searchParams.get('search'));
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('patients')
        .insert(patientData);

      if (error) {
        toast({ title: 'Error', description: 'No se pudo crear el paciente.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Paciente creado correctamente.' });
        fetchPatients(searchParams.get('search'));
        resetForm();
      }
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone || '',
      id_number: patient.id_number || '',
      blood_type: patient.blood_type || '',
      address: patient.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paciente?')) return;

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el paciente.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Paciente eliminado correctamente.' });
      fetchPatients(searchParams.get('search'));
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', phone: '', id_number: '', blood_type: '', address: '' });
    setEditingPatient(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8">Cargando pacientes...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="id_number">Cédula de Identidad</Label>
                  <Input id="id_number" value={formData.id_number} onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="blood_type">Tipo de Sangre</Label>
                  <Input id="blood_type" value={formData.blood_type} onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit">{editingPatient ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.full_name}</TableCell>
                  <TableCell>{patient.id_number || 'N/A'}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/pacientes/${patient.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(patient.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacientesPage;