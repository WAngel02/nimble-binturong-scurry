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
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
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
    email: ''
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
      // Para crear un nuevo doctor, solo guardamos la información
      // El doctor deberá registrarse por sí mismo usando el formulario de registro
      toast({ 
        title: 'Información', 
        description: `Para agregar un nuevo doctor, envía las credenciales de acceso a ${formData.email} para que se registre en el sistema.`,
        duration: 5000
      });
      resetForm();
    }
  };

  const handleEdit = (doctor: Profile) => {
    setEditingDoctor(doctor);
    setFormData({
      full_name: doctor.full_name || '',
      specialty: doctor.specialty || '',
      email: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este doctor?')) return;

    // Solo eliminar el perfil, no el usuario de auth
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', doctorId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el doctor.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Doctor eliminado correctamente.' });
      fetchDoctors();
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', specialty: '', email: '' });
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
            Los doctores deben registrarse por sí mismos. Aquí puedes editar sus especialidades.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? 'Editar Doctor' : 'Invitar Nuevo Doctor'}
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
                <div>
                  <Label htmlFor="email">Email del Doctor</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Para enviar instrucciones de registro"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDoctor ? 'Actualizar' : 'Enviar Invitación'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Instrucciones para registro */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Mail className="h-5 w-5 mr-2" />
              Instrucciones para Nuevos Doctores
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-2">Para que un doctor se una al sistema:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>El doctor debe ir a <strong>/admin/login</strong></li>
              <li>Hacer clic en "Sign up" para crear una cuenta</li>
              <li>Usar su email profesional y crear una contraseña</li>
              <li>Una vez registrado, aparecerá en esta lista</li>
              <li>Tú puedes editar su especialidad desde aquí</li>
            </ol>
          </CardContent>
        </Card>

        {/* Lista de doctores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Doctores Registrados</CardTitle>
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
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay doctores registrados aún.</p>
                        <p className="text-sm">Invita a los doctores a registrarse en el sistema.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctoresPage;