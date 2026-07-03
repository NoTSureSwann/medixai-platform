import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { UserRole } from "@/core/entities/User";

export interface RegisterPatientDTO {
  firebaseUid: string;
  email: string;
  name: string;
}

export class RegisterPatientCommand {
  private userRepo: PrismaUserRepository;

  constructor() {
    this.userRepo = new PrismaUserRepository();
  }

  async execute(data: RegisterPatientDTO) {
    const existing = await this.userRepo.findByFirebaseUid(data.firebaseUid);
    if (existing) {
      throw new Error("Patient already registered");
    }

    const patient = await this.userRepo.create({
      firebaseUid: data.firebaseUid,
      email: data.email,
      name: data.name,
      role: UserRole.PATIENT,
      hospitalId: "DEFAULT_HOSPITAL",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return patient;
  }
}
