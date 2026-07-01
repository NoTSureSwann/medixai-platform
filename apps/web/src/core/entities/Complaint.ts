export enum ComplaintStatus {
  SUBMITTED = "SUBMITTED",
  REVIEWING = "REVIEWING",
  APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED",
  RESOLVED = "RESOLVED"
}

export interface Complaint {
  id?: string;
  patientId: string;
  patientName?: string; // Cache patient name for UI
  polyclinicId: string;
  doctorId: string; // The selected doctor
  symptoms: string; // e.g. "Demam, Batuk"
  complaintText: string; // Detail keluhan
  status: ComplaintStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
