import { ICD10Code } from "../../core/entities/MedicalRecord";

// A small subset of ICD-10 codes for mocking
const MOCK_ICD10_DB: ICD10Code[] = [
  { code: "J00", description: "Acute nasopharyngitis [common cold]" },
  { code: "J01", description: "Acute sinusitis" },
  { code: "J02", description: "Acute pharyngitis" },
  { code: "J03", description: "Acute tonsillitis" },
  { code: "J20", description: "Acute bronchitis" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11", description: "Type 2 diabetes mellitus" },
  { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified" },
  { code: "K30", description: "Functional dyspepsia" },
  { code: "M54.5", description: "Low back pain" },
  { code: "R51", description: "Headache" },
];

/**
 * Searches for ICD-10 codes matching the given query string.
 * This is a stub simulating a call to a real terminology API (e.g., NIH or WHO).
 */
export async function searchICD10(query: string): Promise<ICD10Code[]> {
  const lowerQuery = query.toLowerCase();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return MOCK_ICD10_DB.filter(item => 
    item.code.toLowerCase().includes(lowerQuery) || 
    item.description.toLowerCase().includes(lowerQuery)
  );
}
