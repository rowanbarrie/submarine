# 🗺️ Architectural Blueprint: Continuous 2D Conversion

This blueprint outlines a high-level roadmap to smoothly transition **Silent Depth** from discrete 8x8 grid turns to continuous 2D space. It is structured into self-contained, bite-sized tasks designed to be AI-friendly.

---

## 🏗️ Phase 1: Coordinate System Re-Mapping
**Objective:** Swap the server and client data formats from absolute integer grid steps to continuous floating-point structures, bound by a bounding box canvas.

### 1. Unified Arena Geometry Definition
* Define a bounding arena coordinate dimension (e.g., `WIDTH = 800`, `HEIGHT = 800`) on both server and client instead of `8x8`.
* Establish starting vectors for teams as middle percentages (e.g., Team Alpha: `{ x: 200.0, y: 200.0 }`, Team Bravo: `{ x: 600.0, y: 600.0 }`).

### 2. State & Payload Updates
* **Server Updates (`server.js`):** Modify `gameState.teams` initialization coordinates from integers to floats. Update the crosshair target validation parameters to capture float inputs.
* **Client Target Tracking (`public/index.html`):** Adjust `set_target` logic to output arbitrary `{x, y}` coordinates rather than locked integer nodes.

---

## 🏎️ Phase 2: Vector Mechanics & Smooth Kinematics
**Objective:** Replace discrete directional buttons (`N`, `S`, `E`, `W`) with a continuous velocity vector loop, using time-based tracking to handle engine performance rules.

### 1. Velocity-Based Kinematics
* Add a continuous tracking loop on the server (`setInterval` at ~30Hz or 60Hz tick rate) to dynamically update submarine vectors based on their headings.
* Introduce directional heading angles (in radians or degrees) and speed parameters inside the server's team object models.

### 2. Time-Delta Physics Integration
* Calculate delta-time multipliers (Δ t) within the server tracking engine loop to guarantee lag-resistant sub movement.
* Link allocated engine power directly to top-speed variables (e.g., 0 units = stalled, 2 units = base cruise speed, 4 units = maximum velocity overload).

### 3. Client UI Helm Remap
* Ditch the grid buttons on the Captain's panel. Replace them with a Virtual D-Pad, an interactive compass dial, or standard keyboard mappings (`WASD` / Arrow keys).
* Transmit throttle changes (`speed`) and steering angles (`heading`) to the server via continuous, throttled Socket.io event emissions.

---

## 📡 Phase 3: Spatial Telemetry, Sonar Rings & Collisions
**Objective:** Re-engineer distance tracking algorithms, proximity triggers, and weapon hitboxes to process continuous coordinate math rather than Manhattan distance.

### 1. Continuous Distance & Sonar Calculations
* Swap out the server-side `calculateDistance` Manhattan equation (|x₁ - x₂| + |y₁ - y₂|) for the Euclidean distance formula:
  d = √((x₂ - x₁)² + (y₂ - y₁)²)
* Configure the server loop to evaluate distance changes at periodic intervals, transmitting continuous proximity alerts to the opposing sub's hydrophones.
* **Telemetry Suppression Filter:** Maintain a historical log of emitted distance signatures per team. If a vessel becomes stuck running into an arena wall boundary, suppress redundant network socket packet spam to the opponent's logs.

### 2. Dynamic Torpedo Blast Radius
* Convert the direct coordinate match checker (`target.x === enemyPos.x`) inside `fire_torpedo` to a circle-to-point spatial distance test.
* Apply an explosive hit detection radius (e.g., `BLAST_RADIUS = 30` pixels). If the calculated distance to the target center falls below this threshold, register a hit.

### 3. Collision Bound Constraints
* Implement hard canvas edge-clamping on the server tick algorithm to prevent players from steering submarines outside the active play boundaries.

---

## 🎨 Phase 4: Frontend UI Rendering (HTML5 Canvas)
**Objective:** Upgrade the Captain's tracking grid and the Sonar operator's map matrix to standard `<canvas>` rendering spaces. This preserves the 4KB weight budget by avoiding complex DOM trees.

### 1. Captain Canvas Rendering Bridge
* Replace the DOM-heavy `.helm-matrix` container on the Captain's panel with a lightweight 2D `<canvas>` element.
* Build a rendering script to draw your submarine avatar, track direction lines, and render target crosshair rings based on incoming coordinate feeds.

### 2. Sonar Passive Waterfall Display
* Swap the `.sonar-matrix` structure with a tactical `<canvas>` overlay.
* Map incoming Euclidean sonar distance vectors into expanding radar rings relative to your own sub center position, painting ping clusters to help track enemy paths.

---

## 🔮 Strategic Prompt Ordering (For AI Chat Sessions)
To prevent your AI tool from losing context, copy and paste each item below as a **standalone prompt** in a brand-new chat session, moving down the list only after the previous step is finished:

1. "Using Express 5.x and Socket.io 4.x, migrate the server-side coordinate structures from an 8x8 board layout to an 800x800 coordinate system with floating-point vectors." (Completed)
2. "Implement a 30Hz server-side update loop using setInterval to smoothly move sub coordinates based on speed, heading angles, and engine allocations." (Completed)
3. "Convert the user-facing movement inputs on the client from discrete button triggers to keyboard listeners and directional steering event emitters." (Completed)
4. "Refactor the server's tracking and combat logic to calculate standard Euclidean distances instead of Manhattan distances, implement circle-based torpedo blast checks, and suppress wall-grinding ping flood loops." (Completed)
5. "Re-engineer the frontend HTML UI, swapping out the grid matrix blocks for highly performant, lightweight HTML5 Canvas elements."
