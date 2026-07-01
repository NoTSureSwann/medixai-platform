import { IAgent, AgentContext } from "../agents/IAgent";
import { DiagnosticAgent } from "../agents/DiagnosticAgent";
import { OperationsAgent } from "../agents/OperationsAgent";
import { IntentClassifier, ChatIntent } from "../IntentClassifier";

export class AIOrchestrator {
  private diagnosticAgent: DiagnosticAgent;
  private operationsAgent: OperationsAgent;

  constructor() {
    this.diagnosticAgent = new DiagnosticAgent();
    this.operationsAgent = new OperationsAgent();
  }

  async routeAndExecute(query: string, context: AgentContext): Promise<string> {
    console.log("[AIOrchestrator] Classifying intent...");
    const intent = IntentClassifier.classify(query);
    console.log(`[AIOrchestrator] Intent classified as: ${intent}`);

    let selectedAgent: IAgent;

    if (intent === ChatIntent.CLINICAL) {
      selectedAgent = this.diagnosticAgent;
    } else {
      selectedAgent = this.operationsAgent;
    }

    console.log(`[AIOrchestrator] Routing to ${selectedAgent.name}...`);
    return await selectedAgent.execute(query, context);
  }
}
