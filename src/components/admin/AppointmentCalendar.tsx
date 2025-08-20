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
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'doctor');

      if (doctorsError) {
        toast({ title: 'Error', description: 'No se pudieron cargar los doctores.', variant: 'destructive' });
        return;
      }

      const colors = new Map();
      doctorsData.forEach((doc, index) => {
        colors.set(doc.id, DOCTOR_COLORS[index % DOCTOR_COLORS.length]);
      });
      setDoctorColors(colors);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, doctor:profiles(full_name)');

      if (appointmentsError) {
        toast({ title: 'Error', description: 'No se pudieron cargar las citas.', variant: 'destructive' });
      } else {
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
            doctorName: apt.doctor?.full_name,
          },
        }));
        setEvents(formattedEvents as any);
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