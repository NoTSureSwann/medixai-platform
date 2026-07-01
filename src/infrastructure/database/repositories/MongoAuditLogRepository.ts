import { Collection } from "mongodb";
import clientPromise from "../mongodb";
import { AuditLog } from "@/core/entities/AuditLog";
import { IAuditLogRepository } from "@/core/interfaces/IAuditLogRepository";

export class MongoAuditLogRepository implements IAuditLogRepository {
  private collectionName = "audit_logs";

  private async getCollection(): Promise<Collection<Omit<AuditLog, "id">>> {
    const client = await clientPromise;
    return client.db("medixai").collection<Omit<AuditLog, "id">>(this.collectionName);
  }

  private mapDocumentToAuditLog(doc: Record<string, unknown>): AuditLog {
    const { _id, ...rest } = doc;
    return { id: String(_id), ...rest } as AuditLog;
  }

  async create(log: AuditLog): Promise<AuditLog> {
    const collection = await this.getCollection();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...logData } = log;
    const result = await collection.insertOne(logData as Omit<AuditLog, "id">);
    return { ...log, id: result.insertedId.toString() };
  }

  async findByHospitalId(hospitalId: string, limit: number = 100): Promise<AuditLog[]> {
    const collection = await this.getCollection();
    const logs = await collection.find({ hospitalId }).sort({ timestamp: -1 }).limit(limit).toArray();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return logs.map(log => this.mapDocumentToAuditLog(log as any));
  }

  async findByUserId(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const collection = await this.getCollection();
    const logs = await collection.find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return logs.map(log => this.mapDocumentToAuditLog(log as any));
  }
}
