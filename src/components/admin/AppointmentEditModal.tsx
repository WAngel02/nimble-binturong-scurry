import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Appointment, Profile } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, UserPlus } from "lucide-react";

interface AppointmentEditModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const appointmentStatuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const AppointmentEditModal = ({ appointment, isOpen, onClose, onUpdate }: AppointmentEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (appointment) {
      setSelectedDoctorId(appointment.doctor_id || undefined);
      setSelectedStatus(appointment.status);
    }

    const fetchDoctors = async () => {
      if (!appointment) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .or(`specialties.cs.{${appointment.specialty}},specialties.is.null`);
      
      if (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
      } else {
        setDoctors(data as Profile[]);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('appointments')
      .update({ 
        doctor_id: selectedDoctorId,
        status: selectedStatus
      })
      .eq('id', appointment.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Cita actualizada correctamente.' });
      onUpdate();
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleCreatePatient = async () => {
    setIsSubmitting(true);
    try {
      const { data: existingPatient, error: checkError } = await supabase
        .from('patients')
        .select('id')
        .eq('email', appointment.email)
        .maybeSingle();

      if (checkError) throw checkError;

      let patientId;
      if (existingPatient) {
        patientId = existingPatient.id;
        toast({ title: 'Info', description: 'El paciente ya existe en el sistema.' });
      } else {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({ 
            full_name: appointment.full_name, 
            email: appointment.email, 
            phone: appointment.phone 
          })
          .select()
          .single();
        if (patientError) throw patientError;
        patientId = newPatient.id;
        toast({ title: 'Éxito', description: 'Paciente creado correctamente.' });
      }

      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed', patient_id: patientId })
        .eq('id', appointment.id);

      if (appointmentError) throw appointmentError;

      toast({ title: 'Éxito', description: 'Cita confirmada y vinculada al paciente.' });
      onUpdate();
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Error inesperado al crear el paciente.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/70 backdrop-blur-lg border-border shadow-premium-lg">
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogDescription>
            Ver y editar la información de la cita.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold">{appointment.full_name}</h4>
            <p className="text-sm text-muted-foreground">{appointment.email}</p>
            {appointment.phone && <p className="text-sm text-muted-foreground">{appointment.phone}</p>}
          </div>
          <div className="text-sm">
            <p><strong>Fecha:</strong> {format(new Date(appointment.appointment_date), "PPP 'a las' p", { locale: es })}</p>
            <p><strong>Especialidad:</strong> {appointment.specialty}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Asignar doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Cambiar estado" />
              </SelectTrigger>
              <SelectContent>
                {appointmentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {appointment.notes && (
            <div>
              <h5 className="font-medium text-sm">Notas del paciente:</h5>
              <p className="text-sm p-2 bg-muted rounded-md mt-1">{appointment.notes}</p>
            </div>
          )}

          {!appointment.patient_id && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleCreatePatient} 
                disabled={isSubmitting || !selectedDoctorId}
                className="w-full"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Crear Paciente y Confirmar Cita
              </Button>
              {!selectedDoctorId && <p className="text-xs text-center text-muted-foreground mt-2">Debes asignar un doctor para poder crear el paciente.</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentEditModal;