<h1 align="center">
  <br>
  🏯 DevPilot: The Mystic Mikado's Autonomous AI Engineering Guild
  <br>
</h1>

<h4 align="center">Multi-Agent Autonomous Software Engineering Guild with Adaptive Repair Loops, Tamper-Evident Evidence Ledgers, and Zero-Complexity Local Execution.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/MistralAI-Free_Tier-FF7000" />
  <img src="https://img.shields.io/badge/LangChain-LangGraph-1C3C3C?logo=langchain" />
  <img src="https://img.shields.io/badge/Vitest-Automated_Testing-6E9F18?logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/Architecture-Zero_K8s_Zero_Docker-10b981" />
</p>

---

## 🏯 The 5 Guild Agents (PS-001)

| Agent | Icon | Role & Responsibility |
|---|---|---|
| **The Shogun's Council** | ⚔️ | **Reconnaissance & Battle Planning**: Ingests user decrees, inspects workspace topology, establishes measurable Acceptance Criteria, and constructs an atomic Task Board. |
| **The Samurai Forge** | 🔨 | **Context-Aware Build & Repair**: Crafts production-grade React components adhering to local styles. Automatically fixes battlefield bugs when dispatched by Sentinel or Shadow. |
| **The Sentinel Dojo** | 🛡️ | **Verification & Automated Testing**: Executes `npm run build` and `npm test`, validates acceptance criteria, catches stack traces, and records immutable entries in the Evidence Ledger. |
| **The Shadow Council** | 🌑 | **Security Audit & Code Critique**: Analyzes code diffs for credential leaks, dangerous `eval()`, prototype pollution, or XSS before changes reach production. |
| **The Human Sovereign** | 👑 | **Seal of Approval Gate**: Presents unified git diffs, test summaries, and security audits to the human sovereign before any changes are committed. |

---

## 🔄 Adaptive Feedback & Verification Loop

```
User Decree ──► [Shogun: Plan & Criteria]
                         │
                         ▼
                [Samurai: Build Code]
                         │
                         ▼
                [Sentinel: Build & Test] ─── FAIL? ──► Diagnostic Feedback Loop
                         │                                 (Dispatches Samurai)
                       PASS
                         │
                         ▼
                [Shadow: Security Audit] ─── VULN? ──► Security Critique Loop
                         │                                 (Dispatches Samurai)
                       PASS
                         │
                         ▼
             [Human Sovereign Gate] ──► APPROVED? ──► Final Mission Accomplished!
```

---

## 🚀 Quick Start (Zero Docker, Zero Kubernetes)

### 1. Requirements
- **Node.js** v20+
- **Free Mistral API Key** (optional, fallback offline guild engine is built-in)
  - Get a free key at [console.mistral.ai](https://console.mistral.ai) (Free Experimenter Tier, no credit card required).

### 2. Environment Setup
Configure your free key in `ai-orchestration/.env`:
```ini
PORT=3000
MISTRALAI_API_KEY=your_mistral_api_key_here
```

### 3. One-Click Launch (Windows)
Double-click `start.bat` in the repository root, or run in terminal:
```cmd
.\start.bat
```
This automatically boots:
1. **AI Orchestration Backend** on `http://localhost:3000`
2. **Local Sandbox App Preview** on `http://localhost:5174`
3. **DevPilot IDE Frontend** on `http://localhost:5173`

*(Note: On Windows PowerShell, if script execution is disabled, use `start.bat` or `npm.cmd run dev` to bypass ExecutionPolicy restrictions).*

---

## 🧪 Automated Guild Test Suite

Run the built-in 6-phase test suite validating all agent roles, adaptive loops, security audits, and mission ledgers:

```bash
cd ai-orchestration
node --test test/guild.test.js
```

**Results:**
```
✔ 1. The Shogun Council: Analyzes decree & establishes Battle Plan
✔ 2. The Samurai Forge: Generates context-aware React code
✔ 3. The Sentinel Dojo & Feedback Loop: Detects test failure and dispatches repair
✔ 4. The Shadow Council: Detects planted security vulnerability & triggers critique loop
✔ 5. The Living Campaign Graph: Orchestrates autonomous multi-turn guild loop
✔ 6. The Living Mission Store: Preserves history & sovereign approval state
ℹ tests 6 | suites 1 | pass 6 | fail 0
```

---

## 📂 Directory Layout

```
DevForge/
├── ai-orchestration/             # Multi-Agent Orchestrator (Express + LangGraph)
│   ├── src/
│   │   ├── guild/
│   │   │   ├── agents/          # Shogun, Samurai, Sentinel, Shadow
│   │   │   ├── tools/           # Safe local filesystem & command execution tools
│   │   │   ├── graph.js         # Cyclic LangGraph state graph with loop guard
│   │   │   ├── model.js         # Free Mistral + Offline Fallback Engine
│   │   │   └── mission.store.js # Living Mission State & Evidence Ledger
│   │   ├── routes/              # /api/ai/guild/decree, /run-command, /list-files
│   │   └── server.js            # Port 3000 backend
│   └── test/guild.test.js       # Complete 6/6 Guild unit & integration tests
├── frontend/                    # Modern Dark-Themed Browser IDE (React 19 + Vite)
│   ├── src/components/
│   │   ├── GuildChat.jsx        # Mission visualizer, task board, evidence ledger & sovereign gate
│   │   ├── Terminal.jsx         # Interactive local workspace shell (no WebSockets)
│   │   ├── FileExplorer.jsx     # Live workspace tree
│   │   ├── PreviewFrame.jsx     # Isolated target preview on port 5174 (no recursion)
│   │   └── SplashScreen.jsx     # Seamless local project launch
├── sandbox/template/            # Target React + Vite repository managed by the Guild
│   └── src/App.test.jsx         # Vitest unit test suite verified by Sentinel
└── start.bat                    # One-click startup script for Windows
```
