import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents, GameState, Player } from "@/types/game";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: ServerIO<ClientToServerEvents, ServerToClientEvents>;
    };
  };
};

// Stockage des rooms en mémoire
const rooms = new Map<string, GameState>();

// Génère un code de room aléatoire
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Vérifie si un feat existe via Spotify
async function checkFeatExists(artist1: string, artist2: string): Promise<{ exists: boolean; trackId?: string; trackName?: string }> {
  try {
    const tokenReq = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/token`);
    if (!tokenReq.ok) throw new Error("Erreur serveur local");
    const tokenData = await tokenReq.json();
    const token = tokenData.token;

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

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log("Socket.IO déjà initialisé");
    res.end();
    return;
  }

  console.log("Initialisation de Socket.IO");
  const io = new ServerIO<ClientToServerEvents, ServerToClientEvents>(res.socket.server as any, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("Nouveau client connecté:", socket.id);

    // Créer une room
    socket.on("createRoom", (data, callback) => {
      const roomCode = generateRoomCode();
      const player: Player = {
        id: socket.id,
        pseudo: data.pseudo,
        lives: 3,
        isActive: true,
      };

      const gameState: GameState = {
        roomCode,
        currentArtist: "Ninho",
        usedArtists: ["ninho"],
        history: "Chaîne actuelle : Ninho",
        players: [player],
        currentPlayerIndex: 0,
        gameStarted: false,
        gameOver: false,
      };

      rooms.set(roomCode, gameState);
      socket.join(roomCode);

      console.log(`Room créée: ${roomCode} par ${data.pseudo}`);
      callback({ success: true, roomCode });
      socket.emit("roomCreated", { roomCode });
    });

    // Rejoindre une room
    socket.on("joinRoom", (data, callback) => {
      const gameState = rooms.get(data.roomCode);

      if (!gameState) {
        callback({ success: false, error: "Room introuvable" });
        return;
      }

      if (gameState.gameStarted) {
        callback({ success: false, error: "La partie a déjà commencé" });
        return;
      }

      const player: Player = {
        id: socket.id,
        pseudo: data.pseudo,
        lives: 3,
        isActive: true,
      };

      gameState.players.push(player);
      socket.join(data.roomCode);

      console.log(`${data.pseudo} a rejoint la room ${data.roomCode}`);
      callback({ success: true, gameState });
      
      // Notifier tous les joueurs
      io.to(data.roomCode).emit("playerJoined", { 
        player, 
        players: gameState.players 
      });
    });

    // Démarrer la partie
    socket.on("startGame", (roomCode) => {
      const gameState = rooms.get(roomCode);
      if (!gameState) return;

      gameState.gameStarted = true;
      gameState.currentPlayerIndex = 0;

      console.log(`Partie démarrée dans la room ${roomCode}`);
      io.to(roomCode).emit("gameStarted", gameState);
      io.to(roomCode).emit("turnChanged", {
        currentPlayerId: gameState.players[0].id,
        currentPlayerPseudo: gameState.players[0].pseudo,
      });
    });

    // Valider un artiste
    socket.on("validateArtist", async (data) => {
      const gameState = rooms.get(data.roomCode);
      if (!gameState || !gameState.gameStarted || gameState.gameOver) return;

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer.id !== data.playerId) {
        socket.emit("error", { message: "Ce n'est pas votre tour !" });
        return;
      }

      const cleanGuess = data.artistGuess.trim().toLowerCase();
      const cleanCurrent = gameState.currentArtist.toLowerCase();

      // Vérifications
      if (cleanGuess === cleanCurrent) {
        socket.emit("validationError", { 
          message: "⚠️ Il ne peut pas feat avec lui-même !",
          livesLost: false
        });
        return;
      }

      if (gameState.usedArtists.includes(cleanGuess)) {
        socket.emit("validationError", { 
          message: `⚠️ Déjà cité ! "${data.artistGuess}" est déjà sorti.`,
          livesLost: false
        });
        return;
      }

      // Vérifier si le feat existe
      const result = await checkFeatExists(gameState.currentArtist, data.artistGuess);

      if (result.exists && result.trackId && result.trackName) {
        // SUCCÈS
        const capitalizedGuess = data.artistGuess.charAt(0).toUpperCase() + data.artistGuess.slice(1);
        gameState.currentArtist = capitalizedGuess;
        gameState.usedArtists.push(cleanGuess);
        gameState.history += ` > ${capitalizedGuess}`;

        // Passer au joueur suivant
        let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        
        // Trouver le prochain joueur actif
        let attempts = 0;
        while (!gameState.players[nextPlayerIndex].isActive && attempts < gameState.players.length) {
          nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
          attempts++;
        }
        
        gameState.currentPlayerIndex = nextPlayerIndex;

        // Notifier tous les joueurs
        io.to(data.roomCode).emit("artistValidated", {
          newArtist: capitalizedGuess,
          trackName: result.trackName,
          trackId: result.trackId,
          history: gameState.history,
          nextPlayerId: gameState.players[nextPlayerIndex].id,
        });

        io.to(data.roomCode).emit("turnChanged", {
          currentPlayerId: gameState.players[nextPlayerIndex].id,
          currentPlayerPseudo: gameState.players[nextPlayerIndex].pseudo,
        });

        io.to(data.roomCode).emit("gameStateUpdate", gameState);

      } else {
        // ÉCHEC - Perte d'une vie
        currentPlayer.lives -= 1;
        const remainingLives = currentPlayer.lives;

        if (remainingLives <= 0) {
          // Joueur éliminé
          currentPlayer.isActive = false;
          io.to(data.roomCode).emit("playerEliminated", {
            playerId: currentPlayer.id,
            playerPseudo: currentPlayer.pseudo,
          });

          socket.emit("validationError", {
            message: `💀 Aucun feat trouvé. Vous êtes éliminé !`,
            livesLost: true,
            remainingLives: 0,
            gameOver: true,
          });

          // Vérifier s'il reste un seul joueur actif
          const activePlayers = gameState.players.filter(p => p.isActive);
          if (activePlayers.length === 1) {
            gameState.gameOver = true;
            gameState.winner = activePlayers[0].pseudo;
            io.to(data.roomCode).emit("gameEnded", { winner: activePlayers[0] });
          } else {
            // Passer au joueur suivant
            let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
            let attempts = 0;
            while (!gameState.players[nextPlayerIndex].isActive && attempts < gameState.players.length) {
              nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
              attempts++;
            }
            gameState.currentPlayerIndex = nextPlayerIndex;

            io.to(data.roomCode).emit("turnChanged", {
              currentPlayerId: gameState.players[nextPlayerIndex].id,
              currentPlayerPseudo: gameState.players[nextPlayerIndex].pseudo,
            });
          }
        } else {
          // Encore des vies
          socket.emit("validationError", {
            message: `❌ Aucun feat trouvé entre ${gameState.currentArtist} et ${data.artistGuess}.`,
            livesLost: true,
            remainingLives,
          });

          // Passer au joueur suivant
          let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
          let attempts = 0;
          while (!gameState.players[nextPlayerIndex].isActive && attempts < gameState.players.length) {
            nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
            attempts++;
          }
          gameState.currentPlayerIndex = nextPlayerIndex;

          io.to(data.roomCode).emit("turnChanged", {
            currentPlayerId: gameState.players[nextPlayerIndex].id,
            currentPlayerPseudo: gameState.players[nextPlayerIndex].pseudo,
          });
        }

        io.to(data.roomCode).emit("gameStateUpdate", gameState);
      }
    });

    // Quitter une room
    socket.on("leaveRoom", (data) => {
      const gameState = rooms.get(data.roomCode);
      if (!gameState) return;

      gameState.players = gameState.players.filter(p => p.id !== data.playerId);
      socket.leave(data.roomCode);

      if (gameState.players.length === 0) {
        rooms.delete(data.roomCode);
        console.log(`Room ${data.roomCode} supprimée (vide)`);
      } else {
        io.to(data.roomCode).emit("playerLeft", {
          playerId: data.playerId,
          players: gameState.players,
        });
      }
    });

    // Déconnexion
    socket.on("disconnect", () => {
      console.log("Client déconnecté:", socket.id);
      
      // Retirer le joueur de toutes les rooms
      rooms.forEach((gameState, roomCode) => {
        const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          gameState.players.splice(playerIndex, 1);
          
          if (gameState.players.length === 0) {
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} supprimée (vide)`);
          } else {
            io.to(roomCode).emit("playerLeft", {
              playerId: socket.id,
              players: gameState.players,
            });
          }
        }
      });
    });
  });

  console.log("Socket.IO configuré");
  res.end();
}
