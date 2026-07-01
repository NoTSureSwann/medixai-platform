import { ICommand } from "../../interfaces/ICommand";
import { InvoiceStatus } from "../../entities/Invoice";
import { PrescriptionStatus } from "../../entities/Prescription";
import { IBillingRepository } from "../../interfaces/IBillingRepository";
import { IPrescriptionRepository } from "../../interfaces/IPrescriptionRepository";
import { DomainError } from "../../exceptions/DomainError";

export class ProcessPaymentCommand implements ICommand<void> {
  constructor(
    public readonly payload: {
      invoiceId: string;
    },
    private readonly billingRepo: IBillingRepository,
    private readonly prescriptionRepo: IPrescriptionRepository
  ) {}

  async execute(): Promise<void> {
    const invoice = await this.billingRepo.findById(this.payload.invoiceId);
    if (!invoice) {
      throw new DomainError("Invoice not found", 404);
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new DomainError("Invoice is already paid", 400);
    }

    await this.billingRepo.updateStatus(invoice.id!, InvoiceStatus.PAID);
    
    if (invoice.prescriptionId) {
      await this.prescriptionRepo.updateStatus(invoice.prescriptionId, PrescriptionStatus.DISPENSED);
    }
  }
}
