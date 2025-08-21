import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Loader2, UserPlus } from 'lucide-react';
import { Profile } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { MultiSelect } from '@/components/ui/multi-select';

const specialties = ["Consulta General", "Odontología", "Cardiología", "Pediatría", "Traumatología", "Psicología"];
const specialtyOptions = specialties.map(s => ({ value: s, label: s }));

const DoctoresPage = () => {
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    specialties: [] as string[],
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, specialties, phone, address, updated_at, role')
      .eq('role', 'doctor');

    if (error) {
      console.error('Error fetching doctors:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los doctores: ' + error.message, variant: 'destructive' });
    } else {
      setDoctors(data as Profile[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingDoctor) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            specialties: formData.specialties,
            phone: formData.phone,
            address: formData.address
          })
          .eq('id', editingDoctor.id);

        if (error) {
          toast({ title: 'Error', description: 'No se pudo actualizar el doctor: ' + error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Éxito', description: 'Doctor actualizado correctamente.' });
          fetchDoctors();
          resetForm();
        }
      } else {
        if (!formData.email || !formData.password || !formData.full_name) {
          toast({ title: 'Error', description: 'Email, contraseña y nombre son requeridos.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({ title: 'Error', description: 'No estás autenticado.', variant: 'destructive' });
          setSubmitting(false);
          return;
        }

        const response = await fetch(`https://qazhqnrhjmjpklhzyprd.supabase.co/functions/v1/create-doctor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            specialties: formData.specialties,
            phone: formData.phone,
            address: formData.address
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          toast({ title: 'Error', description: result.error || `Error ${response.status}`, variant: 'destructive' });
        } else {
          toast({ title: 'Éxito', description: 'Doctor creado correctamente.' });
          fetchDoctors();
          resetForm();
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error inesperado: ' + (error instanceof Error ? error.message : 'Error desconocido'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor: Profile) => {
    setEditingDoctor(doctor);
    setFormData({
      full_name: doctor.full_name || '',
      specialties: doctor.specialties || [],
      email: '',
      password: '',
      phone: doctor.phone || '',
      address: doctor.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este doctor? Esta acción no se puede deshacer.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Error', description: 'No estás autenticado.', variant: 'destructive' });
        return;
      }

      const response = await fetch(`https://qazhqnrhjmjpklhzyprd.supabase.co/functions/v1/delete-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ doctorId }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast({ title: 'Error', description: result.error || 'Error al eliminar doctor.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Doctor eliminado correctamente.' });
        fetchDoctors();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error inesperado al eliminar doctor.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', specialties: [], email: '', password: '', phone: '', address: '' });
    setEditingDoctor(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Doctores</h1>
          <p className="text-muted-foreground mt-2">Crea y gestiona las cuentas de los doctores.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => !isOpen && resetForm()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? 'Editar Doctor' : 'Crear Nuevo Doctor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nombre Completo</Label>
                  <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={submitting || !!editingDoctor} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={submitting} />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={submitting} />
                </div>
              </div>
              <div>
                <Label htmlFor="specialties">Especialidades</Label>
                <MultiSelect
                  options={specialtyOptions}
                  selected={formData.specialties}
                  onChange={(selected) => setFormData({ ...formData, specialties: selected })}
                  placeholder="Selecciona especialidades..."
                />
              </div>
              {!editingDoctor && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={submitting} placeholder="Mínimo 6 caracteres" minLength={6} />
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingDoctor ? 'Actualizar' : 'Crear Doctor'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de Doctores</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.full_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialties?.map(s => <Badge key={s} variant="secondary">{s}</Badge>) || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(doctor)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    <EmptyState 
                      icon={<UserPlus className="h-8 w-8 text-muted-foreground" />}
                      title="No hay doctores registrados"
                      description="Crea un nuevo doctor para empezar a gestionar sus citas y pacientes."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctoresPage;