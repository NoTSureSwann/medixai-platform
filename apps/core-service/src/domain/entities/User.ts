export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  LABORATORY = "LABORATORY",
  PHARMACY = "PHARMACY",
  NURSE = "NURSE",
  CASHIER = "CASHIER",
}

export interface User {
  id?: string; // Maps to MongoDB _id
  firebaseUid: string; // Firebase Auth Identifier
  email: string;
  name: string;
  role: UserRole;
  hospitalId: string; // Multi-Tenant Isolation
  departmentId?: string; // Hierarchical RBAC
  createdAt: Date;
  updatedAt: Date;
  // Role-specific fields
  medicalRecordNumber?: string; // For PATIENT
  specialization?: string; // For DOCTOR
}
