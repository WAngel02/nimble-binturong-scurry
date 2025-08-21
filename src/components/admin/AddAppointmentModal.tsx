import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Profile } from "@/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const services = ["Consulta General", "Odontología", "Cardiología"];

const appointmentFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre es requerido." }),
  email: z.string().email({ message: "Email inválido." }),
  phone: z.string().optional(),
  specialty: z.string({ required_error: "Selecciona una especialidad." }),
  doctorId: z.string().optional(),
  notes: z.string().optional(),
});

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
  selectedDateInfo: { start: Date; end: Date } | null;
  doctors: Profile[];
}

const AddAppointmentModal = ({
  isOpen,
  onClose,
  onAppointmentCreated,
  selectedDateInfo,
  doctors,
}: AddAppointmentModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<Profile[]>([]);

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const selectedSpecialty = form.watch("specialty");

  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(
        (doc) => doc.specialty === selectedSpecialty || !doc.specialty
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
    form.setValue("doctorId", undefined);
  }, [selectedSpecialty, doctors, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    if (!selectedDateInfo) return;
    setSubmitting(true);

    const appointmentData = {
      full_name: values.fullName,
      email: values.email,
      phone: values.phone,
      specialty: values.specialty,
      doctor_id: values.doctorId,
      appointment_date: selectedDateInfo.start.toISOString(),
      notes: values.notes,
      status: 'confirmed', // Las citas creadas por el admin se confirman por defecto
    };

    const { error } = await supabase.from("appointments").insert(appointmentData);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la cita: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cita Creada",
        description: "La cita ha sido agendada exitosamente.",
      });
      onAppointmentCreated();
      handleClose();
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva cita en el calendario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Paciente</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="juan@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                        <Input placeholder="+1 555 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar Doctor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedSpecialty}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales sobre la cita..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cita
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentModal;