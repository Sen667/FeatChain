const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');
const { getRandomRapper } = require('./data/french-rappers');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://featchain.vercel.app',
  /https:\/\/featchain-.*\.vercel\.app$/,
  /https:\/\/.*-mathishagnere230-gmailcoms-projects\.vercel\.app$/
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Configuration Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Variables d'environnement
const PORT = process.env.PORT || 3001;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Stockage des rooms en mémoire
const rooms = new Map();

// Token Spotify (cache)
let spotifyToken = null;
let tokenExpiry = 0;

// ============ FONCTIONS UTILITAIRES ============

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  spotifyToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  return spotifyToken;
}

async function checkFeatExists(artist1, artist2) {
  try {
    console.log(`🎵 Recherche Spotify: "${artist1}" x "${artist2}"`);
    const token = await getSpotifyToken();
    console.log(`🔑 Token Spotify obtenu: ${token ? 'OK' : 'ERREUR'}`);
    
    const searchQuery = `artist:${artist1} artist:${artist2}`;
    console.log(`🔍 Query Spotify: ${searchQuery}`);
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await response.json();
    console.log(`📊 Résultats Spotify: ${data.tracks?.items?.length || 0} tracks trouvés`);
    
    if (data.tracks && data.tracks.items.length > 0) {
      for (const track of data.tracks.items) {
        const artistNames = track.artists.map(a => a.name.toLowerCase());
        console.log(`🎤 Track "${track.name}" avec: ${artistNames.join(', ')}`);
        
        const hasArtist1 = artistNames.some(name => name.includes(artist1.toLowerCase()));
        const hasArtist2 = artistNames.some(name => name.includes(artist2.toLowerCase()));
        
        console.log(`   - Contient "${artist1}": ${hasArtist1}`);
        console.log(`   - Contient "${artist2}": ${hasArtist2}`);
        
        if (hasArtist1 && hasArtist2) {
          console.log(`✅ FEAT TROUVÉ: ${track.name}`);
          return {
            exists: true,
            trackName: track.name,
            trackId: track.id,
            artists: track.artists.map(a => a.name)
          };
        }
      }
    }
    
    console.log(`❌ Aucun feat trouvé entre ${artist1} et ${artist2}`);
    return { exists: false };
  } catch (error) {
    console.error('❌ Erreur Spotify API:', error);
    return { exists: false, error: error.message };
  }
}

// ============ HEALTH CHECK ============

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// ============ SOCKET.IO EVENTS ============

io.on('connection', (socket) => {
  console.log('✅ Client connecté:', socket.id);

  // Créer une room
  socket.on('createRoom', ({ pseudo }, callback) => {
    const roomCode = generateRoomCode();
    const startingRapper = getRandomRapper();
    
    const gameState = {
      roomCode: roomCode,  // Utiliser roomCode au lieu de code
      players: [{
        id: socket.id,
        pseudo: pseudo || 'Joueur 1',
        lives: 3,
        isActive: true,  // Ajouter isActive pour compatibilité
        score: 0
      }],
      currentArtist: startingRapper,
      usedArtists: [startingRapper.toLowerCase()],
      history: `Chaîne actuelle : ${startingRapper}`,  // Format attendu par le client
      currentPlayerIndex: 0,
      gameStarted: false,
      gameOver: false
    };

    rooms.set(roomCode, gameState);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    console.log(`🎮 Room créée: ${roomCode} by ${pseudo}`);

    callback({ success: true, roomCode });
    socket.emit('gameState', gameState);
  });

  // Rejoindre une room
  socket.on('joinRoom', ({ roomCode, pseudo }, callback) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) {
      callback({ success: false, error: 'Room introuvable' });
      return;
    }

    // Vérifier si le pseudo existe déjà (reconnexion)
    const existingPlayer = gameState.players.find(p => p.pseudo === pseudo);

    if (existingPlayer) {
      // Reconnexion
      existingPlayer.id = socket.id;
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      
      console.log(`🔄 ${pseudo} reconnecté à ${roomCode}`);
      
      callback({ success: true, gameState });
      socket.emit('gameState', gameState);
      
      if (gameState.gameStarted) {
        socket.emit('gameStarted', gameState);
      }
      return;
    }

    if (gameState.gameStarted) {
      callback({ success: false, error: 'La partie a déjà commencé' });
      return;
    }

    // Nouveau joueur
    const player = {
      id: socket.id,
      pseudo: pseudo || `Joueur ${gameState.players.length + 1}`,
      lives: 3,
      isActive: true,
      score: 0
    };

    gameState.players.push(player);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    console.log(`👤 ${pseudo} a rejoint ${roomCode}`);

    callback({ success: true, gameState });
    io.to(roomCode).emit('gameState', gameState);
    io.to(roomCode).emit('playerJoined', { player });
  });

  // Démarrer la partie
  socket.on('startGame', (roomCode) => {
    const gameState = rooms.get(roomCode);

    if (!gameState) {
      socket.emit('error', { message: 'Room introuvable' });
      return;
    }

    if (gameState.players.length < 2) {
      socket.emit('error', { message: 'Il faut au moins 2 joueurs' });
      return;
    }

    gameState.gameStarted = true;
    gameState.timeLeft = 30;

    console.log(`🚀 Partie démarrée dans ${roomCode}`);

    io.to(roomCode).emit('gameStarted', gameState);
    io.to(roomCode).emit('timerStart', { timeLeft: 30 });
    
    // Informer tous les joueurs du tour actuel
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    io.to(roomCode).emit('turnChanged', {
      currentPlayerId: currentPlayer.id,
      currentPlayerPseudo: currentPlayer.pseudo
    });
  });

  // Valider une réponse
  socket.on('validateArtist', async ({ roomCode, playerId, artistGuess }) => {
    console.log(`🎯 validateArtist reçu: ${artistGuess} de ${playerId} dans ${roomCode}`);
    
    const gameState = rooms.get(roomCode);

    if (!gameState || !gameState.gameStarted) {
      console.log('❌ Partie introuvable ou non démarrée');
      socket.emit('error', { message: 'Partie introuvable ou non démarrée' });
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.id !== socket.id) {
      console.log(`❌ Mauvais tour: ${socket.id} vs ${currentPlayer.id}`);
      socket.emit('error', { message: 'Ce n\'est pas votre tour' });
      return;
    }

    const guessClean = artistGuess.trim().toLowerCase();
    const currentArtistClean = gameState.currentArtist.toLowerCase();

    // Vérifier si l'artiste a déjà été utilisé
    if (gameState.usedArtists.includes(guessClean)) {
      currentPlayer.lives -= 1;
      
      io.to(roomCode).emit('validationError', {
        message: `❌ ${artistGuess} a déjà été utilisé !`,
        livesLost: true,
        remainingLives: currentPlayer.lives,
        playerId: socket.id
      });

      if (currentPlayer.lives <= 0) {
        gameState.players.splice(gameState.currentPlayerIndex, 1);
        io.to(roomCode).emit('playerEliminated', {
          playerId: socket.id,
          playerPseudo: currentPlayer.pseudo
        });

        if (gameState.players.length === 1) {
          gameState.gameOver = true;
          io.to(roomCode).emit('gameEnded', { winner: gameState.players[0] });
          return;
        }

        if (gameState.currentPlayerIndex >= gameState.players.length) {
          gameState.currentPlayerIndex = 0;
        }
      } else {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      }

      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('turnChanged', {
        currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
        currentPlayerPseudo: gameState.players[gameState.currentPlayerIndex].pseudo
      });
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });
      return;
    }

    // Vérifier le feat avec Spotify
    console.log(`🔍 Vérification du feat entre "${currentArtistClean}" et "${guessClean}"`);
    const featResult = await checkFeatExists(currentArtistClean, guessClean);
    console.log(`🎵 Résultat Spotify:`, featResult);

    if (featResult.exists) {
      // Bonne réponse
      console.log(`✅ Feat trouvé! ${featResult.trackName}`);
      gameState.currentArtist = artistGuess;
      gameState.usedArtists.push(guessClean);
      gameState.history += ` → ${artistGuess}`;
      currentPlayer.score += 1;

      // Passer au joueur suivant
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

      io.to(roomCode).emit('artistValidated', {
        newArtist: artistGuess,
        trackName: featResult.trackName,
        trackId: featResult.trackId,
        history: gameState.history,
        nextPlayerId: gameState.players[gameState.currentPlayerIndex].id
      });

      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('turnChanged', {
        currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
        currentPlayerPseudo: gameState.players[gameState.currentPlayerIndex].pseudo
      });
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });

    } else {
      // Mauvaise réponse
      console.log(`❌ Aucun feat trouvé entre ${gameState.currentArtist} et ${artistGuess}`);
      currentPlayer.lives -= 1;
      
      io.to(roomCode).emit('validationError', {
        message: `❌ Aucun feat trouvé entre ${gameState.currentArtist} et ${artistGuess}`,
        livesLost: true,
        remainingLives: currentPlayer.lives,
        playerId: socket.id
      });

      if (currentPlayer.lives <= 0) {
        gameState.players.splice(gameState.currentPlayerIndex, 1);
        io.to(roomCode).emit('playerEliminated', {
          playerId: socket.id,
          playerPseudo: currentPlayer.pseudo
        });

        if (gameState.players.length === 1) {
          gameState.gameOver = true;
          io.to(roomCode).emit('gameEnded', { winner: gameState.players[0] });
          return;
        }

        if (gameState.currentPlayerIndex >= gameState.players.length) {
          gameState.currentPlayerIndex = 0;
        }
      } else {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      }

      io.to(roomCode).emit('gameState', gameState);
      io.to(roomCode).emit('turnChanged', {
        currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
        currentPlayerPseudo: gameState.players[gameState.currentPlayerIndex].pseudo
      });
      io.to(roomCode).emit('timerStart', { timeLeft: 30 });
    }
  });

  // Temps écoulé
  socket.on('timeOut', ({ roomCode }) => {
    const gameState = rooms.get(roomCode);

    if (!gameState || !gameState.gameStarted) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    if (currentPlayer.id !== socket.id) return;

    currentPlayer.lives -= 1;

    io.to(roomCode).emit('validationError', {
      message: '⏱️ Temps écoulé !',
      livesLost: true,
      remainingLives: currentPlayer.lives,
      playerId: socket.id
    });

    if (currentPlayer.lives <= 0) {
      gameState.players.splice(gameState.currentPlayerIndex, 1);
      io.to(roomCode).emit('playerEliminated', {
        playerId: socket.id,
        playerPseudo: currentPlayer.pseudo
      });

      if (gameState.players.length === 1) {
        gameState.gameOver = true;
        io.to(roomCode).emit('gameEnded', { winner: gameState.players[0] });
        return;
      }

      if (gameState.currentPlayerIndex >= gameState.players.length) {
        gameState.currentPlayerIndex = 0;
      }
    } else {
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }

    io.to(roomCode).emit('gameState', gameState);
    io.to(roomCode).emit('turnChanged', {
      currentPlayerId: gameState.players[gameState.currentPlayerIndex].id,
      currentPlayerPseudo: gameState.players[gameState.currentPlayerIndex].pseudo
    });
    io.to(roomCode).emit('timerStart', { timeLeft: 30 });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté:', socket.id);
    
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      const gameState = rooms.get(roomCode);
      if (gameState && !gameState.gameStarted) {
        // Retirer le joueur si la partie n'a pas commencé
        gameState.players = gameState.players.filter(p => p.id !== socket.id);
        
        if (gameState.players.length === 0) {
          rooms.delete(roomCode);
          console.log(`🗑️ Room ${roomCode} supprimée (vide)`);
        } else {
          io.to(roomCode).emit('gameState', gameState);
          io.to(roomCode).emit('playerLeft', { playerId: socket.id });
        }
      }
    }
  });
});

// Démarrer le serveur
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
  console.log(`📡 CORS autorisé pour: ${allowedOrigins[0]}`);
});
