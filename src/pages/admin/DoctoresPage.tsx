import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Profile } from '@/types';

const specialties = ["Consulta General", "Odontología", "Cardiología"];

const DoctoresPage = () => {
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Profile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    specialty: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'doctor')
      .order('full_name');

    if (error) {
      console.error('Error fetching doctors:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
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
        // Actualizar doctor existente
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            specialty: formData.specialty
          })
          .eq('id', editingDoctor.id);

        if (error) {
          console.error('Error updating doctor:', error);
          toast({ title: 'Error', description: 'No se pudo actualizar el doctor: ' + error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Éxito', description: 'Doctor actualizado correctamente.' });
          fetchDoctors();
          resetForm();
        }
      } else {
        // Crear nuevo doctor usando Edge Function
        if (!formData.email || !formData.password || !formData.full_name) {
          toast({ title: 'Error', description: 'Todos los campos son requeridos.', variant: 'destructive' });
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({ title: 'Error', description: 'No estás autenticado.', variant: 'destructive' });
          return;
        }

        console.log('Sending request to create doctor:', {
          email: formData.email,
          full_name: formData.full_name,
          specialty: formData.specialty
        });

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
            specialty: formData.specialty
          }),
        });

        const result = await response.json();
        console.log('Response from create-doctor:', result);

        if (!response.ok) {
          console.error('Error response:', result);
          toast({ 
            title: 'Error', 
            description: result.error || `Error ${response.status}: ${response.statusText}`, 
            variant: 'destructive' 
          });
        } else {
          toast({ title: 'Éxito', description: 'Doctor creado correctamente.' });
          fetchDoctors();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({ 
        title: 'Error', 
        description: 'Error inesperado: ' + (error instanceof Error ? error.message : 'Error desconocido'), 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doctor: Profile) => {
    setEditingDoctor(doctor);
    setFormData({
      full_name: doctor.full_name || '',
      specialty: doctor.specialty || '',
      email: '',
      password: ''
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
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
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Error inesperado al eliminar doctor.', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', specialty: '', email: '', password: '' });
    setEditingDoctor(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8">Cargando doctores...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Doctores</h1>
          <p className="text-muted-foreground mt-2">
            Crea y gestiona las cuentas de los doctores del centro médico.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? 'Editar Doctor' : 'Crear Nuevo Doctor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!editingDoctor && (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={submitting}
                      placeholder="doctor@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={submitting}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
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
        <CardHeader>
          <CardTitle>Lista de Doctores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {doctor.specialty || 'Sin especialidad'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doctor.updated_at ? new Date(doctor.updated_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(doctor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay doctores registrados aún.</p>
                      <p className="text-sm">Crea el primer doctor usando el botón "Nuevo Doctor".</p>
                    </div>
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