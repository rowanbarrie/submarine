# ⚓ Silent Depth Project Status & Continuity Ledger

This file tracks completed tasks, current architectural states, and immediate next steps. It allows new AI engineering sessions to instantly safely align with the codebase state.

---

## 🏁 Phase Status Summary

| Phase | Description | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Coordinate System Re-Mapping | **Done** | Server space is 800x800 float space. Client target tracking inputs migrated to capture floating vectors. |
| **Phase 2** | Vector Mechanics & Smooth Kinematics | **In Progress** | Server 30Hz update loop complete. Client keyboard inputs & throttled vector steering complete (Step 3). |
| **Phase 3** | Spatial Telemetry & Collisions | **Pending** | Needs Manhattan distance swapped out for Euclidean formulas and circular torpedo blast hitboxes. |
| **Phase 4** | Frontend UI Rendering (HTML5 Canvas) | **Pending** | Needs DOM grids (`.helm-matrix`, `.sonar-matrix`) replaced with performant 2D canvas surfaces. |

---

## 🛠️ Recent Implementations (Latest Session)

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

1. **Phase 3, Step 1:** Refactor the math block in `server.js` (`calculateDistance`) from Manhattan distance to Euclidean distance:  
   $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$
2. **Phase 3, Step 2:** Update `fire_torpedo` inside `server.js` from a strict absolute match (`target.x === enemyPos.x`) to an overlapping circle spatial test using a `BLAST_RADIUS = 30.0` configuration threshold.
