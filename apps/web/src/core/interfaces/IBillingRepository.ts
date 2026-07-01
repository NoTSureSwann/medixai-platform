import { Invoice } from "../entities/Invoice";

export interface IBillingRepository {
  create(invoice: Omit<Invoice, "id">): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByPatientId(patientId: string): Promise<Invoice[]>;
  updateStatus(id: string, status: string): Promise<void>;
}
