# 🗺️ Core Project Blueprint & Implementation Plan (PLAN.md)

> [!IMPORTANT]
> **THIS IS THE MASTER PLAN.** All AI engineering agents, automated processes, and human developers working on **Silent Depth** must prioritize, reference, and maintain this file as the single source of truth for the continuous 2D canvas architecture. 

---

## 🏁 Architectural Phase Roadmap

| Phase | Description | Status | Target/Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Coordinate System Re-Mapping | **Done** | Core server spatial dimensions upscaled from integer grids to 800x800 float structures. |
| **Phase 2** | Vector Mechanics & Smooth Kinematics | **Done** | Implemented 30Hz physics tick-rate logic loop and mapped smooth client-side steering keys. |
| **Phase 3** | Spatial Telemetry & Collisions | **Done** | Deployed Euclidean calculation matrices, circle weapon hitboxes, and boundary network filters. |
| **Phase 4** | Frontend UI Rendering (HTML5 Canvas) | **Done** | Upgraded Captain & Sonar panels to high-performance HTML5 2D `<canvas>` spaces. |
| **Phase 5** | Interlocking Station Minigames | **PENDING** | Integrate server-verified slider and timing loops into the Weapons and Engineering stations. |

---

## 🏗️ Phase 4: Frontend UI Rendering (HTML5 Canvas) — COMPLETED
**Objective:** Upgrade the Captain's tracking grid and the Sonar operator's map matrix to standard HTML5 `<canvas>` rendering spaces. This preserves our strict 4KB weight budget by avoiding complex DOM trees, while mapping continuous float coordinates beautifully.

### 1. Step 1: Captain Canvas Rendering Bridge — Completed
* **Target Elements:** Replaced legacy, DOM-heavy `.helm-matrix` container on the Captain's panel with a single lightweight 2D `<canvas>` element (`id="captain-canvas"`).
* **Dimensional Scales:** Matches canvas context dimensions exactly to server physics boundaries (`800x800`), scaling responsively via CSS to fit mobile layouts.
* **Vector Drawing Pipe:** Implemented real-time rendering script to redraw a blue vector pointer triangle reflecting `data.teamState.pos` and `data.teamState.heading` angle vectors, along with a red intersecting fire-control crosshair ring.
* **Input Intercept Remap:** Remapped canvas `'click'` tracking to extract relative coordinates via `offsetX` and `offsetY`, auto-scaling to absolute 800x800 spaces to emit exact `set_target` payloads.

### 2. Step 2: Sonar Passive Tactical Display — Completed
* **Target Elements:** Swapped out the legacy `.sonar-matrix` block on the Sonar Operator screen with an adaptive tactical radar `<canvas>` canvas (`id="sonar-canvas"`).
* **Proximity Wave Ring Map:** Replaced old blocky tile-loop highlights with geometric radar wave arcs. Intercepts raw Euclidean float distances via regex tracking and plots concentric vector circles outward around your submarine's center location.
* **Manual Contact Tracking:** Integrated mouse and touch tracking arrays. Allows operators to drop persistent coordinate markers (Green = suspected tracking vectors, Red = weapon splash points) with manual data purging capabilities.

---

## 🎯 Next Engineering Work Orders
When a new AI or developer session initializes, they should pick up tasks directly matching the backlog order below:
1. **Implement Phase 5, Step 1: Weapons Charge / Reload Calibration Minigame** inside the `#panel-Weapons` workspace.
2. **Deploy Server-Side Payload Validation Markers** to ensure fire mechanics reject injection payloads from the developer console.

