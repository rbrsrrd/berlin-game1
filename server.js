const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { AR_WORDS, EN_WORDS } = require('./words');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// Any /room/XXXXXX link serves the same app; the client reads the code from the URL.
app.get('/room/:code', (req, res) => {
 res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------------------------------------------------------
// In-memory room store. Fine for a self-hosted 2v2 party game;
// rooms are wiped if the server restarts.
// ---------------------------------------------------------------
const rooms = {}; // code -> room object

const SLOTS = ['red-spymaster', 'red-operative', 'blue-spymaster', 'blue-operative'];

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code;
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wordsFor(lang) {
  return lang === 'ar' ? AR_WORDS : EN_WORDS;
}

function newBoard(lang, startTeam) {
  const pool = wordsFor(lang);
  const words = shuffle(pool).slice(0, 25);
  const colors = [];
  for (let i = 0; i < (startTeam === 'red' ? 9 : 8); i++) colors.push('red');
  for (let i = 0; i < (startTeam === 'blue' ? 9 : 8); i++) colors.push('blue');
  for (let i = 0; i < 7; i++) colors.push('neutral');
  colors.push('assassin');
  const shuffledColors = shuffle(colors);
  return words.map((w, i) => ({ word: w, color: shuffledColors[i], revealed: false }));
}

function freshRoom(code, lang) {
  return {
    code,
    lang: lang || 'en',
    players: {}, // socketId -> { name, slot }
    phase: 'lobby', // lobby | playing | ended
    board: [],
    startTeam: 'red',
    currentTeam: 'red',
    clue: null, // { word, number }
    guessesLeft: 0,
    clueSubmitted: false,
    redRemaining: 9,
    blueRemaining: 8,
    log: [],
    winner: null,
    winReason: null,
  };
}

function roomPublicPlayers(room) {
  return Object.entries(room.players).map(([id, p]) => ({ id, name: p.name, slot: p.slot }));
}

function boardFor(room, slot) {
  const isSpymaster = slot === 'red-spymaster' || slot === 'blue-spymaster';
  return room.board.map((c) => ({
    word: c.word,
    revealed: c.revealed,
    color: (c.revealed || isSpymaster) ? c.color : null,
  }));
}

function stateFor(room, socketId) {
  const me = room.players[socketId];
  const slot = me ? me.slot : null;
  return {
    code: room.code,
    lang: room.lang,
    phase: room.phase,
    players: roomPublicPlayers(room),
    mySlot: slot,
    board: room.phase === 'lobby' ? [] : boardFor(room, slot),
    currentTeam: room.currentTeam,
    startTeam: room.startTeam,
    clue: room.clue,
    guessesLeft: room.guessesLeft === Infinity ? -1 : room.guessesLeft,
    clueSubmitted: room.clueSubmitted,
    redRemaining: room.redRemaining,
    blueRemaining: room.blueRemaining,
    log: room.log.slice(-40),
    winner: room.winner,
    winReason: room.winReason,
  };
}

function broadcast(room) {
  Object.keys(room.players).forEach((sid) => {
    io.to(sid).emit('state', stateFor(room, sid));
  });
}

function addLog(room, team, text) {
  room.log.push({ team, text, t: Date.now() });
}

function slotTeam(slot) {
  return slot.startsWith('red') ? 'red' : 'blue';
}
function slotRole(slot) {
  return slot.endsWith('spymaster') ? 'spymaster' : 'operative';
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ name, lang }) => {
    const code = makeCode();
    const room = freshRoom(code, lang);
    rooms[code] = room;
    room.players[socket.id] = { name: (name || 'Player').slice(0, 20), slot: null };
    socket.join(code);
    socket.data.room = code;
    broadcast(room);
  });

  socket.on('joinRoom', ({ code, name }) => {
    code = (code || '').toUpperCase().trim();
    const room = rooms[code];
    if (!room) return socket.emit('errorMsg', 'roomNotFound');
    if (Object.keys(room.players).length >= 4 && !room.players[socket.id]) {
      return socket.emit('errorMsg', 'roomFull');
    }
    room.players[socket.id] = room.players[socket.id] || { name: (name || 'Player').slice(0, 20), slot: null };
    socket.join(code);
    socket.data.room = code;
    broadcast(room);
  });

  socket.on('takeSlot', ({ slot }) => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'lobby') return;
    if (!SLOTS.includes(slot)) return;
    const taken = Object.values(room.players).some((p) => p.slot === slot);
    if (taken) return;
    if (room.players[socket.id]) room.players[socket.id].slot = slot;
    broadcast(room);
  });

  socket.on('leaveSlot', () => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'lobby') return;
    if (room.players[socket.id]) room.players[socket.id].slot = null;
    broadcast(room);
  });

  socket.on('startGame', () => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'lobby') return;
    const filledSlots = Object.values(room.players).map((p) => p.slot).filter(Boolean);
    const allFilled = SLOTS.every((s) => filledSlots.includes(s));
    if (!allFilled) return;

    room.startTeam = Math.random() < 0.5 ? 'red' : 'blue';
    room.currentTeam = room.startTeam;
    room.redRemaining = room.startTeam === 'red' ? 9 : 8;
    room.blueRemaining = room.startTeam === 'blue' ? 9 : 8;
    room.board = newBoard(room.lang, room.startTeam);
    room.clue = null;
    room.guessesLeft = 0;
    room.clueSubmitted = false;
    room.phase = 'playing';
    room.winner = null;
    room.winReason = null;
    room.log = [];
    addLog(room, 'sys', `game_started:${room.startTeam}`);
    broadcast(room);
  });

  socket.on('submitClue', ({ word, number }) => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'playing') return;
    const me = room.players[socket.id];
    if (!me || me.slot !== `${room.currentTeam}-spymaster`) return;
    if (room.clueSubmitted) return;
    word = (word || '').toString().trim().slice(0, 30);
    if (!word) return;
    const n = Math.max(0, Math.min(9, parseInt(number, 10) || 0));
    room.clue = { word, number: n };
    room.guessesLeft = n === 0 ? Infinity : n + 1;
    room.clueSubmitted = true;
    addLog(room, room.currentTeam, `clue:${word}:${n}`);
    broadcast(room);
  });

  socket.on('guessCell', ({ index }) => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'playing') return;
    const me = room.players[socket.id];
    if (!me || me.slot !== `${room.currentTeam}-operative`) return;
    if (!room.clueSubmitted || room.guessesLeft <= 0) return;
    const cell = room.board[index];
    if (!cell || cell.revealed) return;

    cell.revealed = true;

    if (cell.color === 'assassin') {
      addLog(room, room.currentTeam, `assassin:${cell.word}`);
      endGame(room, room.currentTeam === 'red' ? 'blue' : 'red', 'assassin');
      return broadcast(room);
    }

    if (cell.color === room.currentTeam) {
      if (room.currentTeam === 'red') room.redRemaining--; else room.blueRemaining--;
      addLog(room, room.currentTeam, `hit:${cell.word}`);
      room.guessesLeft = room.guessesLeft === Infinity ? Infinity : room.guessesLeft - 1;
      if ((room.currentTeam === 'red' && room.redRemaining <= 0) || (room.currentTeam === 'blue' && room.blueRemaining <= 0)) {
        endGame(room, room.currentTeam, 'complete');
        return broadcast(room);
      }
      if (room.guessesLeft <= 0) {
        addLog(room, 'sys', 'guesses_exhausted');
        switchTurn(room);
      }
    } else if (cell.color === 'neutral') {
      addLog(room, room.currentTeam, `neutral:${cell.word}`);
      switchTurn(room);
    } else {
      const opp = cell.color;
      if (opp === 'red') room.redRemaining--; else room.blueRemaining--;
      addLog(room, room.currentTeam, `wrong_team:${cell.word}`);
      if ((opp === 'red' && room.redRemaining <= 0) || (opp === 'blue' && room.blueRemaining <= 0)) {
        endGame(room, opp, 'complete');
        return broadcast(room);
      }
      switchTurn(room);
    }
    broadcast(room);
  });

  socket.on('endTurn', () => {
    const room = rooms[socket.data.room];
    if (!room || room.phase !== 'playing') return;
    const me = room.players[socket.id];
    if (!me || !me.slot || slotTeam(me.slot) !== room.currentTeam) return;
    if (!room.clueSubmitted) return;
    addLog(room, 'sys', 'turn_ended_voluntarily');
    switchTurn(room);
    broadcast(room);
  });

  socket.on('rematch', () => {
    const room = rooms[socket.data.room];
    if (!room) return;
    room.phase = 'lobby';
    room.board = [];
    room.winner = null;
    room.winReason = null;
    room.log = [];
    broadcast(room);
  });

  socket.on('setLang', ({ lang }) => {
    const room = rooms[socket.data.room];
    if (!room) return;
    room.lang = lang;
    broadcast(room);
  });

  socket.on('disconnect', () => {
    const code = socket.data.room;
    const room = rooms[code];
    if (!room) return;
    delete room.players[socket.id];
    if (Object.keys(room.players).length === 0) {
      delete rooms[code];
    } else {
      broadcast(room);
    }
  });
});

function switchTurn(room) {
  room.currentTeam = room.currentTeam === 'red' ? 'blue' : 'red';
  room.clue = null;
  room.clueSubmitted = false;
  room.guessesLeft = 0;
}

function endGame(room, winner, reason) {
  room.phase = 'ended';
  room.winner = winner;
  room.winReason = reason;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CODE BERLINZ running on port ${PORT}`));
