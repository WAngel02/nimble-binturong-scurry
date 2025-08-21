import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, User, Stethoscope, Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointmentDetails: any;
  doctorName?: string;
  isSubmitting: boolean;
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-semibold">{value || 'No especificado'}</p>
    </div>
  </div>
);

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDetails,
  doctorName,
  isSubmitting,
}: ConfirmationModalProps) => {
  if (!appointmentDetails || !appointmentDetails.date || !appointmentDetails.time) {
    return null;
  }

  const formattedDate = format(appointmentDetails.date, "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = appointmentDetails.time;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirma tu Reserva</DialogTitle>
          <DialogDescription>
            Por favor, revisa los detalles de tu cita antes de confirmar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <DetailItem icon={<User className="h-5 w-5" />} label="Paciente" value={appointmentDetails.fullName} />
          <DetailItem icon={<Stethoscope className="h-5 w-5" />} label="Especialidad" value={appointmentDetails.specialty} />
          <DetailItem icon={<User className="h-5 w-5" />} label="Doctor" value={doctorName} />
          <DetailItem icon={<Calendar className="h-5 w-5" />} label="Fecha" value={formattedDate} />
          <DetailItem icon={<Clock className="h-5 w-5" />} label="Hora" value={formattedTime} />
          {appointmentDetails.notes && (
            <DetailItem icon={<FileText className="h-5 w-5" />} label="Notas Adicionales" value={appointmentDetails.notes} />
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;