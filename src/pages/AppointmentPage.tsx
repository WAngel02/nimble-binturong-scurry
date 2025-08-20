import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

const services = ["Consulta General", "Odontología", "Cardiología"];

const appointmentFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  phone: z.string().optional(),
  specialty: z.string({ required_error: "Por favor, selecciona una especialidad." }),
  doctorId: z.string().optional(),
  date: z.date({ required_error: "Por favor, selecciona una fecha." }),
  time: z.string({ required_error: "Por favor, selecciona una hora." }),
  notes: z.string().optional(),
});

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
}

const AppointmentPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Cargar doctores al montar el componente
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, specialty')
        .eq('role', 'doctor')
        .order('full_name');

      if (error) {
        console.error('Error fetching doctors:', error);
        toast({ 
          title: 'Error', 
          description: 'No se pudieron cargar los doctores disponibles.', 
          variant: 'destructive' 
        });
      } else {
        setDoctors(data || []);
      }
      setLoadingDoctors(false);
    };

    fetchDoctors();
  }, []);

  // Filtrar doctores cuando cambia la especialidad
  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(doctor => 
        doctor.specialty === selectedSpecialty || 
        !doctor.specialty // Incluir doctores sin especialidad específica
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty, doctors]);

  const generateTimeSlots = () => {
    const slots = [];
    const baseDate = new Date('1970-01-01T00:00:00');
    const startTime = new Date(baseDate);
    startTime.setHours(9, 0, 0, 0); // 9:00 AM
    const endTime = new Date(baseDate);
    endTime.setHours(17, 0, 0, 0); // 5:00 PM

    while (startTime < endTime) {
      slots.push(format(startTime, 'HH:mm'));
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    form.setValue('specialty', specialty);
    form.setValue('doctorId', ''); // Limpiar doctor seleccionado cuando cambia especialidad
  };

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    const { fullName, email, phone, specialty, doctorId, date, time, notes } = values;
    
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const appointmentData: any = {
      full_name: fullName,
      email,
      phone,
      specialty,
      appointment_date: appointmentDateTime.toISOString(),
      notes,
    };

    // Solo agregar doctor_id si se seleccionó uno
    if (doctorId) {
      appointmentData.doctor_id = doctorId;
    }

    const { error } = await supabase.from("appointments").insert(appointmentData);

    if (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al agendar tu cita. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Cita Agendada!",
        description: "Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.",
      });
      form.reset({ fullName: '', email: '', phone: '', notes: '', doctorId: '' });
      setSelectedSpecialty('');
    }
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">Agenda tu Cita</h1>
          <p className="text-muted-foreground text-center mb-8">
            Completa el formulario y nos pondremos en contacto contigo para confirmar.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="juan.perez@correo.com" {...field} />
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
                      <FormLabel>Teléfono (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +1 555 123 4567" {...field} />
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
                    <Select onValueChange={handleSpecialtyChange} defaultValue={field.value}>
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
              
              {/* Campo de Doctor - Solo se muestra si hay especialidad seleccionada */}
              {selectedSpecialty && (
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Doctor Preferido (Opcional)
                        {loadingDoctors && <span className="text-sm text-muted-foreground ml-2">Cargando...</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loadingDoctors}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              loadingDoctors 
                                ? "Cargando doctores..." 
                                : filteredDoctors.length > 0 
                                  ? "Selecciona un doctor o deja en blanco" 
                                  : "No hay doctores disponibles para esta especialidad"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin preferencia de doctor</SelectItem>
                          {filteredDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.full_name}
                              {doctor.specialty && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  - {doctor.specialty}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedSpecialty && filteredDoctors.length === 0 && !loadingDoctors && (
                        <p className="text-sm text-muted-foreground">
                          No hay doctores especializados en {selectedSpecialty} disponibles actualmente.
                          Puedes continuar sin seleccionar doctor y te asignaremos uno disponible.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de la Cita</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Elige una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today; // Solo deshabilitar fechas anteriores a hoy
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hora de la Cita</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una hora" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente el motivo de tu consulta..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                Enviar Solicitud de Cita
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AppointmentPage;