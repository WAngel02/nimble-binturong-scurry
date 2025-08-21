import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpecialtySelector from "@/components/booking/SpecialtySelector";
import DoctorSelector from "@/components/booking/DoctorSelector";
import TimeSelector from "@/components/booking/TimeSelector";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const appointmentFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  phone: z.string().optional(),
  notes: z.string().optional(),
  specialty: z.string({ required_error: "Por favor, selecciona una especialidad." }),
  doctorId: z.string({ required_error: "Por favor, selecciona un doctor." }),
  date: z.date({ required_error: "Por favor, selecciona una fecha." }),
  time: z.string({ required_error: "Por favor, selecciona una hora." }),
});

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
}

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
  });

  const selectedSpecialty = form.watch("specialty");
  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, specialty')
        .eq('role', 'doctor')
        .order('full_name');

      if (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
      } else {
        setDoctors(data || []);
      }
      setLoadingDoctors(false);
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(doc => doc.specialty === selectedSpecialty || !doc.specialty);
      setFilteredDoctors(filtered);
      form.setValue("doctorId", ""); // Reset doctor on specialty change
      form.setValue("date", undefined);
      form.setValue("time", "");
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty, doctors, form]);

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    setIsSubmitting(true);
    const { fullName, email, phone, specialty, doctorId, date, time, notes } = values;
    
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const { error } = await supabase.from("appointments").insert({
      full_name: fullName,
      email,
      phone,
      specialty,
      doctor_id: doctorId,
      appointment_date: appointmentDateTime.toISOString(),
      notes,
    });

    if (error) {
      toast({ title: "Error", description: "Hubo un problema al agendar tu cita.", variant: "destructive" });
    } else {
      toast({ title: "¡Cita Agendada!", description: "Hemos recibido tu solicitud." });
      form.reset();
    }
    setIsSubmitting(false);
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">Agenda tu Cita</h1>
          <p className="text-muted-foreground text-center mb-8">
            Completa tus datos y sigue los pasos para encontrar tu cita ideal.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="shadow-premium-md">
                <CardHeader><CardTitle>1. Tus Datos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="juan.perez@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono (Opcional)</FormLabel><FormControl><Input placeholder="Ej: +1 555 123 4567" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notas Adicionales (Opcional)</FormLabel><FormControl><Textarea placeholder="Describe brevemente el motivo de tu consulta..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card className="shadow-premium-md">
                <CardHeader><CardTitle>2. Selecciona tu Cita</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="specialty" render={({ field }) => (
                    <FormItem><FormControl><SpecialtySelector value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  {selectedSpecialty && (
                    <FormField control={form.control} name="doctorId" render={({ field }) => (
                      <FormItem><FormControl><DoctorSelector doctors={filteredDoctors} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}

                  {selectedDoctorId && (
                    <FormField control={form.control} name="date" render={({ field: dateField }) => (
                      <FormField control={form.control} name="time" render={({ field: timeField }) => (
                        <FormItem><FormControl>
                          <TimeSelector 
                            selectedDate={dateField.value} 
                            onDateChange={dateField.onChange}
                            selectedTime={timeField.value}
                            onTimeChange={timeField.onChange}
                          />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                    )} />
                  )}
                </CardContent>
              </Card>

              {(selectedDate && selectedTime) && (
                <Card className="bg-primary/10 border-primary/20 shadow-premium-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Tu cita está casi lista:</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })} a las {selectedTime}
                      </p>
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Cita
                    </Button>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentPage;