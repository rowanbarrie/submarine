# AGENTS.md

System prompts, guardrails, and file-modification rules for AI code assistants working on **Silent Depth**.

---

## 🛠️ Code Modification Protocols (Critical)

To minimize manual developer copy-pasting, AI agents **MUST** prioritize providing changes as unified git patch files or executable shell commands rather than writing out entire file contents for manual injection.

### 1. Multi-line Updates via Unified Git Patches (Preferred)
For any structural, multi-line, or complex additions and deletions, supply a clean **Unified Diff** format (`diff -u`) compatible with the Linux `patch` tool. This is the primary method for making structural changes.

```diff
--- server.js
+++ server.js
@@ -15,2 +15,2 @@
-            hp: 100, 
+            hp: 150, 
```

### 2. Quick Line Modifications via `sed`
For targeted line edits, provide single-line Stream Editor (`sed`) commands with explicit patterns.
```bash
# Example: Update starting HP for Team Alpha inside server.js
sed -i 's/Alpha: { pos: { x: 2, y: 2 }, hp: 100/Alpha: { pos: { x: 2, y: 2 }, hp: 150/g' server.js
```

### 2. File Appends & Injections
Use clean append redirections (`>>`) or targeted `awk` patterns for small additions. 

### 3. Unified Diffs
For multi-line updates too complex for `sed`, fallback to raw **Unified Diff** formats (`diff -u`) compatible with the Linux `patch` tool.

---

## 🚢 System Architecture & Guardrails

Respect these constraints during code generation:

### Backend (`server.js`)
* **Framework:** Express 5.x + Socket.io 4.x (listening on Port `3000`).
* **Authoritative Server:** Game coordinates must live strictly on the server. Never broadcast absolute enemy positions to an opposing client socket.
* **Power Thresholds:** Enforce the hardcoded 3-field allocation grid (`engines`, `weapons`, `shields`). Systems require a value $\ge 2$ to function.

### Frontend (`public/index.html`)
* **Tech Stack:** Vanilla JavaScript (ES6+), semantic HTML5, and native inline CSS.
* **Framework Restrictions:** Do **NOT** install external dependencies (React, Vue, Tailwind, etc.). Total page weight must stay under 4KB.
* **WebSockets Only:** Force native transport configurations (`{ transports: ['websocket'] }`) to minimize mobile cellular latency.

---

## 🎯 Backlog Implementation Rules

1. **Sonar Map Matrix:** Leverage existing `.sonar-matrix` and toggle `.state-possible` / `.state-splash` tile classes to keep DOM mutations minimal.
2. **Weapons Minigames:** Anchor charge sliders directly inside `#panel-Weapons`. Server actions must block execution if verification markers are missing.
3. **Engineering Updates:** Maintain the server-side allocation pool constraint (`currentTotal >= 6`) inside the `update_power` event listener.

