export interface Polyclinic {
  id?: string;
  name: string; // e.g., "Poli Jantung"
  description: string;
  diseaseCategory: string; // Internal grouping
  doctors?: { id: string; name: string }[]; // The 3 assigned doctors
  createdAt?: Date;
  updatedAt?: Date;
}
