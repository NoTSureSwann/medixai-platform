export interface SOAPNote {
  subjective: string; // Patient's complaints/history
  objective: string;  // Physical exam, lab results
  assessment: string; // Diagnosis
  plan: string;       // Treatment plan
}

export interface ICD10Code {
  code: string;
  description: string;
}

export interface MedicalRecord {
  id?: string;
  appointmentId: string; // The specific visit this EMR belongs to
  patientId: string;
  doctorId: string;
  hospitalId: string;
  
  soapNote: SOAPNote;
  diagnoses: ICD10Code[]; // Primary and secondary diagnoses
  
  createdAt: Date;
  updatedAt: Date;
}
