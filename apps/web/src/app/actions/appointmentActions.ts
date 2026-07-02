'use server';

import { z } from 'zod';
import { AppointmentStatus } from '../../core/entities/Appointment';
import { MongoAppointmentRepository } from '../../infrastructure/database/repositories/MongoAppointmentRepository';
import { sendFCMNotification } from '../../features/notifications/notificationService';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(obj: any) { return JSON.parse(JSON.stringify(obj)); }

// Define the Zod schema for appointment creation
const CreateAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  department: z.string().min(1, "Department is required"),
  scheduledTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  notes: z.string().optional(),
});

export async function bookAppointmentAction(formData: z.infer<typeof CreateAppointmentSchema>) {
  try {
    // 1. Validate Input
    const parsed = CreateAppointmentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Extract Auth from Session Cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { success: false, error: "Unauthorized" };

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    
    if (payload.role !== 'PATIENT') {
      return { success: false, error: "Only patients can book appointments directly" };
    }

    const patientId = payload.uid as string;

    // 3. Create Appointment in DB
    const repo = new MongoAppointmentRepository();
    const appointment = await repo.create({
      patientId,
      doctorId: parsed.data.doctorId,
      department: parsed.data.department,
      hospitalId: 'default-hospital-id',
      scheduledTime: new Date(parsed.data.scheduledTime),
      status: AppointmentStatus.SCHEDULED,
      notes: parsed.data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Send Notification (Mock FCM for now)
    await sendFCMNotification(
      appointment.doctorId,
      "New Appointment",
      `A new appointment has been scheduled for ${appointment.scheduledTime.toLocaleString()}`
    );

    return { success: true, appointment: serialize(appointment) };
  } catch (error) {
    console.error("Book Appointment Error:", error);
    return { success: false, error: "Internal server error" };
  }
}
