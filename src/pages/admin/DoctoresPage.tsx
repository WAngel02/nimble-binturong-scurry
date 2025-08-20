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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Profile } from '@/types';

const specialties = ["Consulta General", "Odontología", "Cardiología"];

const DoctoresPage = () => {
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Profile | null>(null);
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
      toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
    } else {
      setDoctors(data as Profile[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        toast({ title: 'Error', description: 'No se pudo actualizar el doctor.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Doctor actualizado correctamente.' });
        fetchDoctors();
        resetForm();
      }
    } else {
      // Crear nuevo doctor
      if (!formData.email || !formData.password) {
        toast({ title: 'Error', description: 'Email y contraseña son requeridos para crear un nuevo doctor.', variant: 'destructive' });
        return;
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true
      });

      if (authError) {
        toast({ title: 'Error', description: 'No se pudo crear el usuario: ' + authError.message, variant: 'destructive' });
        return;
      }

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.full_name,
          specialty: formData.specialty,
          role: 'doctor'
        });

      if (profileError) {
        toast({ title: 'Error', description: 'No se pudo crear el perfil del doctor.', variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: 'Doctor creado correctamente.' });
        fetchDoctors();
        resetForm();
      }
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
    if (!confirm('¿Estás seguro de que quieres eliminar este doctor?')) return;

    const { error } = await supabase.auth.admin.deleteUser(doctorId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el doctor.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Doctor eliminado correctamente.' });
      fetchDoctors();
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
        <h1 className="text-3xl font-bold">Gestión de Doctores</h1>
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
                {editingDoctor ? 'Editar Doctor' : 'Nuevo Doctor'}
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
                />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
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
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDoctor ? 'Actualizar' : 'Crear'}
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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {doctor.specialty || 'Sin especialidad'}
                    </Badge>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctoresPage;