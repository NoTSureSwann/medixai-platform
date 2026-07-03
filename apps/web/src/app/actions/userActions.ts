'use server';

import { z } from 'zod';
import { UserRole } from '../../core/entities/User';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(obj: any) { return JSON.parse(JSON.stringify(obj)); }

// Define the Zod schema for Doctor creation
const CreateDoctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email format"),
  specialization: z.string().min(2, "Specialization is required"),
});

export async function createDoctorAction(formData: z.infer<typeof CreateDoctorSchema>) {
  try {
    // 1. Validate Input
    const parsed = CreateDoctorSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Extract Auth and check RBAC (Only ADMIN can create doctors)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return { success: false, error: "Unauthorized" };

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    
    if (payload.role !== UserRole.ADMIN && payload.role !== UserRole.SUPER_ADMIN) {
      return { success: false, error: "Forbidden: Only admins can create doctors" };
    }

    // 3. Check if email already exists
    const repo = new PrismaUserRepository();
    const existingUser = await repo.findByEmail(parsed.data.email);
    if (existingUser) {
      return { success: false, error: "Email is already registered" };
    }

    // 4. Create Doctor in DB
    const firebaseUid = `mock-DOCTOR-${Date.now()}`;
    const doctor = await repo.create({
      firebaseUid,
      email: parsed.data.email,
      name: parsed.data.name,
      role: UserRole.DOCTOR,
      hospitalId: 'default-hospital-id',
      specialization: parsed.data.specialization,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, doctor: serialize(doctor) };
  } catch (error) {
    console.error("Create Doctor Error:", error);
    return { success: false, error: "Internal server error" };
  }
}
