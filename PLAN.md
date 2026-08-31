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
| **Phase 5** | Interlocking Station Minigames | **In Progress** | Integrate server-verified slider and timing loops into the Weapons and Engineering stations. |

---

## 🏗️ Phase 5: Interlocking Station Minigames — IN PROGRESS

### 1. Step 1: Weapons Charge / Reload Calibration Minigame — Completed
* **Target Elements:** Embedded a rhythmic indicator rail widget inside the `#panel-Weapons` workspace.
* **Cryptographic Verification**: Added a token-generation mechanism (`expectedToken`) tied to target changes. Firing calls are strictly blocked unless a valid, server-issued security hash matches the confirmation vector.
* **State Interlock Enforcement**: Shifting targeted vectors dumps capacitor loads, resetting verification states to ensure active mechanical reloads are simulated during combat adjustments.

### 2. Step 2: Engineering Auxiliary Resource Routing — Pending
* **Target Elements:** Design a sequence matching or voltage balance grid game within the `#panel-Engineer` sub-panel layout.
* **Mechanic Goal**: Successful engineering balancing outputs will feed directly into hull patching checks, or let engineers venting excess friction safely execute low-noise silent running modes.

---

## 🎯 Next Engineering Work Orders
When a new AI or developer session initializes, they should pick up tasks directly matching the backlog order below:
1. **Implement Phase 5, Step 2: Engineering Auxiliary Power Routing Minigame** inside the `#panel-Engineer` workspace.
2. **Deploy Multi-Match Lobby Allocations** to allow individual groups to spawn custom room IDs without conflicting positions.
