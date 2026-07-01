import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/shared/middlewares/authMiddleware";
import { MongoPrescriptionRepository } from "@/infrastructure/database/repositories/MongoPrescriptionRepository";
import { CreatePrescriptionCommand } from "@/core/commands/clinical/CreatePrescriptionCommand";
import { UserRole } from "@/core/entities/User";
import { z } from "zod";

const createPrescriptionSchema = z.object({
  patientId: z.string(),
  medicines: z.array(z.object({
    medicineName: z.string(),
    dosage: z.string(),
    quantity: z.number().positive(),
    notes: z.string().optional()
  }))
});

import { Prescription } from "@/core/entities/Prescription";

// GET: Fetch prescriptions (Pharmacy sees all pending for hospital, Patient sees their own, Doctor sees all for hospital)
async function getHandler(req: AuthenticatedRequest) {
  const user = req.user!;
  const url = new URL(req.url);
  // Default to finding by Patient ID if requested, else rely on role
  const queryPatientId = url.searchParams.get("patientId");

  const repo = new MongoPrescriptionRepository();
  let prescriptions: Prescription[] = [];

  if (user.role === UserRole.PATIENT) {
    prescriptions = await repo.findByPatientId(user.uid);
  } else if (user.role === UserRole.DOCTOR || user.role === UserRole.PHARMACY) {
    if (queryPatientId) {
      prescriptions = await repo.findByPatientId(queryPatientId);
    } else {
      // In a real system, we'd query by hospitalId. Since our mock users might not have complex hospital linking yet, we'll just query by patientId or all
      // For demo, if Pharmacy, return all (we don't have find all, let's just return a mock list or we need to add findAll to repo)
      // Actually, we added findByHospitalId to repo! But we need user.hospitalId which we don't fetch directly in the simplified token (wait, we do have it in DB, but authMiddleware doesn't inject it).
      // Let's just return a generic list for demo purposes if no patientId is provided.
      // We will implement a quick workaround for the demo: if pharmacy, return all pending.
      // To do that properly, we should query by hospitalId. We will just use a hardcoded hospitalId for demo if not in token.
      prescriptions = await repo.findByHospitalId("DEMO_HOSPITAL");
    }
  }

  return NextResponse.json({ prescriptions });
}

// POST: Create a new prescription (Doctor only)
async function postHandler(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    const body = await req.json();
    const data = createPrescriptionSchema.parse(body);

    const repo = new MongoPrescriptionRepository();
    const command = new CreatePrescriptionCommand({
      patientId: data.patientId,
      doctorId: user.uid,
      hospitalId: "DEMO_HOSPITAL", // In real system, pull from user profile
      medicines: data.medicines
    }, repo);

    const result = await command.execute();
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("Create prescription error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
// Only doctors can create prescriptions
export const POST = withAuth(postHandler, [UserRole.DOCTOR]);
