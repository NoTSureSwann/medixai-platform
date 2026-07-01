import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/shared/middlewares/authMiddleware";
import { MongoBillingRepository } from "@/infrastructure/database/repositories/MongoBillingRepository";
import { MongoPrescriptionRepository } from "@/infrastructure/database/repositories/MongoPrescriptionRepository";
import { GenerateInvoiceCommand } from "@/core/commands/billing/GenerateInvoiceCommand";
import { ProcessPaymentCommand } from "@/core/commands/billing/ProcessPaymentCommand";
import { UserRole } from "@/core/entities/User";
import { PaymentMethod, Invoice } from "@/core/entities/Invoice";
import { z } from "zod";

const generateInvoiceSchema = z.object({
  patientId: z.string(),
  prescriptionId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethod)
});

const processPaymentSchema = z.object({
  invoiceId: z.string(),
});

// GET: Fetch invoices
async function getHandler(req: AuthenticatedRequest) {
  const user = req.user!;
  const url = new URL(req.url);
  const queryPatientId = url.searchParams.get("patientId");

  const repo = new MongoBillingRepository();
  let invoices: Invoice[] = [];

  if (user.role === UserRole.PATIENT) {
    invoices = await repo.findByPatientId(user.uid); // Firebase UID is used as patientId for demo
  } else if (queryPatientId) {
    invoices = await repo.findByPatientId(queryPatientId);
  }

  return NextResponse.json({ invoices });
}

// POST: Generate Invoice (Pharmacy only)
async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const data = generateInvoiceSchema.parse(body);

    const billingRepo = new MongoBillingRepository();
    const prescriptionRepo = new MongoPrescriptionRepository();
    
    const command = new GenerateInvoiceCommand({
      patientId: data.patientId,
      hospitalId: "DEMO_HOSPITAL",
      prescriptionId: data.prescriptionId,
      amount: data.amount,
      paymentMethod: data.paymentMethod
    }, billingRepo, prescriptionRepo);

    const result = await command.execute();
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

// PUT: Process Payment (Simulated Webhook / Patient action)
async function putHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const data = processPaymentSchema.parse(body);

    const billingRepo = new MongoBillingRepository();
    const prescriptionRepo = new MongoPrescriptionRepository();
    
    const command = new ProcessPaymentCommand({
      invoiceId: data.invoiceId
    }, billingRepo, prescriptionRepo);

    await command.execute();
    return NextResponse.json({ success: true, message: "Payment processed successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler, [UserRole.PHARMACY, UserRole.ADMIN]);
export const PUT = withAuth(putHandler); // Both patient and admin can trigger mock payment
