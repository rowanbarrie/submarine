# Project Vision Blueprint: SILENT DEPTH (High-Level Design)

## 🚢 Overview & Core Gameplay Mechanics
"Silent Depth" is a mobile browser-based asymmetric tactical party game designed for two teams (Alpha and Bravo) playing in two physically separate rooms. The game mechanics are heavily inspired by classic submarine warfare movies like *The Hunt for Red October*. Teams have no direct visual info on the enemy. They must rely entirely on asymmetric verbal communication inside their rooms and tactical telemetry sent via mobile browser control panels to hunt, locate, and sink the opposing submarine.

### 🎮 The Core Game Loop
* **The Arena:** The battle takes place on a hidden 8x8 navigation grid managed by the server.
* **Movement & Detection:** Every time a submarine moves, the system calculates the grid-based Manhattan distance to the enemy and broadcasts it only to the opposing team's Sonar station.
* **The Strike:** The Captain marks target coordinates on an interactive display, which synchronizes instantly with the Weapons station. The Weapons Officer can then fire a torpedo. Two direct hits sink a submarine and win the game.

---

## 👥 Player Stations (Per Submarine Room)

### 1. 🧭 Captain (Helm & Strategy)
* **Interface:** Interactive 8x8 grid map view showing own submarine position and the active weapons crosshair lock. Equipped with directional movement controls.
* **Duties:** Navigates the grid matrix, determines defensive positioning, updates offensive targeting by tapping grid squares, and commands the room's operations.

### 2. 📡 Sonar Technician (Tracking & Intel)
* **Interface:** Scrolling high-visibility passive telemetry logs feed.
* **Duties:** Receives automatic raw distance estimation alerts every time the enemy sub moves (e.g., estimating distance in sectors away). Must coordinate verbally with the Captain to deduce, map, and predict the enemy's exact coordinates.

### 3. 💥 Weapons Officer (Torpedo Engagement)
* **Interface:** Payload activation panel receiving real-time crosshair coordinate locks directly from the Captain's bridge display.
* **Duties:** Confirms structural targeting telemetry, primes ordnance payloads, and fires torpedo strikes.

### 4. 🛠️ Chief Engineer (System Repairs & Power Management)
* **Interface:** Structural maintenance bay panel.
* **Duties:** Standardized structural systems backup monitor (slated for rapid mini-game integrations to repair hull damage points and manage energy cooling thresholds).

---

## 🏗️ Technical Architecture & Network Design

### ⚡ Infrastructure Specs
* **Backend Host:** DigitalOcean Droplet Instance handling unified game state.
* **Real-time Protocol:** Node.js backend using Socket.io with forced native WebSocket transport configurations. This ensures immediate data synchronization and bypasses cellular network long-polling latency on mobile browsers.
* **Network Security:** Explicit internal and external firewall rules configured to permit public incoming traffic strictly over port 3000.
* **Frontend Delivery:** Pure lightweight, semantic HTML5 and vanilla CSS. By embedding styling directly and avoiding heavy frontend framework scripts, the page weight remains under 4KB, allowing instantaneous rendering over cellular data.

### 🔄 Dynamic State Tracking
* **Server Authority:** The server remains the single source of truth, storing absolute coordinate objects for both teams and processing collision/hit boxes.
* **Client Isolation:** The server selectively broadcasts game data. A team's state is strictly hidden from the opponents, passing only derived abstraction telemetry (like calculated distance values) to the enemy room.

---

## 🗺️ Next Generation Feature Backlog

1. **Sonar Visual Graph Map:** Give Sonar technicians a clear map grid layout where clicking sectors drops visual tracking pins to trace suspected paths manually based on distance logs.
2. **Weapons Charge / Reload Calibration:** Integrate timed slider games or sequence button matching tasks before Torpedo Officers can engage the firing mechanisms.
3. **Engineering Resource Routing:** Active control valves for engineers to run hull welding checks or dump engine heat signatures to initiate silent stealth runs.

## 🚀 Production Deployment via PM2

To ensure the game server runs continuously in the background on your DigitalOcean Droplet and automatically restarts after crashes or reboots, deploy it using PM2:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Launch your server file and assign it a name
pm2 start server.js --name "submarine"

# Ensure PM2 boots up your game automatically if the Droplet reboots
pm2 startup
pm2 save
```


## 📦 Codebase Packing with Repomix

This project uses [Repomix](https://github.com) to pack the codebase into a single file for AI code reviews and analysis.

To generate a new packed repository file, run:

```bash
npx repomix
```

*Excluded by default via `.gitignore`: `node_modules/`, `npm-debug.log`, and `repomix-output.xml`.*

