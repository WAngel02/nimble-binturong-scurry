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

const AppointmentDetailsModal = ({ appointment, isOpen, onClose }: { appointment: any, isOpen: boolean, onClose: () => void }) => {
  if (!appointment) return null;

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
            <span className="text-sm">{appointment.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Fecha y Hora</span>
            <span className="text-sm">{format(appointment.start, "eeee, d 'de' MMMM 'de' yyyy 'a las' p", { locale: es })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Especialidad</span>
            <span className="text-sm">{appointment.extendedProps.specialty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Doctor</span>
            <span className="text-sm">{appointment.extendedProps.doctorName || 'No asignado'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Estado</span>
            <Badge variant={appointment.extendedProps.status === 'pending' ? 'secondary' : 'default'}>
              {appointment.extendedProps.status === 'pending' ? 'Pendiente' : 'Confirmada'}
            </Badge>
          </div>
          {appointment.extendedProps.notes && (
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Notas</span>
              <p className="text-sm p-2 bg-muted rounded-md">{appointment.extendedProps.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;