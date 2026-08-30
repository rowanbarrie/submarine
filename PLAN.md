# 🗺️ Core Project Blueprint & Implementation Plan (PLAN.md)

> [!IMPORTANT]
> **THIS IS THE MASTER PLAN.** All AI engineering agents, automated processes, and human developers working on **Silent Depth** must prioritize, reference, and maintain this file as the single source of truth for the continuous 2D canvas migration. 

---

## 🏁 Architectural Phase Roadmap

| Phase | Description | Status | Target/Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Coordinate System Re-Mapping | **Done** | Core server spatial dimensions upscaled from integer grids to 800x800 float structures. |
| **Phase 2** | Vector Mechanics & Smooth Kinematics | **Done** | Implemented 30Hz physics tick-rate logic loop and mapped smooth client-side steering keys. |
| **Phase 3** | Spatial Telemetry & Collisions | **Done** | Deployed Euclidean calculation matrices, circle weapon hitboxes, and boundary network filters. |
| **Phase 4** | Frontend UI Rendering (HTML5 Canvas) | **PENDING** | Re-engineer UI screens to ditch heavy DOM elements for pure, performant `<canvas>` workspaces. |

---

## 🏗️ Phase 4: Frontend UI Rendering (HTML5 Canvas)
**Objective:** Upgrade the Captain's tracking grid and the Sonar operator's map matrix to standard HTML5 `<canvas>` rendering spaces. This preserves our strict 4KB weight budget by avoiding complex DOM trees, while mapping continuous float coordinates beautifully.

### 1. Step 1: Captain Canvas Rendering Bridge
* **Target Elements:** Replace the legacy, DOM-heavy `.helm-matrix` container on the Captain's panel with a single lightweight 2D `<canvas>` element (`id="captain-canvas"`).
* **Dimensional Scales:** Match the canvas context dimensions exactly to the server physics boundaries (`width="800" height="800"`), scaled gracefully via responsive CSS parameters to fit mobile layouts.
* **Vector Drawing Pipe:** Build a real-time rendering script to clear and redraw key tactical layers upon receiving server state packets:
  * **Own Submarine:** Render a distinct blue pointer triangle or radar dot reflecting continuous values from `data.teamState.pos` (`x`, `y`), rotated using the `data.teamState.heading` angle vector.
  * **Target Crosshair:** Paint an intersecting fire-control ring or custom red indicator at the designated weapon coordinates (`data.teamState.target`).
* **Input Intercept Remap:** Update the canvas `'click'` tracking event handler. It must extract relative coordinate clicks via `offsetX` and `offsetY` values, scale them to the absolute 800x800 layer space, and emit them via the active `set_target` payload stream.

### 2. Step 2: Sonar Passive Tactical Display
* **Target Elements:** Swap out the legacy `.sonar-matrix` block on the Sonar Operator screen with an adaptive tactical radar `<canvas>` canvas (`id="sonar-canvas"`).
* **Proximity Wave Ring Map:** Replace the blocky tile-loop highlights with real geometric radar wave arcs. When a raw Euclidean distance is intercepted (`/Distance:\s*([\d.]+)/`), plot an empty concentric vector circle outward around your submarine's center location.
* **Manual Contact Tracking:** Support custom telemetry annotation overlays. When the Sonar Operator touches coordinates on the canvas workspace, drop colored marker flags (e.g., Green = suspected tracking vectors, Red = weapon splash points) plotted into standard coordinate storage matrices.

---

## 🎯 Next Engineering Work Orders
When a new AI or developer session initialises, they should pick up tasks directly matching the backlog order below:
1. **Migrate Captain Panel UI** to the high-performance HTML5 2D Canvas context rendering loop.
2. **Migrate Sonar Matrix Grid** to the floating-vector circle radar wave chart loop.
