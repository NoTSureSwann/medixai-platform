export enum AuditAction {
  LOGIN = "LOGIN",
  CREATE_RECORD = "CREATE_RECORD",
  UPDATE_RECORD = "UPDATE_RECORD",
  DELETE_RECORD = "DELETE_RECORD",
  VIEW_SENSITIVE = "VIEW_SENSITIVE",
}

export interface AuditLog {
  id?: string;
  hospitalId: string;
  userId: string;
  action: AuditAction;
  resource: string; // e.g. "Appointment", "MedicalRecord"
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}
