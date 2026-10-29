import { invokeGuildLLM } from "../model.js";
import { listFiles, readFiles, updateFiles } from "../tools/workspace.js";

/**
 * The Samurai Forge: Implementation & Adaptive Repair Agent
 * - Reads existing code and adheres to project styling
 * - Generates complete, production-ready React code
 * - Updates local repository directly
 * - Actively handles feedback loops from Sentinel failures and Shadow critiques
 */
export async function samuraiDeveloperNode(state) {
  const {
    decree,
    missionObjective,
    acceptanceCriteria,
    lastErrorLog,
    repairInstructions,
    securityFindings,
    writer,
    messages = [],
    workspaceDir
  } = state;

  const isRepairPhase = Boolean(lastErrorLog || (securityFindings && securityFindings.length > 0));

  if (isRepairPhase) {
    writer?.("🔨 [The Samurai Forge] 🚨 ACTIVE BATTLEFIELD DAMAGE DETECTED: Analyzing diagnostic findings and repairing code...\n");
  } else {
    writer?.("🔨 [The Samurai Forge] Drawing blades: Crafting context-aware code implementation...\n");
  }

  // 1. Inspect local repository files
  let fileList = [];
  let existingCode = "";
  try {
    fileList = await listFiles(workspaceDir);
    const candidateFiles = fileList.filter(f => f.endsWith(".jsx") || f.endsWith(".js") || f.endsWith(".css")).slice(0, 4);
    if (candidateFiles.length > 0) {
      const readRes = await readFiles(candidateFiles, workspaceDir);
      existingCode = JSON.stringify(readRes, null, 2);
    }
  } catch (err) {}

  const systemPrompt = `
You are The Samurai, master developer and builder of the Mikado's Guild.
You craft modern, high-polish, feature-complete React applications adhering strictly to the user's decree.
Build rich UIs with real state, interactive controls, modern layouts, and styled components (using inline styles or App.css).
Never output placeholders, 'TODOs', or truncated skeletons.

Output the code using file blocks:
### FILE: src/App.jsx
\`\`\`jsx
// Full complete React component
import React, { useState } from 'react';
import './App.css';
...
\`\`\`

You can also output additional files like:
### FILE: src/App.test.jsx
\`\`\`jsx
import { describe, it, expect } from 'vitest';
...
\`\`\`
`;

  const userPrompt = `
MISSION OBJECTIVE: ${missionObjective || decree}
ACCEPTANCE CRITERIA: ${JSON.stringify(acceptanceCriteria, null, 2)}
AVAILABLE REPOSITORY FILES: ${fileList.join(", ")}
SAMPLE EXISTING CODE:
${existingCode}

${isRepairPhase ? `
REPAIR FEEDBACK FROM SENTINEL / SHADOW:
Error Log / Stack Trace: ${lastErrorLog || "None"}
Security Findings: ${JSON.stringify(securityFindings, null, 2)}
Instructions: ${repairInstructions || "Resolve errors without breaking existing functionality."}
` : "Build the complete, polished application for this decree. Make it visually impressive and fully interactive."}
`;

  const responseText = await invokeGuildLLM({
    systemPrompt,
    userPrompt,
    fallbackGenerator: () => ""
  });

  // Multi-Strategy Code Extraction
  const updates = [];

  // Strategy 1: Look for markdown ### FILE: <path> blocks
  const fileBlockRegex = /(?:###|##|\*\*)\s*(?:FILE|File):\s*([^\r\n]+)[\r\n]+(?:\s*```[a-zA-Z]*[\r\n]+)([\s\S]*?)(?:```)/gi;
  let match;
  while ((match = fileBlockRegex.exec(responseText)) !== null) {
    const filename = match[1].trim().replace(/^[`*]+|[`*]+$/g, "");
    const code = match[2].trim();
    if (filename && code) {
      updates.push({ file: filename, content: code });
    }
  }

  // Strategy 2: Look for JSON format
  if (updates.length === 0) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.files)) {
          updates.push(...parsed.files);
        } else if (parsed.code && typeof parsed.code === "string") {
          updates.push({ file: "src/App.jsx", content: parsed.code });
        } else if (parsed.content && typeof parsed.content === "string") {
          updates.push({ file: parsed.file || "src/App.jsx", content: parsed.content });
        }
      }
    } catch (e) {}
  }

  // Strategy 3: Look for direct code fences if only one file was output
  if (updates.length === 0) {
    const codeFenceRegex = /```(?:jsx|javascript|tsx|js)?\s*([\s\S]*?)```/i;
    const fenceMatch = responseText.match(codeFenceRegex);
    if (fenceMatch && fenceMatch[1].trim().length > 50) {
      updates.push({ file: "src/App.jsx", content: fenceMatch[1].trim() });
    }
  }

  // If the model output could not be parsed as a file block, retry by wrapping raw response
  if (updates.length === 0 && responseText && responseText.includes("function") && responseText.includes("return")) {
    updates.push({ file: "src/App.jsx", content: responseText.trim() });
  }

  const summary = `Generated ${updates.length} file(s) for ${missionObjective || decree}`;

  if (updates.length > 0) {
    writer?.(`✏️ [The Samurai Forge] Writing ${updates.length} file(s) directly to local workspace: ${updates.map(u => u.file).join(", ")}...\n`);
    await updateFiles(updates, workspaceDir);
    writer?.("✅ [The Samurai Forge] Files applied to workspace successfully.\n");
  }

  return {
    ...state,
    changedFiles: updates.map(u => u.file),
    currentPhase: "sentinel_dojo",
    activeAgent: "sentinel",
    lastErrorLog: null,
    messages: [
      ...messages,
      {
        sender: "samurai",
        content: `Forge completed: ${summary}. Transferred to Sentinel Dojo for verification.`,
        timestamp: Date.now()
      }
    ]
  };
}
