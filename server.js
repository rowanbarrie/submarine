const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

// Global Game State with 800x800 Continuous Coordinate Space
let gameState = {
    active: true,
    arena: {
        width: 800.0,
        height: 800.0
    },
    teams: {
        Alpha: { 
            pos: { x: 200.0, y: 200.0 }, 
            hp: 100, 
            speed: 0.0,
            heading: 0.0, // Radians
            target: { x: 400.0, y: 400.0 },
            power: { engines: 2, weapons: 2, shields: 2 },
            calibrated: false,
            expectedToken: null
        },
        Bravo: { 
            pos: { x: 600.0, y: 600.0 }, 
            hp: 100, 
            speed: 0.0,
            heading: 0.0, // Radians
            target: { x: 400.0, y: 400.0 },
            power: { engines: 2, weapons: 2, shields: 2 },
            calibrated: false,
            expectedToken: null
        }
    }
};

function calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

// --- 30Hz Physics Engine Loop ---
let lastUpdateTime = Date.now();
setInterval(() => {
    if (!gameState.active) return;

    const now = Date.now();
    const dt = (now - lastUpdateTime) / 1000.0; // Delta time in seconds
    lastUpdateTime = now;

    let stateChanged = false;

    for (const teamId of Object.keys(gameState.teams)) {
        const team = gameState.teams[teamId];
        
        // Enforce engine minimum thresholds. Submarines stall under 2 power.
        if (team.power.engines >= 2 && team.speed > 0) {
            // Calculate base top speed scaled by engineering engine cells
            const maxSpeedCap = team.power.engines * 30.0; 
            const absoluteSpeed = Math.min(team.speed, maxSpeedCap);

            // Vector kinematics mapping
            team.pos.x += Math.cos(team.heading) * absoluteSpeed * dt;
            team.pos.y += Math.sin(team.heading) * absoluteSpeed * dt;

            // Bound constraints clamping
            team.pos.x = Math.max(0.0, Math.min(team.pos.x, gameState.arena.width));
            team.pos.y = Math.max(0.0, Math.min(team.pos.y, gameState.arena.height));
            stateChanged = true;
        }
    }

    if (stateChanged) {
        // Broadcast updated spatial locations to respective rooms safely
        for (const teamId of Object.keys(gameState.teams)) {
            io.to(teamId).emit('state_update', { teamState: gameState.teams[teamId], active: gameState.active });
        }
    }
}, 1000 / 30);

io.on('connection', (socket) => {
    socket.on('join_game', ({ team, role }) => {
        socket.team = team;
        socket.role = role;
        socket.join(team);

        if (!gameState.teams[team].roster) {
            gameState.teams[team].roster = [];
        }
        if (!gameState.teams[team].roster.includes(role)) {
            gameState.teams[team].roster.push(role);
        }

        // Generate initial verification task token if team needs weapon loading
        if (role === 'Weapons' && !gameState.teams[team].calibrated) {
            const token = 'TK-' + Math.floor(Math.random() * 89999 + 10000);
            gameState.teams[team].expectedToken = token;
            socket.emit('request_calibration', { token });
        }

        io.to(team).emit('state_update', { 
            teamState: gameState.teams[team], 
            active: gameState.active 
        });
    });

    // CHIEF ENGINEER: Update Power Distribution Grid Routing
    socket.on('update_power', ({ system, change }) => {
        if (!gameState.active || socket.role !== 'Engineer') return;
        const team = socket.team;
        const currentPower = gameState.teams[team].power;
        
        const delta = parseInt(change, 10);
        const currentTotal = currentPower.engines + currentPower.weapons + currentPower.shields;
        
        if (delta === 1 && currentTotal >= 6) return; 
        if (delta === -1 && currentPower[system] <= 0) return;
        if (delta === 1 && currentPower[system] >= 4) return;

        gameState.teams[team].power[system] += delta;

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
    });

    // CAPTAIN: Process continuous steering inputs (Throttled vectors)
    socket.on('steer_sub', ({ heading, speed }) => {
        if (!gameState.active || socket.role !== 'Captain') return;
        const team = socket.team;
        
        if (gameState.teams[team].power.engines < 2) {
            gameState.teams[team].speed = 0;
            socket.emit('sonar_ping', { message: "🛑 HELM STALLED: Critical engine failure. Chief Engineer must allocate at least 2 Power Units to Engines!" });
            return;
        }

        if (heading !== undefined) gameState.teams[team].heading = parseFloat(heading);
        if (speed !== undefined) {
            const maxSpeedCap = gameState.teams[team].power.engines * 30.0;
            gameState.teams[team].speed = Math.min(parseFloat(speed), maxSpeedCap);
        }

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        
        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        const dist = calculateDistance(gameState.teams[team].pos, gameState.teams[enemyTeam].pos);
        if (!gameState.teams[team].lastEmittedDist || Math.abs(gameState.teams[team].lastEmittedDist - dist) > 0.1) {
            if (gameState.teams[team].speed > 0) {
                io.to(enemyTeam).emit('sonar_ping', { message: `Engine signatures detected. Distance: ${dist.toFixed(1)} units away.` });
                gameState.teams[team].lastEmittedDist = dist;
            }
        }
    });

    // CAPTAIN: Update Torpedo Coordinates Target
    socket.on('set_target', ({ x, y }) => {
        if (!gameState.active || socket.role !== 'Captain') return;
        const team = socket.team;

        const targetX = Math.max(0.0, Math.min(parseFloat(x), gameState.arena.width));
        const targetY = Math.max(0.0, Math.min(parseFloat(y), gameState.arena.height));

        gameState.teams[team].target = { x: targetX, y: targetY };
        
        // Target shift automatically discharges capacitor to enforce a fresh calibration verification run
        gameState.teams[team].calibrated = false;
        const token = 'TK-' + Math.floor(Math.random() * 89999 + 10000);
        gameState.teams[team].expectedToken = token;
        io.to(team).emit('request_calibration', { token });

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
    });

    // WEAPONS: Verify calibration submission match
    socket.on('submit_calibration', ({ token }) => {
        if (!gameState.active || socket.role !== 'Weapons') return;
        const team = socket.team;

        if (gameState.teams[team].expectedToken && token === gameState.teams[team].expectedToken) {
            gameState.teams[team].calibrated = true;
            socket.emit('sonar_ping', { message: "✅ CAPACITOR CHARGED: Torpedo calibration lock verified." });
            io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        } else {
            socket.emit('sonar_ping', { message: "⚠️ CALIBRATION FAULT: Desynchronized loading vector rejected." });
        }
    });

    // WEAPONS: Fire Torpedo (Enforces Calibration, Weapons Power & Shield Mitigation)
    socket.on('fire_torpedo', () => {
        if (!gameState.active) return;
        
        const team = socket.team;
        const role = socket.role;
        const roster = gameState.teams[team].roster || [];

        const isAuthorizedCaptain = (role === 'Captain' && !roster.includes('Weapons'));
        if (role !== 'Weapons' && !isAuthorizedCaptain) return;
        
        if (gameState.teams[team].power.weapons < 2) {
            socket.emit('sonar_ping', { message: "❌ FIRE CONTROL LOCKED: Insufficient capacitor energy. Weapons requires at least 2 Power Units!" });
            return;
        }

        // Security check evaluating physical mini-game execution log compliance
        if (!gameState.teams[team].calibrated && !isAuthorizedCaptain) {
            socket.emit('sonar_ping', { message: "❌ FIRE CONTROL FAILURE: Torpedo bay calibration signatures missing. Reload required." });
            return;
        }

        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        const target = gameState.teams[team].target;
        const enemyPos = gameState.teams[enemyTeam].pos;
        const torpedoDistance = calculateDistance(target, enemyPos);
        const BLAST_RADIUS = 50.0;

        // Consume authorization lock immediately post-launch
        gameState.teams[team].calibrated = false;

        if (torpedoDistance <= BLAST_RADIUS) {
            const enemyShields = gameState.teams[enemyTeam].power.shields;
            const mitigatedDamage = Math.max(0, 50 - (enemyShields * 10));
            
            gameState.teams[enemyTeam].hp -= mitigatedDamage;
            
            io.to(team).emit('sonar_ping', { message: `💥 CONFIRMED HIT on target X:${target.x.toFixed(1)} Y:${target.y.toFixed(1)}! Penetrated armor for ${mitigatedDamage} damage.` });
            io.to(enemyTeam).emit('sonar_ping', { message: `🚨 EMERGENCY! Direct hull strike at X:${target.x.toFixed(1)} Y:${target.y.toFixed(1)}! Defenses absorbed some impact. Took ${mitigatedDamage} damage.` });
        } else {
            io.to(team).emit('sonar_ping', { message: `💦 Torpedo missed at vector X:${target.x.toFixed(1)} Y:${target.y.toFixed(1)}.` });
            io.to(enemyTeam).emit('sonar_ping', { message: `Sonar reports splash down noise at vector X:${target.x.toFixed(1)} Y:${target.y.toFixed(1)}.` });
        }

        // Issue replacement challenge immediately for next reload sequence
        const token = 'TK-' + Math.floor(Math.random() * 89999 + 10000);
        gameState.teams[team].expectedToken = token;
        io.to(team).emit('request_calibration', { token });

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        io.to(enemyTeam).emit('state_update', { teamState: gameState.teams[enemyTeam], active: gameState.active });

        if (gameState.teams[enemyTeam].hp <= 0) {
            gameState.active = false;
            io.emit('game_over', { winner: team });
        }
    });

    socket.on('disconnect', () => {
        const team = socket.team;
        const role = socket.role;
        if (team && gameState.teams[team] && gameState.teams[team].roster) {
            gameState.teams[team].roster = gameState.teams[team].roster.filter(r => r !== role);
            io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        }
    });

    socket.on('reset_game', () => {
        gameState = {
            active: true,
            arena: { width: 800.0, height: 800.0 },
            teams: {
                Alpha: { pos: { x: 200.0, y: 200.0 }, hp: 100, speed: 0.0, heading: 0.0, target: { x: 400.0, y: 400.0 }, roster: [], power: { engines: 2, weapons: 2, shields: 2 }, calibrated: false, expectedToken: null },
                Bravo: { pos: { x: 600.0, y: 600.0 }, hp: 100, speed: 0.0, heading: 0.0, target: { x: 400.0, y: 400.0 }, roster: [], power: { engines: 2, weapons: 2, shields: 2 }, calibrated: false, expectedToken: null }
            }
        };
        io.emit('game_over', { winner: 'SYSTEM RESET' }); 
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Game engine running on port ${PORT}`));

