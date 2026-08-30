# ⚓ Silent Depth Project Status & Continuity Ledger

This file tracks completed tasks, current architectural states, and immediate next steps. It allows new AI engineering sessions to instantly safely align with the codebase state.

---

## 🏁 Phase Status Summary

| Phase | Description | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Coordinate System Re-Mapping | **Done** | Server space is 800x800 float space. Client target tracking inputs migrated to capture floating vectors. |
| **Phase 2** | Vector Mechanics & Smooth Kinematics | **Done** | Server 30Hz update loop complete. Client keyboard inputs & throttled vector steering complete (Step 3). |
| **Phase 3** | Spatial Telemetry & Collisions | **Done** | Euclidean distance integration, circle-based torpedo radius checks, and wall-grinding spam filters are fully complete. |
| **Phase 4** | Frontend UI Rendering (HTML5 Canvas) | **Pending** | Needs DOM grids (`.helm-matrix`, `.sonar-matrix`) replaced with performant 2D canvas surfaces. |

---

## 🛠️ Recent Implementations (Latest Session)

### Phase 3, Steps 1 & 2: Euclidean Core & Spatial Combat
* **Euclidean Distances:** Swapped the legacy Manhattan calculation in `server.js` for the true spatial Euclidean formula $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ to accurately handle continuous 2D coordinates.
* **Overlap Hit Detection:** Updated `fire_torpedo` mechanics to track spatial circle hitboxes via a `BLAST_RADIUS = 30.0` configuration threshold instead of matching strict exact nodes.
* **Static Telemetry Suppression Filter:** Implemented a historical tracking mechanism (`lastEmittedDist`) in `steer_sub` to detect when a vessel is sliding against arena borders. This cuts off infinite `sonar_ping` network broadcasts when a submarine is stationary or grinding against a wall boundary.

### Phase 2, Step 3: Client Continuous Steering Integration
* **Keyboard Event Tracking:** Upgraded the Captain's panel input routing to leverage a 10Hz throttled loop monitoring `WASD` / Arrow Keys.
* **Vector Transmission:** Replaced the legacy discrete grid `move_sub` protocol with active `steer_sub` socket emissions packing `{ heading: Radians, speed: Float }` data structures.
* **Braking Mechanism:** Map bindings track `Spacebar` keystrokes to pass immediate `0.0` speed halt vectors.
* **Telemetry Display:** Upgraded coordinate updates from discrete integers into floating points (`.toFixed(1)`).
* **Testing Status:** Programmatic input injections via developer console logs verified. Continuous path tracking and engine threshold locking behaviors are fully stable.

---

## 🔮 Mid-Stream Context & Architectural Pitfalls to Avoid

* **Do Not Revert to Grid Math:** The front-end layout still builds an internal visual `helm-tile` matrix using `1` to `8` references for backwards compatibility during this transition. *Do not allow a future session to break the keyboard listener loop by reverting inputs to block increments.*
* **Power Constraints:** The authoritative server code requires engines and weapons power to sit strictly at $\ge 2$ units or triggers automated lockout states.
* **Transport Guardrails:** WebSockets transport configuration `['websocket']` must stay locked down on the client-side instantiation interface to prevent long-polling fallback degradation on cellular mobile clients.

---

## 🚀 Immediate Next Work Orders

1. **Phase 4, Step 1:** Replace the DOM-heavy `.helm-matrix` container on the Captain's panel with a performant 2D `<canvas>` rendering pipeline.
2. **Phase 4, Step 2:** Swap out the `.sonar-matrix` with a coordinate-less tactical radar canvas that plots expanding Euclidean vector rings.
