import { ICommand } from "../../interfaces/ICommand";
import { Invoice, InvoiceStatus, PaymentMethod } from "../../entities/Invoice";
import { IBillingRepository } from "../../interfaces/IBillingRepository";
import { IPrescriptionRepository } from "../../interfaces/IPrescriptionRepository";
import { DomainError } from "../../exceptions/DomainError";

export class GenerateInvoiceCommand implements ICommand<Invoice> {
  constructor(
    public readonly payload: {
      patientId: string;
      hospitalId: string;
      prescriptionId: string;
      amount: number;
      paymentMethod: PaymentMethod;
    },
    private readonly billingRepo: IBillingRepository,
    private readonly prescriptionRepo: IPrescriptionRepository
  ) {}

  async execute(): Promise<Invoice> {
    const prescription = await this.prescriptionRepo.findById(this.payload.prescriptionId);
    if (!prescription) {
      throw new DomainError("Prescription not found", 404);
    }
    
    // Simulate generation of payment reference (QRIS string or VA number)
    const paymentReference = this.payload.paymentMethod === PaymentMethod.QRIS 
      ? `00020101021126660014ID.CO.GOKLINIK0118${Date.now()}520458125303360540`
      : `88000${Date.now().toString().slice(-8)}`;

    const invoice: Omit<Invoice, "id"> = {
      patientId: this.payload.patientId,
      hospitalId: this.payload.hospitalId,
      prescriptionId: this.payload.prescriptionId,
      amount: this.payload.amount,
      paymentMethod: this.payload.paymentMethod,
      status: InvoiceStatus.UNPAID,
      paymentReference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.billingRepo.create(invoice);
  }
}
