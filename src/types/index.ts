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
  doctor?: { full_name: string };
}

export interface Profile {
  id: string;
  full_name?: string;
  role: 'admin' | 'doctor';
  updated_at: string;
  specialty?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  blood_type?: string;
  address?: string;
  id_number?: string;
}