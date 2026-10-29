import express from 'express';
import guildRouter from './routes/guild.routes.js';
import workspaceRouter from './routes/workspace.routes.js';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Workspace direct endpoints (for FileExplorer, FileViewer & Terminal)
app.use(workspaceRouter);
app.use("/api/workspace", workspaceRouter);

// DevPilot Guild Multi-Agent Pipeline
app.use("/api/ai/guild", guildRouter);

export default app;