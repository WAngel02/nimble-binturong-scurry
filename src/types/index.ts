export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialty: string;
  appointment_date: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  patient_id?: string;
  doctor_id?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  role: 'admin' | 'doctor';
  updated_at: string;
}