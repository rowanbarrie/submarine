const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

// Global Game State
let gameState = {
    active: true,
    teams: {
        Alpha: { pos: { x: 2, y: 2 }, hp: 100, target: { x: 4, y: 4 } },
        Bravo: { pos: { x: 7, y: 7 }, hp: 100, target: { x: 4, y: 4 } }
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
        socket.team = team;
        socket.role = role;

        // Initialize a roster array for the team if it doesn't exist
        if (!gameState.teams[team].roster) {
            gameState.teams[team].roster = [];
        }
        // Add this role to the roster if it's not already there
        if (!gameState.teams[team].roster.includes(role)) {
            gameState.teams[team].roster.push(role);
        }

        // Broadcast the update to the team room
        io.to(team).emit('state_update', { 
            teamState: gameState.teams[team], 
            active: gameState.active 
        });
    });

    // CAPTAIN: Move Sub
    socket.on('move_sub', (direction) => {
        if (!gameState.active || socket.role !== 'Captain') return;
        const team = socket.team;
        let pos = gameState.teams[team].pos;

        if (direction === 'N' && pos.y > 1) pos.y--;
        if (direction === 'S' && pos.y < 8) pos.y++;
        if (direction === 'E' && pos.x < 8) pos.x++;
        if (direction === 'W' && pos.x > 1) pos.x--;

        // Pass the absolute team object containing positional math and roster structures
        io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        
        // SONAR MATH
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

    // WEAPONS / CAPTAIN OVERRIDE: Fire Torpedo
    socket.on('fire_torpedo', () => {
        if (!gameState.active) return;
        
        const team = socket.team;
        const role = socket.role;
        const roster = gameState.teams[team].roster || [];

        // Allow if player is Weapons Officer, OR if they are Captain and no Weapons Officer is registered
        const isAuthorizedCaptain = (role === 'Captain' && !roster.includes('Weapons'));
        if (role !== 'Weapons' && !isAuthorizedCaptain) return;
        
        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        const target = gameState.teams[team].target;
        const enemyPos = gameState.teams[enemyTeam].pos;

        if (target.x === enemyPos.x && target.y === enemyPos.y) {
            gameState.teams[enemyTeam].hp -= 50;
            io.to(team).emit('sonar_ping', { message: `💥 CONFIRMED HIT on target vector X:${target.x} Y:${target.y}!` });
            io.to(enemyTeam).emit('sonar_ping', { message: `🚨 EMERGENCY! Direct hull strike at vector X:${target.x} Y:${target.y}!` });
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

    // Dynamic room roster cleanup on socket drop
    socket.on('disconnect', () => {
        const team = socket.team;
        const role = socket.role;
        if (team && gameState.teams[team] && gameState.teams[team].roster) {
            gameState.teams[team].roster = gameState.teams[team].roster.filter(r => r !== role);
            io.to(team).emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
        }
    });

    // ADMIN/PLAYER: Reset Game State back to defaults
    socket.on('reset_game', () => {
        gameState = {
            active: true,
            teams: {
                Alpha: { pos: { x: 2, y: 2 }, hp: 100, target: { x: 4, y: 4 }, roster: [] },
                Bravo: { pos: { x: 7, y: 7 }, hp: 100, target: { x: 4, y: 4 }, roster: [] }
            }
        };
        
        // Broadcast the specific reset signal to all connected clients
        io.emit('game_over', { winner: 'SYSTEM RESET' }); 
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Game engine running on port ${PORT}`));
