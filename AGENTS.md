# AGENTS.md

System prompts, guardrails, and file-modification rules for AI code assistants working on **Silent Depth**.

---

## 🛠️ Code Modification Protocols (Critical)

To minimize manual developer copy-pasting and patch errors, AI agents **MUST** prioritize clean code deliveries:

### 1. Large/Multi-line Updates via Full File Overwrites (Preferred)
For structural, multi-line, or complex additions, avoid error-prone relative diff blocks. Provide complete file replacements using clean standard input blocks:
```bash
cat << 'EOF' > filename.ext
// Complete file content here
EOF
```

### 2. Quick Configuration Modifications via `sed`
For single targeted line edits, provide clean Stream Editor (`sed`) commands with explicit patterns.
```bash
# Example: Update configuration values inside server.js
sed -i 's/BLAST_RADIUS = 30.0/BLAST_RADIUS = 50.0/g' server.js
```

---

## 🚢 System Architecture & Guardrails

Respect these constraints during code generation:

### Backend (`server.js`)
* **Continuous Math:** System uses a continuous 800x800 coordinate scale evaluated by Euclidean geometry vectors. Do not revert to integer grid logic.
* **Telemetry Suppression Filter:** The server tracks historical distance via `lastEmittedDist`. Do not remove or alter this filter; it suppresses infinite telemetry looping when submarines sit stationary or grind against outer boundaries.
* **Power Thresholds:** Enforce the hardcoded 3-field allocation grid (`engines`, `weapons`, `shields`). Systems require a value >= 2 to function.

### Frontend (`public/index.html`)
* **Tech Stack:** Vanilla JavaScript (ES6+), semantic HTML5, and native inline CSS. Total page weight must stay under 4KB.
* **WebSockets Only:** Force native transport configurations (`{ transports: ['websocket'] }`) to minimize mobile cellular latency.

---

## 🎯 Backlog Implementation Rules

1. **Phase 4 Canvas Migration:** When moving away from DOM matrix layouts (`.helm-matrix`, `.sonar-matrix`), replace them with clean 2D HTML5 `<canvas>` elements to respect the strict 4KB weight budget.
2. **Weapons Minigames:** Anchor charge sliders directly inside `#panel-Weapons`. Server actions must block execution if verification markers are missing.
