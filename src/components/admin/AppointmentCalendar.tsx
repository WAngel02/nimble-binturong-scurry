import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AppointmentDetailsModal from './AppointmentDetailsModal';

const DOCTOR_COLORS = ['#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#D0021B', '#9013FE', '#7ED321', '#BD10E0'];

const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [doctorColors, setDoctorColors] = useState(new Map());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointmentsAndDoctors = async () => {
      try {
        // Primero obtener los doctores
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'doctor');

        if (doctorsError) {
          console.error('Error fetching doctors:', doctorsError);
          toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
          return;
        }

        // Crear mapa de colores para doctores
        const colors = new Map();
        doctorsData.forEach((doc, index) => {
          colors.set(doc.id, DOCTOR_COLORS[index % DOCTOR_COLORS.length]);
        });
        setDoctorColors(colors);

        // Crear mapa de nombres de doctores
        const doctorNames = new Map();
        doctorsData.forEach((doc) => {
          doctorNames.set(doc.id, doc.full_name);
        });

        // Obtener las citas
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true });

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          toast({ title: 'Error', description: 'No se pudieron cargar las citas.', variant: 'destructive' });
          return;
        }

        // Formatear eventos para el calendario
        const formattedEvents = appointmentsData.map((apt: any) => ({
          id: apt.id,
          title: apt.full_name,
          start: new Date(apt.appointment_date),
          allDay: false,
          backgroundColor: apt.doctor_id ? colors.get(apt.doctor_id) : '#808080',
          borderColor: apt.doctor_id ? colors.get(apt.doctor_id) : '#808080',
          extendedProps: {
            specialty: apt.specialty,
            status: apt.status,
            notes: apt.notes,
            doctorName: apt.doctor_id ? doctorNames.get(apt.doctor_id) : 'No asignado',
            email: apt.email,
            phone: apt.phone,
          },
        }));
        
        setEvents(formattedEvents as any);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({ title: 'Error', description: 'Error inesperado al cargar los datos.', variant: 'destructive' });
      }
    };

    fetchAppointmentsAndDoctors();
  }, []);

  const handleEventClick = (clickInfo: any) => {
    setSelectedAppointment(clickInfo.event);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="timeGridWeek"
          events={events}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
        />
      </div>
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AppointmentCalendar;