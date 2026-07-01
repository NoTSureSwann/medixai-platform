export enum PaymentMethod {
  QRIS = "QRIS",
  VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT",
  CASH = "CASH",
}

export enum InvoiceStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface Invoice {
  id?: string;
  patientId: string;
  hospitalId: string;
  prescriptionId?: string; // Optional if bill is not for a prescription
  amount: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  paymentReference?: string; // QRIS data or VA number
  createdAt: Date;
  updatedAt: Date;
}
