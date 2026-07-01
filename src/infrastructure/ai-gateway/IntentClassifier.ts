export enum ChatIntent {
  BOOK_APPOINTMENT = "BOOK_APPOINTMENT",
  BILLING = "BILLING",
  BPJS_INSURANCE = "BPJS_INSURANCE",
  CLINICAL = "CLINICAL",
  GENERAL_FAQ = "GENERAL_FAQ",
}

export class IntentClassifier {
  /**
   * Fast heuristic rule-based intent classification.
   * Falls back to GENERAL_FAQ if no keywords match.
   */
  static classify(message: string): ChatIntent {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/symptom|pain|fever|cough|sick|diagnose|disease|virus|infection|obat|sakit|gejala/)) {
      return ChatIntent.CLINICAL;
    }
    
    if (lowerMessage.match(/book|appointment|schedule|jadwal|daftar/)) {
      return ChatIntent.BOOK_APPOINTMENT;
    }
    
    if (lowerMessage.match(/bill|pay|invoice|cost|bayar|tagihan|biaya/)) {
      return ChatIntent.BILLING;
    }

    if (lowerMessage.match(/bpjs|insurance|claim|cover|asuransi/)) {
      return ChatIntent.BPJS_INSURANCE;
    }

    return ChatIntent.GENERAL_FAQ;
  }
}
