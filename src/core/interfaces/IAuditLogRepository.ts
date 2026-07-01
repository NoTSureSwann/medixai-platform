import { AuditLog } from "../entities/AuditLog";

export interface IAuditLogRepository {
  create(log: AuditLog): Promise<AuditLog>;
  findByHospitalId(hospitalId: string, limit?: number): Promise<AuditLog[]>;
  findByUserId(userId: string, limit?: number): Promise<AuditLog[]>;
}
