import { shogunPlanningNode } from "./agents/shogun.planner.js";
import { samuraiDeveloperNode } from "./agents/samurai.developer.js";
import { sentinelTestingNode } from "./agents/sentinel.tester.js";
import { shadowSecurityNode } from "./agents/shadow.security.js";

/**
 * The Living Campaign: Guild Campaign Orchestrator
 * Implements the StateGraph coordination model with cyclic feedback loops,
 * bounded retry guards, and evidence verification.
 */
export class GuildCampaignOrchestrator {
  constructor(maxIterations = 5) {
    this.maxIterations = maxIterations;
  }

  /**
   * Async generator that streams state transitions across the Guild
   */
  async *stream(initialState) {
    let state = {
      ...initialState,
      iterationCount: 0,
      maxIterations: this.maxIterations
    };

    // 1. Shogun's Council: Planning & Reconnaissance
    yield { node: "shogun", state };
    state = await shogunPlanningNode(state);
    yield { node: "shogun_complete", state };

    // Coordination Loop with Bounded Autonomy Guard
    while (state.iterationCount < this.maxIterations) {
      // 2. Samurai Forge: Context-aware Building / Repair
      yield { node: "samurai", state };
      state = await samuraiDeveloperNode(state);
      yield { node: "samurai_complete", state };

      // 3. Sentinel Dojo: Testing & Verification
      yield { node: "sentinel", state };
      state = await sentinelTestingNode(state);
      yield { node: "sentinel_complete", state };

      // Conditional Edge: If tests failed, loop back to Samurai
      if (state.lastErrorLog) {
        state.writer?.(`🔄 [Campaign Loop] Test failure detected. Cycling back to Samurai Forge (Attempt ${state.iterationCount}/${this.maxIterations})...\n`);
        continue;
      }

      // 4. Shadow Council: Security & Code Review
      yield { node: "shadow", state };
      state = await shadowSecurityNode(state);
      yield { node: "shadow_complete", state };

      // Conditional Edge: If security findings exist, loop back to Samurai
      if (state.securityFindings && state.securityFindings.length > 0) {
        state.writer?.(`🔄 [Campaign Loop] Security issue detected. Cycling back to Samurai Forge (Attempt ${state.iterationCount}/${this.maxIterations})...\n`);
        continue;
      }

      // Both Quality and Security passed! Transition to Human Sovereign Gate
      break;
    }

    if (state.iterationCount >= this.maxIterations && (state.lastErrorLog || state.securityFindings?.length)) {
      state.writer?.("🛑 [Bounded Autonomy] Maximum repair iterations reached. Escalating to Sovereign for review.\n");
      state.currentPhase = "human_oversight";
      state.approvalStatus = "pending_review";
    }

    yield { node: "final", state };
    return state;
  }
}

export const guildCampaignGraph = new GuildCampaignOrchestrator(5);
