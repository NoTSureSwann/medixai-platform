import { AuditLog, AuditAction } from "../entities/AuditLog";
import { MongoAuditLogRepository } from "@/infrastructure/database/repositories/MongoAuditLogRepository";

const repository = new MongoAuditLogRepository();

export class AuditService {
  static async logAction(
    hospitalId: string,
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string
  ): Promise<void> {
    const log: AuditLog = {
      hospitalId,
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      timestamp: new Date()
    };
    
    // Asynchronously log to avoid blocking the main request thread
    repository.create(log).catch(err => {
      console.error("[AuditService] Failed to save audit log:", err);
    });
  }
}
