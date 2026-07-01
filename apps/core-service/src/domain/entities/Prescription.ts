export enum PrescriptionStatus {
  PENDING = "PENDING",
  DISPENSED = "DISPENSED",
}

export type ValidationStatus = "PENDING_PHARMACY" | "WAITING_DOCTOR_VALIDATION" | "VALIDATED";

export interface MedicineLineItem {
  medicineName: string;
  dosage: string;
  quantity: number;
  notes?: string;
}

export interface Prescription {
  id?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  hospitalId: string;
  medicines: MedicineLineItem[]; // What doctor requested
  pharmacyMedicines?: MedicineLineItem[]; // What pharmacy inputted
  status: PrescriptionStatus;
  validationStatus: ValidationStatus;
  createdAt: Date;
  updatedAt: Date;
}
