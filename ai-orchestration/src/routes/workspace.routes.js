import { Router } from "express";
import { listFiles, readFiles, updateFiles, searchFiles, runCommand, getGitDiff } from "../guild/tools/workspace.js";

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

workspaceRouter.post("/api/sandbox/project", (req, res) => {
  res.status(200).json({
    project: {
      _id: "local-workspace",
      title: req.body.title || "Local DevPilot Workspace"
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
