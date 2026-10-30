import { invokeGuildLLM } from "../model.js";
import { listFiles, readFiles, updateFiles, deleteFiles } from "../tools/workspace.js";

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

TESTING GUIDELINES (VITEST & REACT TESTING LIBRARY):
When generating unit tests in .test.jsx files:
1. Always import test functions from 'vitest':
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
2. Import DOM helpers from '@testing-library/react':
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
3. If React 'act' is required, import from 'react' (NEVER import act from 'vitest'):
   import { act } from 'react';
4. If testing elements by data-testid (e.g. screen.getByTestId('snake-segment')), ENSURE the JSX components assign that EXACT attribute: data-testid="snake-segment".
5. Use standard queries: screen.getByText, screen.getByTestId, screen.getByRole. Do not invent non-existent methods like screen.getAllByClassName.

FILE REMOVAL:
If the user's decree or acceptance criteria asks to delete or replace old files:
### DELETE: src/components/OldComponent.jsx
### DELETE: src/components/OldComponent.test.jsx

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
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  // Ensure matching unit tests exist for the new application so old tests never linger
  const hasTestFile = updates.some(u => u.file.includes("test") || u.file.includes("spec"));
  if (!hasTestFile && updates.some(u => u.file === "src/App.jsx")) {
    const safeTitle = (missionObjective || decree || "Application").replace(/['"\\]/g, "");
    const generatedTest = `import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('${safeTitle} Component Suite', () => {
  it('renders application cleanly without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('mounts interactive interface elements', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('*').length).toBeGreaterThan(1);
  });
});
`;
    updates.push({ file: "src/App.test.jsx", content: generatedTest });
  }

  const summary = `Generated ${updates.length} file(s) for ${missionObjective || decree}`;

  // Extract file deletions
  const deletions = [];
  const deleteBlockRegex = /(?:###|##|\*\*)\s*(?:DELETE|Delete):\s*([^\r\n]+)/gi;
  let delMatch;
  while ((delMatch = deleteBlockRegex.exec(responseText)) !== null) {
    const filename = delMatch[1].trim().replace(/^[`*]+|[`*]+$/g, "");
    if (filename) deletions.push(filename);
  }

  // Also extract files explicitly marked for deletion in acceptanceCriteria
  if (Array.isArray(acceptanceCriteria)) {
    for (const ac of acceptanceCriteria) {
      const desc = ac.description || "";
      if (desc.toLowerCase().includes("delete") || desc.toLowerCase().includes("remove")) {
        const parenMatch = desc.match(/\(([^)]+)\)/);
        if (parenMatch) {
          const names = parenMatch[1].split(/[\s,]+/);
          for (const rawName of names) {
            const clean = rawName.trim().replace(/^[`*]+|[`*]+$/g, "");
            if (clean.includes(".")) {
              const found = fileList.filter(f => f.endsWith(clean) || f.endsWith("/" + clean));
              found.forEach(f => {
                if (!deletions.includes(f)) deletions.push(f);
              });
            }
          }
        }
      }
    }
  }

  if (deletions.length > 0) {
    writer?.(`🗑️ [The Samurai Forge] Deleting ${deletions.length} obsolete file(s): ${deletions.join(", ")}...\n`);
    await deleteFiles(deletions, workspaceDir);
    writer?.("✅ [The Samurai Forge] Obsolete files deleted successfully.\n");
  }

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
