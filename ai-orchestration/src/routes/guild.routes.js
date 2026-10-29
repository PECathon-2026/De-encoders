import { Router } from "express";
import axios from "axios";
import { guildCampaignGraph } from "../guild/graph.js";
import { missionStore } from "../guild/mission.store.js";

const guildRouter = Router();

// In-memory cache for active missions awaiting human approval
const activeMissions = new Map();

/**
 * @route POST /api/ai/guild/decree
 * @description Initiates a multi-agent engineering guild campaign for a given decree
 */
guildRouter.post("/decree", async (req, res) => {
  const { decree, projectId } = req.body;

  if (!decree) {
    return res.status(400).json({ error: "Decree string is required" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  const writer = (text) => sendEvent("log", text);

  try {
    const initialState = {
      decree,
      projectId: projectId || "default",
      sandboxId: projectId || "default",
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
      messages: [],
      writer
    };

    let finalState = initialState;

    // Stream state transitions through the Guild graph
    for await (const { node, state } of guildCampaignGraph.stream(initialState)) {
      finalState = state;
      sendEvent("state_update", {
        node,
        currentPhase: state.currentPhase,
        activeAgent: state.activeAgent,
        taskBoard: state.taskBoard,
        acceptanceCriteria: state.acceptanceCriteria,
        evidenceLedger: state.evidenceLedger,
        securityFindings: state.securityFindings,
        iterationCount: state.iterationCount
      });
    }

    // Save state for human authorization
    activeMissions.set(projectId || "default", finalState);

    sendEvent("mission_ready_for_approval", {
      projectId: projectId || "default",
      diff: finalState.gitDiffSummary,
      criteria: finalState.acceptanceCriteria,
      evidence: finalState.evidenceLedger
    });

    res.end();
  } catch (error) {
    console.error("Guild campaign error:", error);
    sendEvent("error", { message: error.message });
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
});

/**
 * @route POST /api/ai/guild/approve
 * @description Human Sovereign authorization or rejection
 */
guildRouter.post("/approve", async (req, res) => {
  const { projectId = "default", approved, feedback } = req.body;
  const mission = activeMissions.get(projectId);

  if (!mission) {
    return res.status(404).json({ error: "Mission not found or session expired" });
  }

  if (approved) {
    mission.approvalStatus = "approved";
    // Attempt git commit in sandbox if available
    try {
      await axios.post(`http://sandbox-service-${projectId}:3000/run-command`, {
        command: "git add -A && git commit -m 'Decree fulfilled by Mikado Guild' || true"
      });
    } catch (e) {
      // Ignored if standalone
    }

    // Persist mission record into distributed memory store
    missionStore.saveMission(projectId, mission);

    return res.status(200).json({
      success: true,
      status: "approved",
      message: "Decree changes officially approved and sealed by the Sovereign."
    });
  } else {
    mission.approvalStatus = "rejected";
    mission.humanFeedback = feedback;
    missionStore.saveMission(projectId, mission);
    return res.status(200).json({
      success: true,
      status: "rejected",
      message: "Feedback recorded. Guild stands down for revisions."
    });
  }
});

/**
 * @route GET /api/ai/guild/missions/:projectId
 * @description Retrieves historical missions and evidence records for a project
 */
guildRouter.get("/missions/:projectId", (req, res) => {
  const missions = missionStore.getMissions(req.params.projectId);
  res.status(200).json({ missions });
});

export default guildRouter;
