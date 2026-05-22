const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ─── IN-MEMORY STORE ───
// rooms[roomId] = { code, lang, users: Map<socketId, {id,name,color,line,col,typing}> }
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: `// Room: ${roomId}\n// Start coding — others will see your changes live!\n\nconsole.log("Hello, World!");`,
      lang: 'js',
      users: new Map()
    });
  }
  return rooms.get(roomId);
}

// ─── SERVE FRONTEND ───
app.use(express.static(path.join(__dirname, '../client')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ─── SOCKET EVENTS ───
io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUser = null;

  // JOIN ROOM
  socket.on('join', ({ roomId, name, color }) => {
    currentRoom = roomId;
    currentUser = { id: socket.id, name, color, line: 1, col: 1, typing: false };

    const room = getRoom(roomId);
    room.users.set(socket.id, currentUser);
    socket.join(roomId);

    // Send current room state to the joining user
    socket.emit('room:state', {
      code: room.code,
      lang: room.lang,
      users: Array.from(room.users.values())
    });

    // Notify everyone else
    socket.to(roomId).emit('user:joined', currentUser);

    console.log(`[${roomId}] ${name} joined (${socket.id}) — ${room.users.size} online`);
  });

  // CODE CHANGE
  socket.on('code:change', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.code = code;
    // Broadcast to everyone else in the room
    socket.to(roomId).emit('code:update', { code, userId: socket.id });
  });

  // CURSOR MOVE
  socket.on('cursor:move', ({ roomId, line, col, typing }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    if (user) { user.line = line; user.col = col; user.typing = typing; }
    socket.to(roomId).emit('cursor:update', { id: socket.id, line, col, typing });
  });

  // LANGUAGE CHANGE
  socket.on('lang:change', ({ roomId, lang }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.lang = lang;
    socket.to(roomId).emit('lang:change', { lang });
  });

  // CHAT MESSAGE
  socket.on('chat:message', ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room || !currentUser) return;
    const payload = {
      id: socket.id,
      name: currentUser.name,
      color: currentUser.color,
      text,
      ts: Date.now()
    };
    // Send to everyone in the room including sender
    io.to(roomId).emit('chat:message', payload);
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    if (!currentRoom || !currentUser) return;
    const room = rooms.get(currentRoom);
    if (room) {
      room.users.delete(socket.id);
      io.to(currentRoom).emit('user:left', { id: socket.id, name: currentUser.name });
      // Clean up empty rooms after 1 hour
      if (room.users.size === 0) {
        setTimeout(() => {
          const r = rooms.get(currentRoom);
          if (r && r.users.size === 0) {
            rooms.delete(currentRoom);
            console.log(`[${currentRoom}] Room cleaned up`);
          }
        }, 3600_000);
      }
      console.log(`[${currentRoom}] ${currentUser.name} left — ${room.users.size} online`);
    }
  });
});

// ─── START ───
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 CollabCode server running at http://localhost:${PORT}`);
  console.log(`   Share a room link to start collaborating!\n`);
});
