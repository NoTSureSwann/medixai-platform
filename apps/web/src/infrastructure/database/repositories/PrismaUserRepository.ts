import { prisma } from "../prisma";
import { User, UserRole } from "../../../core/entities/User";
import { IUserRepository } from "../../../core/interfaces/IUserRepository";
import { User as PrismaUser, UserRole as PrismaUserRole } from "@prisma/client";

export class PrismaUserRepository implements IUserRepository {
  private mapToEntity(user: PrismaUser): User {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role as unknown as UserRole,
      hospitalId: user.hospitalId,
      departmentId: user.departmentId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      medicalRecordNumber: user.medicalRecordNumber || undefined,
      specialization: user.specialization || undefined,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }

  async findByFirebaseUid(uid: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.mapToEntity(user) : null;
  }

  async create(user: Omit<User, "id">): Promise<User> {
    const prismaUser = await prisma.user.create({
      data: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role as unknown as PrismaUserRole,
        hospitalId: user.hospitalId,
        departmentId: user.departmentId || null,
        medicalRecordNumber: user.medicalRecordNumber || null,
        specialization: user.specialization || null,
      },
    });
    return this.mapToEntity(prismaUser);
  }

  async update(id: string, userUpdate: Partial<User>): Promise<User | null> {
    const data: Partial<PrismaUser> = {};
    if (userUpdate.name !== undefined) data.name = userUpdate.name;
    if (userUpdate.email !== undefined) data.email = userUpdate.email;
    if (userUpdate.role !== undefined) data.role = userUpdate.role as unknown as PrismaUserRole;
    if (userUpdate.hospitalId !== undefined) data.hospitalId = userUpdate.hospitalId;
    if (userUpdate.departmentId !== undefined) data.departmentId = userUpdate.departmentId || null;
    if (userUpdate.medicalRecordNumber !== undefined) data.medicalRecordNumber = userUpdate.medicalRecordNumber || null;
    if (userUpdate.specialization !== undefined) data.specialization = userUpdate.specialization || null;

    const prismaUser = await prisma.user.update({
      where: { id },
      data,
    });
    return this.mapToEntity(prismaUser);
  }
}
