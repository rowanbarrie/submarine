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
    teams: {
        Alpha: { pos: { x: 1, y: 1 }, hp: 100, charging: false },
        Bravo: { pos: { x: 8, y: 8 }, hp: 100, charging: false }
    }
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join team and role
    socket.on('join_game', ({ team, role }) => {
        socket.join(team);
        socket.team = team;
        socket.role = role;
        console.log(`Player joined Team ${team} as ${role}`);
        
        // Send initial state to the user
        socket.emit('state_update', gameState.teams[team]);
    });

    // Captain order: Move
    socket.on('move_sub', (direction) => {
        const team = socket.team;
        if (socket.role !== 'Captain') return;

        let pos = gameState.teams[team].pos;
        if (direction === 'N' && pos.y > 1) pos.y--;
        if (direction === 'S' && pos.y < 8) pos.y++;
        if (direction === 'E' && pos.x < 8) pos.x++;
        if (direction === 'W' && pos.x > 1) pos.x--;

        // Notify own team of movement
        io.to(team).emit('state_update', gameState.teams[team]);
        
        // Notify enemy sonar (with a ping delay or abstract distance)
        const enemyTeam = team === 'Alpha' ? 'Bravo' : 'Alpha';
        io.to(enemyTeam).emit('sonar_ping', { message: "Cavitation detected nearby!" });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Submarine server running on port ${PORT}`));

