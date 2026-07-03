import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { UserRole } from "@/core/entities/User";
import { adminAuth } from "@/infrastructure/firebase/firebaseAdmin";

export interface CreateDoctorDTO {
  email: string;
  name: string;
  specialization: string;
}

export class CreateDoctorCommand {
  private userRepo: PrismaUserRepository;

  constructor() {
    this.userRepo = new PrismaUserRepository();
  }

  async execute(data: CreateDoctorDTO) {
    // 1. Check if exists
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error("Email already registered");
    }

    // 2. Create in Firebase Auth (Generate Temporary Password)
    const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
    const firebaseUser = await adminAuth.createUser({
      email: data.email,
      password: tempPassword,
      displayName: data.name,
    });

    // 3. Create in MongoDB with DOCTOR role
    const doctor = await this.userRepo.create({
      firebaseUid: firebaseUser.uid,
      email: data.email,
      name: data.name,
      role: UserRole.DOCTOR,
      hospitalId: "DEFAULT_HOSPITAL",
      specialization: data.specialization,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { doctor, tempPassword };
  }
}
