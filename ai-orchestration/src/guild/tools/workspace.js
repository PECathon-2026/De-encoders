import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Default target workspace: the starter template repository or workspace directory
export const DEFAULT_WORKSPACE = process.env.WORKSPACE_DIR || path.resolve(process.cwd(), '../sandbox/template');

// Security boundary: Blacklisted destructive command patterns
export const FORBIDDEN_COMMAND_PATTERNS = [
  /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive\s+--force)\s+[\/\~]/i,
  /mkfs/i,
  /:(){ :\|:& };:/,               // Fork bomb
  />\s*\/dev\/([s|h|v]d[a-z]|null|zero)/i,
  /chmod\s+(-R\s+)?777\s+\//i,
  /chown\s+(-R\s+)?root/i,
  /curl.*\|\s*(ba)?sh/i,
  /wget.*\|\s*(ba)?sh/i,
  /\/etc\/(passwd|shadow)/i,
  /\.ssh/i
];

/**
 * Lists all files in the target workspace recursively, excluding node_modules, .git, dist
 */
export async function listFiles(workspaceDir = DEFAULT_WORKSPACE) {
  const result = [];
  
  if (!fs.existsSync(workspaceDir)) {
    await fs.promises.mkdir(workspaceDir, { recursive: true });
  }

  async function walk(dir, relPath = '') {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', '.git', 'dist', '.gemini'].includes(entry.name)) continue;
      const full = path.join(dir, entry.name);
      const rel = relPath ? `${relPath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(full, rel);
      } else {
        result.push(rel);
      }
    }
  }

  await walk(workspaceDir);
  return result;
}

/**
 * Reads specified files from the target workspace
 */
export async function readFiles(filePaths = [], workspaceDir = DEFAULT_WORKSPACE) {
  const files = [];
  for (const rel of filePaths) {
    const full = path.resolve(workspaceDir, rel);
    try {
      const content = await fs.promises.readFile(full, 'utf8');
      files.push({ [rel]: content });
    } catch (e) {
      files.push({ [rel]: `Error reading file: ${e.message}` });
    }
  }
  return files;
}

/**
 * Writes or updates files in the target workspace
 */
export async function updateFiles(updates = [], workspaceDir = DEFAULT_WORKSPACE) {
  const results = [];
  for (const item of updates) {
    const { file, content } = item;
    const full = path.resolve(workspaceDir, file);
    try {
      await fs.promises.mkdir(path.dirname(full), { recursive: true });
      await fs.promises.writeFile(full, content, 'utf8');
      results.push({ [file]: 'Updated successfully' });
    } catch (e) {
      results.push({ [file]: `Error: ${e.message}` });
    }
  }
  return results;
}

/**
 * Fast grep search across workspace files
 */
export async function searchFiles(query, workspaceDir = DEFAULT_WORKSPACE) {
  if (!query) return [];
  const files = await listFiles(workspaceDir);
  const matches = [];

  for (const rel of files) {
    const full = path.resolve(workspaceDir, rel);
    try {
      const content = await fs.promises.readFile(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ file: rel, line: idx + 1, snippet: line.trim() });
        }
      });
    } catch (e) {}
  }
  return matches;
}

/**
 * Safely executes bounded terminal commands strictly inside the target workspace
 */
export async function runCommand(command, workspaceDir = DEFAULT_WORKSPACE, timeout = 30000) {
  if (!command || typeof command !== 'string') {
    return { exitCode: 1, stdout: '', stderr: 'Invalid command string', success: false };
  }

  // Security boundary check
  for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
    if (pattern.test(command)) {
      return {
        exitCode: 126,
        stdout: '',
        stderr: 'Command blocked by DevPilot Sentinel Security Boundary: Destructive operation detected.',
        success: false
      };
    }
  }

  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: workspaceDir,
      timeout: Math.min(timeout, 60000),
      maxBuffer: 1024 * 1024 * 5,
      env: {
        ...process.env,
        CI: 'true',
        PATH: process.env.PATH + path.delimiter + path.resolve(workspaceDir, 'node_modules/.bin')
      }
    });

    return {
      exitCode: 0,
      stdout: (stdout || '').trim(),
      stderr: (stderr || '').trim(),
      success: true
    };
  } catch (error) {
    return {
      exitCode: error.code || 1,
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || error.message || '').trim(),
      success: false
    };
  }
}

/**
 * Retrieves git diff inside the target workspace
 */
export async function getGitDiff(workspaceDir = DEFAULT_WORKSPACE) {
  try {
    await execPromise('git status', { cwd: workspaceDir }).catch(async () => {
      await execPromise('git init && git config user.name "DevPilot" && git config user.email "devpilot@mikado.ai" && git add -A && git commit -m "initial seed"', { cwd: workspaceDir });
    });

    const { stdout: diff } = await execPromise('git diff HEAD', { cwd: workspaceDir });
    const { stdout: status } = await execPromise('git status --short', { cwd: workspaceDir });
    return { diff: diff.trim(), statusSummary: status.trim() };
  } catch (e) {
    return { diff: '', statusSummary: '' };
  }
}
