export class PromptValidator {
  /**
   * Evaluates if a given prompt is safe to pass to the LLM.
   * Uses lightweight heuristics to catch basic injection attempts.
   */
  static isSafe(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    
    // Heuristic injection signatures
    const blockedPatterns = [
      "ignore previous instructions",
      "ignore all previous instructions",
      "forget everything",
      "you are now a",
      "disregard",
      "system prompt",
      "developer mode",
    ];

    for (const pattern of blockedPatterns) {
      if (lowerPrompt.includes(pattern)) {
        console.warn(`[PromptValidator] Security Alert! Blocked injection attempt matching pattern: "${pattern}"`);
        return false;
      }
    }

    return true;
  }
}
