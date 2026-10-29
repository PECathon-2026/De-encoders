import { invokeGuildLLM } from "../model.js";
import { listFiles, readFiles } from "../tools/workspace.js";

/**
 * The Shogun's Council: Planning & Reconnaissance Agent
 * - Analyzes user decree
 * - Inspects project terrain (files, packages, conventions) directly from local repository
 * - Defines objectives & discrete acceptance criteria
 * - Decomposes work into the task board
 */
export async function shogunPlanningNode(state) {
  const { decree, lastErrorLog, writer, workspaceDir } = state;
  writer?.("⚔️ [The Shogun's Council] Analyzing royal decree and inspecting project terrain...\n");

  let fileList = [];
  let packageJsonContent = "{}";

  // Step 1: Direct Local Reconnaissance
  try {
    fileList = await listFiles(workspaceDir);
    if (fileList.includes("package.json")) {
      const readRes = await readFiles(["package.json"], workspaceDir);
      if (readRes?.length) {
        packageJsonContent = Object.values(readRes[0])[0] || "{}";
      }
    }
  } catch (err) {
    writer?.(`⚠️ Reconnaissance notice: ${err.message}. Proceeding with default structure.\n`);
    fileList = ["src/App.jsx", "src/main.jsx", "package.json", "index.html"];
  }

  // Step 2: Formulate Mission Plan
  const systemPrompt = `
You are The Shogun, supreme strategist of the Mikado's Autonomous AI Engineering Guild.
Your sacred duty is to convert natural-language decrees into an immutable Battle Plan with:
1. Mission Objectives
2. Discrete, testable Acceptance Criteria (each with verification method)
3. Decomposed Task Board (delegated to samurai, sentinel, and shadow)

Return STRICT JSON format:
{
  "missionObjective": "concise goal statement",
  "acceptanceCriteria": [
    { "id": "AC-1", "description": "...", "verificationMethod": "automated_test" }
  ],
  "taskBoard": [
    { "id": "TASK-1", "title": "...", "assignedTo": "samurai", "status": "pending" },
    { "id": "TASK-2", "title": "...", "assignedTo": "sentinel", "status": "pending" },
    { "id": "TASK-3", "title": "...", "assignedTo": "shadow", "status": "pending" }
  ],
  "conventions": "React 19, Vite, clean modular architecture",
  "risks": []
}
`;

  const userPrompt = `
Decree: ${decree}
Existing Files: ${fileList.join(", ")}
Package Config: ${packageJsonContent}
${lastErrorLog ? `Previous Blocker:\n${lastErrorLog}` : ""}
`;

  const fallbackGenerator = () => JSON.stringify({
    missionObjective: `Fulfill royal decree: ${decree}`,
    acceptanceCriteria: [
      { id: "AC-1", description: `Implement functionality for: ${decree}`, verificationMethod: "automated_test", verified: false },
      { id: "AC-2", description: "Production build and lint check pass with zero errors", verificationMethod: "build_check", verified: false }
    ],
    taskBoard: [
      { id: "TASK-1", title: "Implement required components & logic", assignedTo: "samurai", status: "pending" },
      { id: "TASK-2", title: "Execute automated verification & lint checks", assignedTo: "sentinel", status: "pending" },
      { id: "TASK-3", title: "Perform security and integrity audit", assignedTo: "shadow", status: "pending" }
    ],
    conventions: "React 19 + Vite",
    risks: ["Ensure responsive layout and maintain existing imports"]
  });

  const responseText = await invokeGuildLLM({
    systemPrompt,
    userPrompt,
    fallbackGenerator
  });

  let plan;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    plan = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e) {
    plan = JSON.parse(fallbackGenerator());
  }

  writer?.(`📜 [The Shogun's Council] Battle plan established with ${plan.acceptanceCriteria.length} acceptance criteria and ${plan.taskBoard.length} tasks.\n`);

  return {
    ...state,
    missionObjective: plan.missionObjective,
    acceptanceCriteria: plan.acceptanceCriteria,
    taskBoard: plan.taskBoard,
    currentPhase: "samurai_forge",
    activeAgent: "samurai",
    messages: [
      ...(state.messages || []),
      {
        sender: "shogun",
        content: `Decree analyzed. Objective: ${plan.missionObjective}. Plan delegated to Samurai Forge.`,
        timestamp: Date.now()
      }
    ]
  };
}
