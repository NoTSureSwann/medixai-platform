'use server';

import { z } from 'zod';
import { UserRole } from '../../core/entities/User';
import { AppointmentStatus } from '../../core/entities/Appointment';
import { MongoMedicalRecordRepository } from '../../infrastructure/database/repositories/MongoMedicalRecordRepository';
import { MongoAppointmentRepository } from '../../infrastructure/database/repositories/MongoAppointmentRepository';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(obj: any) { return JSON.parse(JSON.stringify(obj)); }

// Define the Zod schema for EMR submission
const SOAPSchema = z.object({
  subjective: z.string().min(1, "Subjective note is required"),
  objective: z.string().min(1, "Objective note is required"),
  assessment: z.string().min(1, "Assessment is required"),
  plan: z.string().min(1, "Plan is required"),
});

const ICD10Schema = z.object({
  code: z.string(),
  description: z.string(),
});

const SubmitEMRSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  soapNote: SOAPSchema,
  diagnoses: z.array(ICD10Schema).min(1, "At least one diagnosis is required"),
});

export async function submitEMRAction(formData: z.infer<typeof SubmitEMRSchema>) {
  try {
    // 1. Validate Input
    const parsed = SubmitEMRSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Extract Auth and check RBAC (Only DOCTOR can submit EMR)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { success: false, error: "Unauthorized" };

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    
    if (payload.role !== UserRole.DOCTOR) {
      return { success: false, error: "Forbidden: Only doctors can submit EMRs" };
    }

    const doctorId = payload.uid as string;

    // 3. Verify Appointment
    const appointmentRepo = new MongoAppointmentRepository();
    const appointment = await appointmentRepo.findById(parsed.data.appointmentId);
    
    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return { success: false, error: "EMR for this appointment has already been submitted" };
    }

    // 4. Create Medical Record in DB
    const emrRepo = new MongoMedicalRecordRepository();
    const emr = await emrRepo.create({
      appointmentId: parsed.data.appointmentId,
      patientId: parsed.data.patientId,
      doctorId,
      hospitalId: appointment.hospitalId,
      soapNote: parsed.data.soapNote,
      diagnoses: parsed.data.diagnoses,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Sync State: Mark Appointment as COMPLETED
    await appointmentRepo.updateStatus(parsed.data.appointmentId, AppointmentStatus.COMPLETED);

    return { success: true, emr: serialize(emr) };
  } catch (error) {
    console.error("Submit EMR Error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getPatientEMRHistoryAction(patientId: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { success: false, error: "Unauthorized" };

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    
    // Check if the user is authorized to view this record
    // Doctors and Admins can view any. Patients can only view their own.
    if (payload.role === UserRole.PATIENT && payload.uid !== patientId) {
      return { success: false, error: "Forbidden: You can only view your own records" };
    }

    const emrRepo = new MongoMedicalRecordRepository();
    const records = await emrRepo.findByPatientId(patientId);

    return { success: true, records: serialize(records) };
  } catch (error) {
    console.error("Get EMR History Error:", error);
    return { success: false, error: "Internal server error" };
  }
}
