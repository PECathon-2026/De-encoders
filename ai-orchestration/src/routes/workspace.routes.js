import { Router } from "express";
import { listFiles, readFiles, updateFiles, deleteFiles, searchFiles, runCommand, getGitDiff } from "../guild/tools/workspace.js";

const workspaceRouter = Router();

/**
 * @route GET /list-files
 * @description Lists workspace files for the frontend file explorer
 */
workspaceRouter.get("/list-files", async (req, res) => {
  try {
    const files = await listFiles();
    res.status(200).json({ files, message: "Files listed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /read-files
 * @description Reads requested files for the code viewer
 */
workspaceRouter.get("/read-files", async (req, res) => {
  const filesParam = req.query.files;
  if (!filesParam) return res.status(400).json({ error: "No files specified" });

  const fileList = filesParam.split(",");
  try {
    const results = await readFiles(fileList);
    res.status(200).json({ files: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route PATCH /update-files
 * @description Updates files directly in workspace
 */
workspaceRouter.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;
  if (!Array.isArray(updates)) return res.status(400).json({ error: "updates must be an array" });

  try {
    const results = await updateFiles(updates);
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /run-command
 * @description Safe command execution in workspace
 */
workspaceRouter.post("/run-command", async (req, res) => {
  const { command, timeout } = req.body;
  const result = await runCommand(command, undefined, timeout);
  res.status(result.success ? 200 : (result.exitCode === 126 ? 403 : 200)).json(result);
});

/**
 * @route GET /git-diff
 * @description Returns workspace git diff
 */
workspaceRouter.get("/git-diff", async (req, res) => {
  const diff = await getGitDiff();
  res.status(200).json(diff);
});

/**
 * @route DELETE /delete-files
 * @description Deletes files directly from workspace
 */
workspaceRouter.delete("/delete-files", async (req, res) => {
  const fileList = req.body.files;
  if (!Array.isArray(fileList)) return res.status(400).json({ error: "files must be an array" });

  try {
    const results = await deleteFiles(fileList);
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------
// Compatibility Routes for Sandbox Lifecycle (Zero-404 Guarantee)
// --------------------------------------------------------------------

workspaceRouter.get("/api/sandbox/project", (req, res) => {
  res.status(200).json({
    projects: [
      { _id: "local-workspace", title: "Local DevPilot Workspace" }
    ]
  });
});

workspaceRouter.post("/api/sandbox/project", async (req, res) => {
  const projectTitle = req.body.title || "New Project";
  try {
    // List existing components and remove them so new project starts with a clean slate
    const existing = await listFiles();
    const obsoleteComponents = existing.filter(f => f.startsWith("src/components/"));
    if (obsoleteComponents.length > 0) {
      await deleteFiles(obsoleteComponents);
    }

    // Reset App.jsx to a clean starter state
    await updateFiles([
      {
        file: "src/App.jsx",
        content: `import React from 'react';
import './App.css';

export default function App() {
  return (
    <div className="game-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>${projectTitle}</h1>
      <p>Issue a decree to start forging your application!</p>
    </div>
  );
}
`
      },
      {
        file: "src/App.test.jsx",
        content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('${projectTitle}', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText(/${projectTitle}/i)).toBeInTheDocument();
  });
});
`
      }
    ]);
  } catch (err) {
    console.error("Error resetting workspace for new project:", err);
  }

  res.status(200).json({
    project: {
      _id: "local-workspace",
      title: projectTitle
    }
  });
});

workspaceRouter.post("/api/sandbox/start", (req, res) => {
  res.status(200).json({
    sandboxId: "local-workspace",
    previewUrl: "http://localhost:5174",
    agentBase: ""
  });
});

workspaceRouter.get("/api/sandbox/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default workspaceRouter;
