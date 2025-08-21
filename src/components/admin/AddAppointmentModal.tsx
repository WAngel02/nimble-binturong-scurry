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
import { Patient, Profile } from "@/types";
import { useEffect, useState } from "react";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const services = ["Consulta General", "Odontología", "Cardiología"];

const appointmentFormSchema = z.object({
  patientId: z.string().optional(),
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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new-patient");

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
  const selectedPatientId = form.watch("patientId");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      const { data, error } = await supabase.from('patients').select('*').order('full_name');
      if (error) {
        toast({ title: "Error", description: "No se pudieron cargar los pacientes.", variant: "destructive" });
      } else {
        setPatients(data || []);
      }
      setLoadingPatients(false);
    };
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = doctors.filter(
        (doc) => doc.specialties?.includes(selectedSpecialty)
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
    form.setValue("doctorId", undefined);
  }, [selectedSpecialty, doctors, form]);

  const handleClose = () => {
    form.reset();
    setActiveTab("new-patient");
    onClose();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    form.reset({
      specialty: form.getValues('specialty'),
      doctorId: form.getValues('doctorId'),
      notes: form.getValues('notes'),
    });
  };

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    if (!selectedDateInfo) return;
    setSubmitting(true);

    try {
      let patientId = values.patientId;
      let patientFullName = values.fullName;
      let patientEmail = values.email;
      let patientPhone = values.phone;

      if (!patientId) { // Es un paciente nuevo
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('email', values.email)
          .maybeSingle();

        if (existingPatient) {
          patientId = existingPatient.id;
        } else {
          const { data: newPatient, error: patientError } = await supabase
            .from('patients')
            .insert({ full_name: values.fullName, email: values.email, phone: values.phone })
            .select()
            .single();
          
          if (patientError) throw new Error("No se pudo crear el perfil del paciente.");
          patientId = newPatient.id;
        }
      } else { // Es un paciente existente
        const selectedPatient = patients.find(p => p.id === patientId);
        if (selectedPatient) {
            patientFullName = selectedPatient.full_name;
            patientEmail = selectedPatient.email;
            patientPhone = selectedPatient.phone;
        }
      }

      const appointmentData = {
        full_name: patientFullName,
        email: patientEmail,
        phone: patientPhone,
        specialty: values.specialty,
        doctor_id: values.doctorId,
        appointment_date: selectedDateInfo.start.toISOString(),
        notes: values.notes,
        status: 'confirmed',
        patient_id: patientId,
      };

      const { error: appointmentError } = await supabase.from("appointments").insert(appointmentData);
      if (appointmentError) throw appointmentError;

      toast({ title: "Cita Creada", description: "La cita ha sido agendada exitosamente." });
      onAppointmentCreated();
      handleClose();

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo crear la cita.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/70 backdrop-blur-lg border-border shadow-premium-lg">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>
            Selecciona un paciente existente o crea uno nuevo para la cita.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-patient">Nuevo Paciente</TabsTrigger>
                <TabsTrigger value="existing-patient">Paciente Existente</TabsTrigger>
              </TabsList>
              <TabsContent value="new-patient" className="space-y-4 pt-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Nombre del Paciente</FormLabel><FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="juan@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+1 555 1234" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </TabsContent>
              <TabsContent value="existing-patient" className="space-y-4 pt-4">
                <FormField control={form.control} name="patientId" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Seleccionar Paciente</FormLabel>
                    <Popover open={isPatientPopoverOpen} onOpenChange={setIsPatientPopoverOpen}><PopoverTrigger asChild>
                      <FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                        {field.value ? patients.find((p) => p.id === field.value)?.full_name : "Selecciona un paciente"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-[450px] p-0"><Command>
                      <CommandInput placeholder="Buscar paciente por nombre o email..." />
                      <CommandList><CommandEmpty>No se encontraron pacientes.</CommandEmpty><CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem value={`${patient.full_name} ${patient.email}`} key={patient.id} onSelect={() => {
                            form.setValue("patientId", patient.id);
                            form.setValue("fullName", patient.full_name);
                            form.setValue("email", patient.email);
                            form.setValue("phone", patient.phone || "");
                            setIsPatientPopoverOpen(false);
                          }}>
                            <Check className={cn("mr-2 h-4 w-4", patient.id === field.value ? "opacity-100" : "opacity-0")} />
                            <div>
                              <p>{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground">{patient.email}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup></CommandList>
                    </Command></PopoverContent></Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                {selectedPatientId && (
                  <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">
                    <p><strong>Paciente:</strong> {form.getValues('fullName')}</p>
                    <p><strong>Email:</strong> {form.getValues('email')}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="border-t pt-4 space-y-4">
              <FormField control={form.control} name="specialty" render={({ field }) => (
                <FormItem><FormLabel>Especialidad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger></FormControl>
                    <SelectContent>{services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="doctorId" render={({ field }) => (
                <FormItem><FormLabel>Asignar Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSpecialty}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un doctor" /></SelectTrigger></FormControl>
                    <SelectContent>{filteredDoctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notas</FormLabel><FormControl><Textarea placeholder="Notas adicionales..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
              <Button type="submit" disabled={submitting || (activeTab === 'existing-patient' && !selectedPatientId)}>
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