/**
 * Shared Mission State (The Mikado's Scroll)
 * Central blackboard shared across Shogun, Samurai, Sentinel, and Shadow Council
 */

export const initialMissionState = {
  decree: "",
  projectId: "",
  sandboxId: "",
  missionObjective: "",
  acceptanceCriteria: [],
  taskBoard: [],
  currentPhase: "shogun_council",
  activeAgent: "shogun",
  iterationCount: 0,
  maxIterations: 5,
  lastErrorLog: null,
  repairInstructions: null,
  securityFindings: [],
  evidenceLedger: [],
  changedFiles: [],
  gitDiffSummary: "",
  approvalStatus: "not_requested",
  humanFeedback: null,
  messages: []
};
