import { NextResponse } from "next/server";
import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { withErrorHandler } from "@/shared/middlewares/errorHandler";
import { z } from "zod";
import { UserRole } from "@/core/entities/User";

const userRepo = new PrismaUserRepository();

const createUserSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.nativeEnum(UserRole),
  medicalRecordNumber: z.string().optional(),
  specialization: z.string().optional(),
});

async function postHandler(req: Request) {
  const body = await req.json();
  const data = createUserSchema.parse(body);
  
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const user = await userRepo.create({
    ...data,
    hospitalId: "DEFAULT_HOSPITAL",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json(user, { status: 201 });
}

export const POST = withErrorHandler(postHandler);
