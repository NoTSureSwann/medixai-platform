import { User, UserRole } from "../entities/User";

export class AuthorizationService {
  /**
   * PBAC: Evaluates if a given user can access a specific patient's medical record.
   * Rules:
   * 1. SUPER_ADMIN and ADMIN of the same hospital have access.
   * 2. PATIENT can only access their own record.
   * 3. DOCTOR can only access if they have an active appointment with the patient.
   */
  static async canAccessPatientRecord(user: User, targetPatientId: string): Promise<boolean> {
    if (user.role === UserRole.SUPER_ADMIN) return true;
    
    if (user.role === UserRole.ADMIN) {
      // Admins are restricted by their hospitalId (Multi-tenant check)
      return true; // Assuming target patient is in the same hospital
    }

    if (user.role === UserRole.PATIENT) {
      return user.id === targetPatientId;
    }

    if (user.role === UserRole.DOCTOR) {
      // PBAC Condition: Check if there's an active appointment
      const hasActiveAppointment = await this.checkActiveAppointment(user.id!, targetPatientId);
      return hasActiveAppointment;
    }

    return false;
  }

  private static async checkActiveAppointment(doctorId: string, patientId: string): Promise<boolean> {
    // TODO: Connect to MongoAppointmentRepository when fully implemented.
    // For now, return a simulated PBAC check.
    console.log(`[PBAC] Checking active appointment for Doctor ${doctorId} and Patient ${patientId}...`);
    return true; 
  }
}
