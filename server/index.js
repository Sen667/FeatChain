// Serveur Socket.IO standalone pour le mode multijoueur
// À déployer sur Railway, Render ou Fly.io

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Stockage des rooms en mémoire
const rooms = new Map();

// Génère un code de room aléatoire
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Vérifie si un feat existe via Spotify
async function checkFeatExists(artist1, artist2) {
  try {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('❌ Credentials Spotify manquants');
      return { exists: false };
    }

    // Get Spotify token
    const authString = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + authString,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Erreur lors de la récupération du token');
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // Search for collaboration
    const query = encodeURIComponent(`artist:${artist1} artist:${artist2}`);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

    const response = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const data = await response.json();

    if (data.tracks && data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      return { exists: true, trackId: track.id, trackName: track.name };
    }
    return { exists: false };
  } catch (error) {
    console.error("Erreur lors de la vérification du feat:", error);
    return { exists: false };
  }
}

// Route de santé
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FeatChain Socket.IO Server',
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('✅ Client connecté:', socket.id);

  // Créer une room
  socket.on('createRoom', ({ pseudo }) => {
    const roomCode = generateRoomCode();
    const player = {
      id: socket.id,
      pseudo: pseudo || "Joueur 1",
      score: 0,
      lives: 3
    };

    const gameState = {
      roomCode,
      players: [player],
      currentArtist: "Ninho",
      usedArtists: ["ninho"],
      history: ["Ninho"],
      currentPlayerIndex: 0,
      isGameStarted: false,
      timeLeft: 30,
      gameOver: false
    };

    rooms.set(roomCode, gameState);
    socket.join(roomCode);

    console.log(`🎮 Room créée: ${roomCode} par ${pseudo}`);

    socket.emit('roomCreated', { roomCode, gameState });
    socket.emit('gameState', gameState);
  });

  // Rejoindre une room
  socket.on('joinRoom', ({ roomCode, pseudo }) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) {
      socket.emit('error', { message: 'Room introuvable' });
      return;
    }

    if (gameState.isGameStarted) {
      socket.emit('error', { message: 'La partie a déjà commencé' });
      return;
    }

    const player = {
      id: socket.id,
      pseudo: pseudo || `Joueur ${gameState.players.length + 1}`,
      score: 0,
      lives: 3
    };

    gameState.players.push(player);
    socket.join(roomCode);

    console.log(`👤 ${pseudo} a rejoint la room ${roomCode}`);

    io.to(roomCode).emit('gameState', gameState);
    io.to(roomCode).emit('playerJoined', { player });
  });

  // Démarrer la partie
  socket.on('startGame', ({ roomCode }) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) {
      socket.emit('error', { message: 'Room introuvable' });
      return;
    }

    if (gameState.players.length < 2) {
      socket.emit('error', { message: 'Il faut au moins 2 joueurs pour commencer' });
      return;
    }

    gameState.isGameStarted = true;
    gameState.timeLeft = 30;

    console.log(`🚀 Partie démarrée dans la room ${roomCode}`);

    io.to(roomCode).emit('gameState', gameState);
    io.to(roomCode).emit('gameStarted', gameState); // Envoyer gameState avec l'événement
    io.to(roomCode).emit('timerStart', { timeLeft: 30 });
  });

  // Valider une réponse
  socket.on('validateAnswer', async ({ roomCode, guess }) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) {
      socket.emit('error', { message: 'Room introuvable' });
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.id !== socket.id) {
      socket.emit('error', { message: "Ce n'est pas votre tour" });
      return;
    }

    console.log(`🎯 Validation: ${gameState.currentArtist} → ${guess}`);

    // Vérifier si l'artiste a déjà été utilisé
    const guessLower = guess.toLowerCase().trim();
    if (gameState.usedArtists.includes(guessLower)) {
      currentPlayer.lives--;
      
      io.to(roomCode).emit('answerResult', {
        isCorrect: false,
        message: `❌ ${guess} a déjà été utilisé !`,
        lives: currentPlayer.lives
      });

      if (currentPlayer.lives <= 0) {
        gameState.gameOver = true;
        io.to(roomCode).emit('gameState', gameState);
        io.to(roomCode).emit('gameOver', {
          winner: gameState.players.find(p => p.id !== currentPlayer.id),
          loser: currentPlayer
        });
        return;
      }

      // Passer au joueur suivant
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });
      return;
    }

    // Vérifier le feat via Spotify
    const result = await checkFeatExists(gameState.currentArtist, guess);

    if (result.exists) {
      // Bonne réponse
      currentPlayer.score++;
      gameState.currentArtist = guess;
      gameState.usedArtists.push(guessLower);
      gameState.history.push(guess);

      io.to(roomCode).emit('answerResult', {
        isCorrect: true,
        message: `✅ Correct ! "${result.trackName}"`,
        trackId: result.trackId,
        trackName: result.trackName,
        newArtist: guess,
        score: currentPlayer.score
      });

      // Passer au joueur suivant
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      gameState.timeLeft = 30;
      
      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });

    } else {
      // Mauvaise réponse
      currentPlayer.lives--;

      io.to(roomCode).emit('answerResult', {
        isCorrect: false,
        message: `❌ Aucun feat entre ${gameState.currentArtist} et ${guess}`,
        lives: currentPlayer.lives
      });

      if (currentPlayer.lives <= 0) {
        gameState.gameOver = true;
        io.to(roomCode).emit('gameState', gameState);
        io.to(roomCode).emit('gameOver', {
          winner: gameState.players.find(p => p.id !== currentPlayer.id),
          loser: currentPlayer
        });
        return;
      }

      // Passer au joueur suivant
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });
    }
  });

  // Timer expiré
  socket.on('timeOut', ({ roomCode }) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.id !== socket.id) return;

    currentPlayer.lives--;

    io.to(roomCode).emit('answerResult', {
      isCorrect: false,
      message: '⏰ Temps écoulé !',
      lives: currentPlayer.lives
    });

    if (currentPlayer.lives <= 0) {
      gameState.gameOver = true;
      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('gameOver', {
        winner: gameState.players.find(p => p.id !== currentPlayer.id),
        loser: currentPlayer
      });
      return;
    }

    // Passer au joueur suivant
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    io.to(roomCode).emit('gameState', gameState);
    io.to(roomCode).emit('timerStart', { timeLeft: 30 });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté:', socket.id);

    // Trouver et nettoyer les rooms
    for (const [roomCode, gameState] of rooms.entries()) {
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        const player = gameState.players[playerIndex];
        gameState.players.splice(playerIndex, 1);

        console.log(`👋 ${player.pseudo} a quitté la room ${roomCode}`);

        if (gameState.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`🗑️ Room ${roomCode} supprimée (vide)`);
        } else {
          io.to(roomCode).emit('playerLeft', { player });
          io.to(roomCode).emit('gameState', gameState);

          // Si c'était le tour du joueur qui part
          if (gameState.currentPlayerIndex >= gameState.players.length) {
            gameState.currentPlayerIndex = 0;
            io.to(roomCode).emit('gameState', gameState);
            io.to(roomCode).emit('timerStart', { timeLeft: 30 });
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
  console.log(`📡 CORS autorisé pour: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
});
