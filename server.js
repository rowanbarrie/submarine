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
        socket.join(team);
        socket.team = team;
        socket.role = role;
        socket.emit('state_update', { teamState: gameState.teams[team], active: gameState.active });
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

    // WEAPONS: Fire Torpedo
    socket.on('fire_torpedo', () => {
        if (!gameState.active || socket.role !== 'Weapons') return;
        const team = socket.team;
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

    // ADMIN/PLAYER: Reset Game State back to defaults
    socket.on('reset_game', () => {
        gameState = {
            active: true,
            teams: {
                Alpha: { pos: { x: 2, y: 2 }, hp: 100, target: { x: 4, y: 4 } },
                Bravo: { pos: { x: 7, y: 7 }, hp: 100, target: { x: 4, y: 4 } }
            }
        };

        // Notify all clients across both teams to instantly reload their screens
        io.emit('game_over', { winner: 'SYSTEM RESET' });
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Game engine running on port ${PORT}`));
