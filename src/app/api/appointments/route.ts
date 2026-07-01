import { NextResponse } from "next/server";
import { MongoAppointmentRepository } from "@/infrastructure/database/repositories/MongoAppointmentRepository";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { z } from "zod";
import { AppointmentStatus } from "@/core/entities/Appointment";

const apptRepo = new MongoAppointmentRepository();

const createApptSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  department: z.string().min(1, "Department is required"),
  scheduledTime: z.string().datetime(),
  notes: z.string().optional(),
});

async function postHandler(req: Request) {
  const body = await req.json();
  const data = createApptSchema.parse(body);

  const appt = await apptRepo.create({
    ...data,
    hospitalId: "DEFAULT_HOSPITAL",
    scheduledTime: new Date(data.scheduledTime),
    status: AppointmentStatus.SCHEDULED,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json(appt, { status: 201 });
}

export const POST = withErrorHandler(postHandler);
