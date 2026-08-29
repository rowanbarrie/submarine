const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

// Global Game State with Engineering Power Subsystems
let gameState = {
    active: true,
    teams: {
        Alpha: { 
            pos: { x: 2, y: 2 }, 
            hp: 100, 
            target: { x: 4, y: 4 },
            power: { engines: 2, weapons: 2, shields: 2 }
        },
        Bravo: { 
            pos: { x: 7, y: 7 }, 
            hp: 100, 
            target: { x: 4, y: 4 },
            power: { engines: 2, weapons: 2, shields: 2 }
        }
    }
};

function calculateDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

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
        
        // Block additions if pool is maxed out
        if (delta === 1 && currentTotal >= 6) return; 
        // Block reductions if track is empty
        if (delta === -1 && currentPower[system] <= 0) return;
        // Block additions if component track is overcharged
        if (delta === 1 && currentPower[system] >= 4) return;

        gameState.teams[team].power[system] += delta;

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
    });

    // CAPTAIN: Move Sub (Enforces Engine Power Rules)
    socket.on('move_sub', (direction) => {
        if (!gameState.active || socket.role !== 'Captain') return;
        const team = socket.team;
        
        if (gameState.teams[team].power.engines < 2) {
            socket.emit('sonar_ping', { message: "🛑 HELM STALLED: Critical engine failure. Chief Engineer must allocate at least 2 Power Units to Engines!" });
            return;
        }

        let pos = gameState.teams[team].pos;
        if (direction === 'N' && pos.y > 1) pos.y--;
        if (direction === 'S' && pos.y < 8) pos.y++;
        if (direction === 'E' && pos.x < 8) pos.x++;
        if (direction === 'W' && pos.x > 1) pos.x--;

        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        
        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        const dist = calculateDistance(gameState.teams[team].pos, gameState.teams[enemyTeam].pos);
        io.to(enemyTeam).emit('sonar_ping', { message: `Engine signatures detected. Distance: ${dist} sectors away.` });
    });

    // CAPTAIN: Update Torpedo Coordinates Target
    socket.on('set_target', ({ x, y }) => {
        if (!gameState.active || socket.role !== 'Captain') return;
        const team = socket.team;
        gameState.teams[team].target = { x: parseInt(x), y: parseInt(y) };
        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
    });

    // WEAPONS: Fire Torpedo (Enforces Weapons Power & Shield Mitigation)
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

        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        const target = gameState.teams[team].target;
        const enemyPos = gameState.teams[enemyTeam].pos;

        if (target.x === enemyPos.x && target.y === enemyPos.y) {
            const enemyShields = gameState.teams[enemyTeam].power.shields;
            const mitigatedDamage = Math.max(0, 50 - (enemyShields * 10));
            
            gameState.teams[enemyTeam].hp -= mitigatedDamage;
            
            io.to(team).emit('sonar_ping', { message: `💥 CONFIRMED HIT on target X:${target.x} Y:${target.y}! Penetrated armor for ${mitigatedDamage} damage.` });
            io.to(enemyTeam).emit('sonar_ping', { message: `🚨 EMERGENCY! Direct hull strike at X:${target.x} Y:${target.y}! Defenses absorbed some impact. Took ${mitigatedDamage} damage.` });
        } else {
            io.to(team).emit('sonar_ping', { message: `💦 Torpedo missed at vector X:${target.x} Y:${target.y}.` });
            io.to(enemyTeam).emit('sonar_ping', { message: `Sonar reports splash down noise at vector X:${target.x} Y:${target.y}.` });
        }

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
            teams: {
                Alpha: { pos: { x: 2, y: 2 }, hp: 100, target: { x: 4, y: 4 }, roster: [], power: { engines: 2, weapons: 2, shields: 2 } },
                Bravo: { pos: { x: 7, y: 7 }, hp: 100, target: { x: 4, y: 4 }, roster: [], power: { engines: 2, weapons: 2, shields: 2 } }
            }
        };
        io.emit('game_over', { winner: 'SYSTEM RESET' }); 
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Game engine running on port ${PORT}`));
