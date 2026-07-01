import { Prescription } from "../entities/Prescription";

export interface IPrescriptionRepository {
  create(prescription: Omit<Prescription, "id">): Promise<Prescription>;
  findById(id: string): Promise<Prescription | null>;
  findByPatientId(patientId: string): Promise<Prescription[]>;
  findByHospitalId(hospitalId: string): Promise<Prescription[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
