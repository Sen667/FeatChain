"use client";

import { useState, useRef, KeyboardEvent, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import type { GameState, Player, ServerToClientEvents, ClientToServerEvents } from "@/types/game";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function GamePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Paramètres URL
  const mode = searchParams?.get('mode'); // 'solo' ou null (multijoueur par défaut)
  const action = searchParams?.get('action'); // 'create' ou 'join'
  const pseudo = searchParams?.get('pseudo');
  const roomCodeParam = searchParams?.get('room');

  // États du jeu solo
  const [currentArtist, setCurrentArtist] = useState("Ninho");
  const [usedArtists, setUsedArtists] = useState<string[]>(["ninho"]);
  const [guess, setGuess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusClass, setStatusClass] = useState("");
  const [playerEmbed, setPlayerEmbed] = useState("");
  const [history, setHistory] = useState("Chaîne actuelle : Ninho");
  const [isAnimating, setIsAnimating] = useState(false);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // États du jeu multijoueur
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const guessInputRef = useRef<HTMLInputElement>(null);

  // Initialisation Socket.IO pour le multijoueur
  useEffect(() => {
    if (mode === 'solo') {
      setIsMultiplayer(false);
      // Démarrer le timer en mode solo
      startTimer();
      return;
    }

    if (!action || !pseudo) {
      router.push('/lobby');
      return;
    }

    setIsMultiplayer(true);
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      stopTimer();
    };
  }, [mode, action, pseudo, roomCodeParam, router]);

  const initializeSocket = async () => {
    // Utiliser une URL de serveur Socket.IO séparé en production
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    console.log('🔌 Connexion au serveur Socket.IO:', socketUrl);
    
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      setMyPlayerId(socket!.id || "");

      if (action === 'create') {
        socket!.emit('createRoom', { pseudo: pseudo! }, (response) => {
          if (response.success && response.roomCode) {
            // Créer un gameState initial
            const initialGameState: GameState = {
              roomCode: response.roomCode,
              currentArtist: "Ninho",
              usedArtists: ["ninho"],
              history: "Chaîne actuelle : Ninho",
              players: [{
                id: socket!.id || "",
                pseudo: pseudo!,
                lives: 3,
                isActive: true,
              }],
              currentPlayerIndex: 0,
              gameStarted: false,
              gameOver: false,
            };
            setGameState(initialGameState);
            setWaitingForPlayers(true);
            setStatusMessage(`Room créée ! Code : ${response.roomCode}`);
          } else {
            setConnectionError(response.error || "Erreur lors de la création");
          }
        });
      } else if (action === 'join' && roomCodeParam) {
        socket!.emit('joinRoom', { roomCode: roomCodeParam, pseudo: pseudo! }, (response) => {
          if (response.success && response.gameState) {
            setGameState(response.gameState);
            setWaitingForPlayers(true);
            setStatusMessage(`Vous avez rejoint la room ${roomCodeParam}`);
          } else {
            setConnectionError(response.error || "Erreur lors de la connexion");
          }
        });
      }
    });

    // Événements Socket.IO
    socket.on('roomCreated', (data) => {
      setStatusMessage(`Room créée ! Partagez ce code : ${data.roomCode}`);
    });

    socket.on('playerJoined', (data) => {
      setGameState(prevState => {
        if (!prevState) return prevState;
        return { ...prevState, players: data.players };
      });
      setStatusMessage(`${data.player.pseudo} a rejoint la partie !`);
    });

    socket.on('playerLeft', (data) => {
      setGameState(prevState => {
        if (!prevState) return prevState;
        return { ...prevState, players: data.players };
      });
    });

    socket.on('gameStarted', (newGameState) => {
      setGameState(newGameState);
      setWaitingForPlayers(false);
      setStatusMessage("La partie commence !");
      // Démarrer le timer pour le premier joueur
      if (newGameState.players[0].id === socket!.id) {
        startTimer();
      }
    });

    socket.on('turnChanged', (data) => {
      const myTurn = data.currentPlayerId === socket!.id;
      setIsMyTurn(myTurn);
      setStatusMessage(`C'est au tour de ${data.currentPlayerPseudo}`);
      setStatusClass("");
      
      // Gérer le timer
      if (myTurn) {
        resetTimer();
        startTimer();
      } else {
        stopTimer();
      }
    });

    socket.on('artistValidated', (data) => {
      setPlayerEmbed(`
        <iframe style="border-radius:12px" 
        src="https://open.spotify.com/embed/track/${data.trackId}?utm_source=generator&autoplay=1" 
        width="100%" height="152" frameBorder="0" 
        allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
        </iframe>
      `);
      setStatusMessage(`✅ Validé : "${data.trackName}"`);
      setStatusClass("success");
      setGuess("");
      
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    });

    socket.on('validationError', (data) => {
      setStatusMessage(data.message);
      setStatusClass("error");
      if (data.gameOver) {
        setGameOver(true);
      }
    });

    socket.on('playerEliminated', (data) => {
      setStatusMessage(`💀 ${data.playerPseudo} a été éliminé !`);
    });

    socket.on('gameEnded', (data) => {
      setGameOver(true);
      setStatusMessage(`🏆 ${data.winner.pseudo} a gagné !`);
      setStatusClass("success");
    });

    socket.on('gameStateUpdate', (newGameState) => {
      setGameState(newGameState);
    });

    socket.on('error', (data) => {
      setStatusMessage(data.message);
      setStatusClass("error");
    });
  };

  const startMultiplayerGame = () => {
    if (socket && gameState) {
      socket.emit('startGame', gameState.roomCode);
    }
  };

  const validateMultiplayer = () => {
    if (!socket || !gameState || !isMyTurn || !guess.trim()) return;
    
    socket.emit('validateArtist', {
      roomCode: gameState.roomCode,
      playerId: myPlayerId,
      artistGuess: guess.trim(),
    });
  };

  const copyRoomCode = () => {
    if (gameState) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const copyRoomLink = () => {
    if (gameState) {
      const link = `${window.location.origin}/lobby?room=${gameState.roomCode}`;
      navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Gestion du timer
  const startTimer = () => {
    setTimeLeft(30);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(30);
  };

  // Effect pour le compte à rebours
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTimer();
            // Temps écoulé
            if (isMultiplayer && isMyTurn) {
              handleTimeOut();
            } else if (!isMultiplayer) {
              handleTimeOutSolo();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeLeft, isMultiplayer, isMyTurn]);

  // Temps écoulé en mode multijoueur
  const handleTimeOut = () => {
    if (socket && gameState) {
      setStatusMessage("⏰ Temps écoulé ! Vous perdez une vie.");
      setStatusClass("error");
      // Envoyer une validation avec une chaîne vide pour déclencher une erreur
      socket.emit('validateArtist', {
        roomCode: gameState.roomCode,
        playerId: myPlayerId,
        artistGuess: "_timeout_" + Date.now(), // Valeur impossible pour forcer l'erreur
      });
    }
  };

  // Temps écoulé en mode solo
  const handleTimeOutSolo = () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setStatusMessage(`⏰ Temps écoulé ! Game Over !`);
      setStatusClass("error");
      setGameOver(true);
      stopTimer();
    } else {
      setStatusMessage(`⏰ Temps écoulé ! Vies restantes : ${newLives}`);
      setStatusClass("error");
      // Réinitialiser le timer pour une nouvelle tentative
      resetTimer();
      startTimer();
    }
  };

  const checkFeat = async () => {
    if (gameOver) return;

    const guessValue = guess.trim();

    if (!guessValue) return;

    // En mode solo, ne pas arrêter le timer pendant la validation
    // Le timer continue de tourner

    const cleanGuess = guessValue.toLowerCase();
    const cleanCurrent = currentArtist.toLowerCase();

    // Règle 1 : L'artiste ne peut pas feat avec lui-même
    if (cleanGuess === cleanCurrent) {
      setStatusMessage("⚠️ Il ne peut pas feat avec lui-même !");
      setStatusClass("warning");
      setPlayerEmbed("");
      return;
    }

    // Règle 2 : L'artiste ne doit pas avoir déjà été cité
    if (usedArtists.includes(cleanGuess)) {
      setStatusMessage(`⚠️ Déjà cité ! "${guessValue}" est déjà sorti.`);
      setStatusClass("warning");
      setPlayerEmbed("");
      return;
    }

    // Recherche en cours
    setStatusMessage("Recherche en cours...");
    setStatusClass("");
    setPlayerEmbed("");

    try {
      const tokenReq = await fetch('/api/token');
      if (!tokenReq.ok) throw new Error("Erreur serveur local");
      const tokenData = await tokenReq.json();
      const token = tokenData.token;

      const query = encodeURIComponent(`artist:${currentArtist} artist:${guessValue}`);
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      const data = await response.json();

      if (data.tracks && data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        const trackId = track.id;

        // VICTOIRE
        setStatusMessage(`✅ Validé : "${track.name}"`);
        setStatusClass("success");

        // Ajouter le nouvel artiste à la liste
        setUsedArtists(prev => [...prev, cleanGuess]);
        
        // Mise à jour de l'artiste actuel
        const newArtist = capitalizeFirstLetter(guessValue);
        setCurrentArtist(newArtist);
        setGuess("");
        
        // Mise à jour de l'historique
        setHistory(prev => prev + " > " + newArtist);

        // Lecteur Spotify avec Autoplay
        setPlayerEmbed(`
          <iframe style="border-radius:12px" 
          src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&autoplay=1" 
          width="100%" height="152" frameBorder="0" 
          allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
          </iframe>
        `);

        // Animation
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);

        // Redémarrer le timer pour le prochain tour
        resetTimer();
        startTimer();

      } else {
        // ERREUR - Perte d'une vie
        const newLives = lives - 1;
        setLives(newLives);
        
        if (newLives <= 0) {
          setStatusMessage(`💀 Game Over ! Aucun feat trouvé entre ${currentArtist} et ${guessValue}. Vous avez perdu toutes vos vies !`);
          setStatusClass("error");
          setGameOver(true);
          stopTimer();
        } else {
          setStatusMessage(`❌ Aucun feat trouvé entre ${currentArtist} et ${guessValue}. Vies restantes : ${newLives}`);
          setStatusClass("error");
          // Ne PAS redémarrer le timer - le joueur garde le temps restant
        }
      }

    } catch (error) {
      console.error(error);
      setStatusMessage("Erreur technique");
      setStatusClass("error");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (isMultiplayer) {
        validateMultiplayer();
      } else {
        checkFeat();
      }
    }
  };

  const restartGame = () => {
    setCurrentArtist("Ninho");
    setUsedArtists(["ninho"]);
    setGuess("");
    setStatusMessage("");
    setStatusClass("");
    setPlayerEmbed("");
    setHistory("Chaîne actuelle : Ninho");
    setIsAnimating(false);
    setLives(3);
    setGameOver(false);
    // Redémarrer le timer
    resetTimer();
    startTimer();
  };

  // Affichage conditionnel : Solo ou Multijoueur
  if (connectionError) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">❌ Erreur de connexion</h2>
          <p className="mb-4">{connectionError}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Retour au lobby
          </button>
        </div>
      </main>
    );
  }

  // Salle d'attente multijoueur
  if (isMultiplayer && waitingForPlayers) {
    const isCreator = gameState?.players[0]?.id === myPlayerId;
    
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6 px-4">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/logo.svg"
              alt="FeatChain Logo"
              width={600}
              height={600}
              className="opacity-20"
            />
          </div>

          <div className="relative z-20 max-w-2xl w-full bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl">
            <h1 className="text-4xl font-bold text-center mb-6">
              Salle d&apos;attente
            </h1>

            {gameState && (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-300 mb-1">Code de la room :</p>
                <p className="text-3xl font-bold tracking-wider">{gameState.roomCode}</p>
                <p className="text-sm text-gray-400 mt-2">Partagez ce code avec vos amis !</p>
                
                {/* Boutons de copie */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={copyRoomCode}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-semibold"
                  >
                    {copySuccess ? "✓ Copié !" : "📋 Copier le code"}
                  </button>
                  <button
                    onClick={copyRoomLink}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition text-sm font-semibold"
                  >
                    {copySuccess ? "✓ Copié !" : "🔗 Copier le lien"}
                  </button>
                </div>
                
                {/* Affichage du lien complet */}
                <div className="mt-3 p-2 bg-black/30 rounded text-xs text-gray-400 break-all">
                  {window.location.origin}/lobby?room={gameState.roomCode}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">
                Joueurs connectés ({gameState?.players.length || 0})
              </h3>
              <div className="space-y-2">
                {gameState?.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg"
                  >
                    <span className="text-2xl">
                      {index === 0 ? "👑" : "🎮"}
                    </span>
                    <span className="font-semibold">{player.pseudo}</span>
                    {player.id === myPlayerId && (
                      <span className="ml-auto text-xs bg-blue-500 px-2 py-1 rounded">
                        Vous
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isCreator && (
              <button
                onClick={startMultiplayerGame}
                disabled={!gameState || gameState.players.length < 2}
                className="w-full py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {gameState && gameState.players.length < 2 
                  ? "Attendez au moins 2 joueurs..." 
                  : "🎮 Démarrer la partie"}
              </button>
            )}

            {!isCreator && (
              <p className="text-center text-gray-400">
                En attente que l&apos;hôte démarre la partie...
              </p>
            )}

            <button
              onClick={() => router.push('/lobby')}
              className="w-full mt-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Quitter
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <Link href={isMultiplayer ? "/lobby" : "/"} className="absolute top-4 left-4 z-30 text-lg hover:text-green-500 transition">
        ← Retour
      </Link>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-2 px-2">
        <h1>Feat. <span className="accent">Chain</span></h1>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/logo.svg"
            alt="FeatChain Logo"
            width={500}
            height={500}
            className="opacity-40"
          />
        </div>

        {/* Mode Multijoueur : Affichage des joueurs */}
        {isMultiplayer && gameState && (
          <div className="relative z-20 w-full max-w-4xl mb-4">
            <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {gameState.players.map((player) => {
                  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === player.id;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        !player.isActive 
                          ? "bg-gray-700 opacity-50" 
                          : isCurrentTurn 
                          ? "bg-green-500 font-bold" 
                          : "bg-gray-800"
                      }`}
                    >
                      <span>{player.pseudo}</span>
                      <span className="text-red-500">
                        {"❤️".repeat(player.lives)}
                      </span>
                      {player.id === myPlayerId && (
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded">Vous</span>
                      )}
                      {isCurrentTurn && <span className="ml-2">🎯</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Affichage des vies (mode solo uniquement) */}
        {!isMultiplayer && (
          <div className="text-2xl font-bold mb-4 relative z-20">
            ❤️ Vies : {lives}/3
          </div>
        )}

        {/* Timer */}
        {((isMultiplayer && gameState?.gameStarted) || !isMultiplayer) && !gameOver && (
          <div className="relative z-20 mb-4">
            <div className={`text-4xl font-bold transition-all ${
              timeLeft <= 10 ? 'text-red-500 animate-pulse' : 
              timeLeft <= 20 ? 'text-yellow-500' : 
              'text-green-500'
            }`}>
              ⏱️ {timeLeft}s
            </div>
            {/* Barre de progression */}
            <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 10 ? 'bg-red-500' : 
                  timeLeft <= 20 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div 
          id="current-artist-box"
          className="relative z-20"
          style={{
            transform: isAnimating ? "scale(1.05)" : "scale(1)",
            borderColor: isAnimating ? "#1DB954" : "transparent",
            transition: "all 0.3s ease"
          }}
        >
          L&apos;artiste actuel est :
          <span id="current-artist-name">
            {isMultiplayer && gameState ? gameState.currentArtist : currentArtist}
          </span>
        </div>

        <input 
          ref={guessInputRef}
          className="relative z-20 w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.99] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          type="text" 
          id="guess-input" 
          placeholder={
            isMultiplayer && !isMyTurn 
              ? "Attendez votre tour..." 
              : "Qui a fait un feat avec lui ?"
          }
          autoComplete="off"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={gameOver || (isMultiplayer && !isMyTurn)}
        />
        <br />
        <button 
          className="relative z-20 w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.99] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={isMultiplayer ? validateMultiplayer : checkFeat}
          disabled={gameOver || (isMultiplayer && !isMyTurn)}
        >
          Valider
        </button>

        {gameOver && !isMultiplayer && (
          <button 
            className="relative z-20 w-full rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] sm:w-auto mt-4" 
            onClick={restartGame}
          >
            🔄 Rejouer
          </button>
        )}

        <div id="status-msg" className={`relative z-20 ${statusClass}`}>
          {statusMessage}
        </div>
        
        <div 
          id="player-container"
          className="relative z-20"
          dangerouslySetInnerHTML={{ __html: playerEmbed }}
        />

        <div id="history" className="relative z-20">
          {isMultiplayer && gameState ? gameState.history : history}
        </div>
      </div>
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Chargement...</p>
        </div>
      </main>
    }>
      <GamePageContent />
    </Suspense>
  );
}
