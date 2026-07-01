export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Appointment {
  id?: string; // Maps to MongoDB _id
  hospitalId: string; // Multi-Tenant Isolation
  patientId: string;
  doctorId: string;
  department: string;
  scheduledTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
