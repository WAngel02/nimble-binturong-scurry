import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from "@/types";

const AppointmentDetailsModal = ({ appointment, isOpen, onClose }: { appointment: Appointment | null, isOpen: boolean, onClose: () => void }) => {
  if (!appointment) return null;

  const statusMap: { [key: string]: { text: string; variant: 'secondary' | 'default' | 'destructive' } } = {
    pending: { text: 'Pendiente', variant: 'secondary' },
    confirmed: { text: 'Confirmada', variant: 'default' },
    cancelled: { text: 'Cancelada', variant: 'destructive' },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogDescription>
            Información completa de la cita programada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Paciente</span>
            <span className="text-sm">{appointment.full_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Fecha y Hora</span>
            <span className="text-sm">{format(new Date(appointment.appointment_date), "eeee, d 'de' MMMM 'de' yyyy 'a las' p", { locale: es })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Especialidad</span>
            <span className="text-sm">{appointment.specialty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Doctor</span>
            <span className="text-sm">{appointment.doctor?.full_name || 'No asignado'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Estado</span>
            <Badge variant={statusMap[appointment.status]?.variant || 'secondary'}>
              {statusMap[appointment.status]?.text || appointment.status}
            </Badge>
          </div>
          {appointment.notes && (
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Notas</span>
              <p className="text-sm p-2 bg-muted rounded-md">{appointment.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;