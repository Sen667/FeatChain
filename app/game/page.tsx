"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { getRandomRapper } from "@/data/french-rappers";
// Imports pour le style et l'animation
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic2, 
  Users, 
  Clock, 
  Heart, 
  ArrowRight, 
  Share2, 
  AlertCircle, 
  Zap,
  Music
} from "lucide-react";
import { clsx } from "clsx";
import confetti from "canvas-confetti";

// Types importés (assure-toi que ce fichier existe, sinon tu peux définir les interfaces ici)
import type { GameState, ServerToClientEvents, ClientToServerEvents } from "@/types/game";

// Variable globale pour le socket (évite les reconnexions multiples au re-render)
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

// --- COMPOSANTS DE STYLE ---

// Fond d'écran animé avec grain "Noise"
const Background = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-neutral-950">
    {/* Dégradé de fond */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1a2e1f_0%,_#000000_70%)] opacity-80" />
    
    {/* Effet de grain (Noise) SVG */}
    <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
    </div>
  </div>
);

function GamePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // --- PARAMÈTRES URL ---
  const mode = searchParams?.get('mode'); // 'solo' ou null
  const action = searchParams?.get('action'); // 'create' ou 'join'
  const pseudo = searchParams?.get('pseudo');
  const roomCodeParam = searchParams?.get('room');

  // --- ÉTATS ---
  const [initialRapper] = useState(() => getRandomRapper());

  // États du jeu solo
  const [currentArtist, setCurrentArtist] = useState(initialRapper);
  const [usedArtists, setUsedArtists] = useState<string[]>([initialRapper.toLowerCase()]);
  const [guess, setGuess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusClass, setStatusClass] = useState<"success" | "error" | "warning" | "info" | "">("");
  const [spotifyTrackId, setSpotifyTrackId] = useState<string>("");
  // Historique géré comme un tableau pour faciliter l'affichage UI
  const [history, setHistory] = useState<string[]>([initialRapper]);
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
  
  // Animation de secousse
  const [shake, setShake] = useState(false);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const guessInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALISATION ---
  useEffect(() => {
    if (mode === 'solo') {
      setIsMultiplayer(false);
      setHistory([initialRapper]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, action, pseudo, roomCodeParam, router]);

  // --- LOGIQUE SOCKET.IO ---
  const initializeSocket = async () => {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    if (socketUrl && !socketUrl.startsWith('http://') && !socketUrl.startsWith('https://')) {
      socketUrl = 'https://' + socketUrl;
    }
    
    socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');
      setMyPlayerId(socket!.id || "");
      setConnectionError("");

      if (action === 'create') {
        socket!.emit('createRoom', { pseudo: pseudo! }, (response) => {
          if (response.success && response.roomCode) {
            // Mock initial state pour feedback immédiat
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
            setStatusClass("info");
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
            setStatusClass("info");
          } else {
            setConnectionError(response.error || "Erreur lors de la connexion");
          }
        });
      }
    });

    socket.on('gameState', (newGameState) => {
      setGameState(newGameState);
    });

    socket.on('playerJoined', (data) => {
      setStatusMessage(`${data.player.pseudo} a rejoint la partie !`);
      setStatusClass("info");
    });

    socket.on('gameStarted', (newGameState) => {
      setGameState(newGameState);
      setWaitingForPlayers(false);
      setStatusMessage("La partie commence !");
      setStatusClass("info");
      
      const firstPlayerId = newGameState.players[newGameState.currentPlayerIndex]?.id;
      const myTurn = firstPlayerId === socket!.id;
      setIsMyTurn(myTurn);
      
      if (myTurn) startTimer();
    });

    socket.on('turnChanged', (data) => {
      const myTurn = data.currentPlayerId === socket!.id;
      setIsMyTurn(myTurn);
      
      if (myTurn) {
        setStatusMessage("C'est ton tour !");
        setStatusClass("info");
        resetTimer();
        startTimer();
      } else {
        setStatusMessage(`Tour de ${data.currentPlayerPseudo}`);
        setStatusClass("");
        stopTimer();
      }
    });

    socket.on('artistValidated', (data) => {
      setSpotifyTrackId(data.trackId);
      setStatusMessage(`✅ Validé : "${data.trackName}"`);
      setStatusClass("success");
      setGuess("");
      triggerAnimation();
      // Petit confetti de validation
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#4ade80', '#22c55e']
      });
    });

    socket.on('validationError', (data) => {
      setStatusMessage(data.message);
      setStatusClass("error");
      triggerShake();
      if (data.gameOver) setGameOver(true);
    });

    socket.on('playerEliminated', (data) => {
      setStatusMessage(`💀 ${data.playerPseudo} a été éliminé !`);
      setStatusClass("error");
    });

    socket.on('gameEnded', (data) => {
      setGameOver(true);
      setStatusMessage(`🏆 ${data.winner.pseudo} a gagné !`);
      setStatusClass("success");
      triggerConfetti();
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

  // --- LOGIQUE JEU SOLO & TIMER ---

  const startTimer = () => { setTimeLeft(30); setTimerActive(true); };
  const stopTimer = () => { setTimerActive(false); if (timerRef.current) clearInterval(timerRef.current); };
  const resetTimer = () => { stopTimer(); setTimeLeft(30); };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTimer();
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, timeLeft, isMultiplayer, isMyTurn]);

  const handleTimeOut = () => {
    if (socket && gameState) {
      setStatusMessage("⏰ Temps écoulé !");
      setStatusClass("error");
      socket.emit('timeOut', { roomCode: gameState.roomCode });
    }
  };

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
      triggerShake();
      resetTimer();
      startTimer();
    }
  };

  const checkFeat = async () => {
    if (gameOver) return;
    const guessValue = guess.trim();
    if (!guessValue) return;

    const cleanGuess = guessValue.toLowerCase();
    const cleanCurrent = currentArtist.toLowerCase();

    if (cleanGuess === cleanCurrent) {
      setStatusMessage("⚠️ Il ne peut pas feat avec lui-même !");
      setStatusClass("warning");
      triggerShake();
      return;
    }

    if (usedArtists.includes(cleanGuess)) {
      setStatusMessage(`⚠️ Déjà cité !`);
      setStatusClass("warning");
      triggerShake();
      return;
    }

    setStatusMessage("Recherche en cours...");
    setStatusClass("info");

    try {
      const tokenReq = await fetch('/api/token');
      if (!tokenReq.ok) throw new Error("Erreur serveur local");
      const tokenData = await tokenReq.json();

      const query = encodeURIComponent(`artist:${currentArtist} artist:${guessValue}`);
      // Note: Utilisation de l'API standard Spotify
      const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

      const response = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + tokenData.token }
      });
      
      const data = await response.json();

      if (data.tracks && data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        
        // Vérification stricte : les deux artistes doivent être dans la liste des artistes du track
        const trackArtists = track.artists.map((a: any) => a.name.toLowerCase());
        const hasCurrentArtist = trackArtists.some((name: string) => 
          name.includes(cleanCurrent) || cleanCurrent.includes(name)
        );
        const hasGuessedArtist = trackArtists.some((name: string) => 
          name.includes(cleanGuess) || cleanGuess.includes(name)
        );
        
        if (!hasCurrentArtist || !hasGuessedArtist) {
          // Les deux artistes ne sont pas sur le même track
          const newLives = lives - 1;
          setLives(newLives);
          
          if (newLives <= 0) {
            setStatusMessage(`💀 Game Over ! Aucun feat trouvé entre ${currentArtist} et ${guessValue}.`);
            setStatusClass("error");
            setGameOver(true);
            stopTimer();
          } else {
            setStatusMessage(`❌ Aucun feat trouvé entre ces artistes. Vies : ${newLives}`);
            setStatusClass("error");
            triggerShake();
          }
          return;
        }

        setStatusMessage(`✅ Validé : "${track.name}"`);
        setStatusClass("success");

        setUsedArtists(prev => [...prev, cleanGuess]);
        const newArtist = capitalizeFirstLetter(guessValue);
        setCurrentArtist(newArtist);
        setGuess("");
        setHistory(prev => [...prev, newArtist]);
        setSpotifyTrackId(track.id);
        
        triggerAnimation();
        resetTimer();
        startTimer();
        
        // Petit confetti de validation
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#4ade80', '#22c55e']
        });
      } else {
        const newLives = lives - 1;
        setLives(newLives);
        
        if (newLives <= 0) {
          setStatusMessage(`💀 Game Over ! Aucun feat trouvé.`);
          setStatusClass("error");
          setGameOver(true);
          stopTimer();
        } else {
          setStatusMessage(`❌ Aucun feat trouvé. Vies : ${newLives}`);
          setStatusClass("error");
          triggerShake();
        }
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("Erreur technique");
      setStatusClass("error");
    }
  };

  // --- HELPERS & ANIMATIONS ---
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const triggerConfetti = () => {
    // Confetti du centre
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Confetti de gauche
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 200);
    
    // Confetti de droite
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
    
    // Explosion finale
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#4ade80', '#22c55e', '#16a34a', '#15803d']
      });
    }, 600);
  };

  const copyRoomCode = () => {
    if (gameState) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const restartGame = () => {
    const newRapper = getRandomRapper();
    setCurrentArtist(newRapper);
    setUsedArtists([newRapper.toLowerCase()]);
    setGuess("");
    setStatusMessage("");
    setSpotifyTrackId("");
    setHistory([newRapper]);
    setLives(3);
    setGameOver(false);
    resetTimer();
    startTimer();
  };

  // --- RENDU : GESTION DES ERREURS DE CONNEXION ---
  if (connectionError) {
    return (
      <main className="relative min-h-screen w-full flex items-center justify-center bg-black text-white font-sans overflow-hidden">
        <Background />
        <div className="z-10 bg-red-500/10 border border-red-500/20 p-8 rounded-2xl backdrop-blur-xl max-w-md text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 uppercase">Erreur de connexion</h2>
          <p className="text-gray-400 mb-6 text-sm">{connectionError}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition uppercase tracking-wider text-sm"
          >
            Retour au lobby
          </button>
        </div>
      </main>
    );
  }

  // --- RENDU : SALLE D'ATTENTE MULTIJOUEUR ---
  if (isMultiplayer && waitingForPlayers && gameState && gameState.players && gameState.players.length > 0) {
    const isCreator = gameState.players[0]?.id === myPlayerId;
    
    return (
      <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden font-sans selection:bg-green-500 selection:text-black">
        <Background />

        <div className="z-10 w-full max-w-2xl relative">
          <Link href="/lobby" className="absolute -top-16 left-0 flex items-center gap-2 text-gray-500 hover:text-white transition group">
            <ArrowRight className="rotate-180 w-4 h-4 group-hover:-translate-x-1 transition" /> Retour
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center mb-10">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-green-500/20">Lobby</span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-center mb-2 italic">
                Green Room
              </h1>
              <p className="text-gray-400 text-sm">Préparez vos meilleurs feats...</p>
            </div>

            {/* Carte du Code Room */}
            <div className="bg-black/40 rounded-xl p-6 mb-8 border border-white/5 flex flex-col items-center gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 blur-3xl rounded-full"></div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Code de la room</p>
              <div className="text-5xl font-mono font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {gameState.roomCode}
              </div>
              <button
                onClick={copyRoomCode}
                className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                {copySuccess ? "✓ Copié !" : <><Share2 className="w-4 h-4"/> Partager le code</>}
              </button>
            </div>

            {/* Liste des Joueurs */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-between">
                Joueurs connectés <span>{gameState.players.length}/4</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gameState.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-neutral-800/50 p-3 rounded-xl border border-white/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg shadow-green-500/20">
                      {player.pseudo.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{player.pseudo}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{index === 0 ? "Hôte" : "MC"}</div>
                    </div>
                    {player.id === myPlayerId && (
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                  </motion.div>
                ))}
                 {/* Placeholders pour les joueurs manquants */}
                 {Array.from({ length: Math.max(0, 4 - gameState.players.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 opacity-30">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                        <div className="text-xs font-medium">En attente...</div>
                    </div>
                ))}
              </div>
            </div>

            {/* Bouton d'action */}
            {isCreator ? (
              <button
                onClick={startMultiplayerGame}
                disabled={!gameState || gameState.players.length < 2}
                className="w-full py-5 bg-white text-black font-black text-lg uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                {gameState && gameState.players.length < 2 
                  ? "En attente de joueurs..." 
                  : "🔥 Lancer la partie"}
              </button>
            ) : (
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5 animate-pulse">
                <p className="text-sm text-gray-400">L'hôte va lancer la partie...</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    );
  }

  // --- RENDU : JEU PRINCIPAL (ARENA) ---
  return (
    <main className="relative min-h-screen w-full flex flex-col overflow-hidden bg-black text-white font-sans selection:bg-green-500 selection:text-black">
      <Background />

      {/* HEADER */}
      <header className="relative z-20 w-full px-6 py-6 flex justify-between items-start md:items-center">
        <Link href={isMultiplayer ? "/lobby" : "/"} className="group flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Feat.<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Chain</span>
          </h1>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest group-hover:text-green-500 transition">THE RAP GAME</span>
        </Link>

        {/* TIMER BAR (Central) */}
        {((isMultiplayer && gameState?.gameStarted) || !isMultiplayer) && !gameOver && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full md:w-1/3 h-1 bg-white/10">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / 30) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
              className={clsx(
                "h-full shadow-[0_0_15px_rgba(255,255,255,0.5)]",
                timeLeft <= 10 ? "bg-red-500 shadow-red-500/50" : 
                timeLeft <= 20 ? "bg-yellow-400 shadow-yellow-400/50" : 
                "bg-green-500 shadow-green-500/50"
              )}
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              <Clock className={clsx("w-3 h-3", timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-green-500")} />
              <span className="font-mono font-bold text-sm">{timeLeft}s</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 items-center">
          {/* Vies ou Joueurs */}
          {!isMultiplayer ? (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={clsx(
                    "w-5 h-5 transition-all duration-300", 
                    i < lives 
                      ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      : "text-gray-800"
                  )} 
                />
              ))}
            </div>
          ) : (
            <div className="flex -space-x-2">
              {gameState?.players.map((p) => (
                <div 
                  key={p.id} 
                  className={clsx(
                    "w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 relative z-10", 
                    p.isActive ? "bg-white text-black" : "bg-gray-800 text-gray-500"
                  )}
                  title={p.pseudo}
                >
                  {p.pseudo.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ARENA CENTRALE */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-4xl mx-auto">
        
        {/* Notifications Toast */}
        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div 
              key={statusMessage}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={clsx(
                "absolute top-16 md:top-24 px-6 py-2 rounded-full backdrop-blur-md border text-sm font-bold shadow-2xl flex items-center gap-2 pointer-events-none z-50",
                statusClass === 'success' ? "bg-green-500/10 border-green-500/50 text-green-400" :
                statusClass === 'error' ? "bg-red-500/10 border-red-500/50 text-red-400" :
                statusClass === 'warning' ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400" :
                "bg-blue-500/10 border-blue-500/50 text-blue-400"
              )}
            >
              {statusClass === 'success' && <Zap className="w-4 h-4 fill-current"/>}
              {statusClass === 'error' && <AlertCircle className="w-4 h-4"/>}
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicateur de tour (Multi) */}
        {isMultiplayer && gameState && (
          <div className="mb-4 text-xs font-mono tracking-widest text-gray-500 uppercase flex items-center gap-2">
            {isMyTurn ? (
              <span className="text-green-400 animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span> C'est ton tour
              </span>
            ) : (
              <span>En attente de <span className="text-white font-bold">{gameState.players[gameState.currentPlayerIndex]?.pseudo}</span></span>
            )}
          </div>
        )}

        {/* HERO: NOM DE L'ARTISTE */}
        <div className="w-full text-center mb-12 relative group">
          <p className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-[0.3em] mb-4">Artiste Actuel</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={isMultiplayer && gameState ? gameState.currentArtist : currentArtist}
              initial={{ y: 50, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -50, opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="relative"
            >
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {isMultiplayer && gameState ? gameState.currentArtist : currentArtist}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* INPUT DE SAISIE */}
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          className={clsx("w-full max-w-lg relative group z-30", gameOver && "opacity-50 pointer-events-none")}
        >
          {/* Lueur d'arrière plan au hover/focus */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-40 transition duration-500 blur-lg"></div>
          
          <div className="relative flex items-center bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="pl-6 text-gray-500">
              <Mic2 className={clsx("w-5 h-5 transition-colors", (isMyTurn || !isMultiplayer) && !gameOver ? "text-green-500" : "text-gray-700")} />
            </div>
            <input
              ref={guessInputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (isMultiplayer ? validateMultiplayer() : checkFeat())}
              disabled={gameOver || (isMultiplayer && !isMyTurn)}
              placeholder={gameOver ? "Partie terminée" : (isMultiplayer && !isMyTurn ? "Attends ton tour..." : "Qui a feat avec ?")}
              className="w-full bg-transparent px-4 py-6 text-lg md:text-xl font-bold text-white placeholder-gray-600 focus:outline-none uppercase tracking-wide disabled:cursor-not-allowed"
              autoComplete="off"
              autoFocus
            />
            <button 
              onClick={isMultiplayer ? validateMultiplayer : checkFeat}
              disabled={!guess.trim() || (isMultiplayer && !isMyTurn)}
              className="mr-2 p-3 rounded-xl bg-white text-black hover:bg-green-400 disabled:opacity-0 disabled:scale-50 transition-all duration-300 transform"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* BOUTON REJOUER (SOLO) */}
        {gameOver && !isMultiplayer && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={restartGame}
            className="mt-8 px-8 py-4 bg-white text-black font-black uppercase tracking-wider rounded-full hover:scale-105 hover:bg-green-400 transition shadow-[0_0_20px_rgba(74,222,128,0.4)] z-30"
          >
            Rejouer
          </motion.button>
        )}
      </div>

      {/* FOOTER AREA */}
      <footer className="relative z-20 w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-gradient-to-t from-black via-black/80 to-transparent">
        
        {/* HISTORY (Hidden on mobile mostly) */}
        <div className="hidden md:flex flex-col justify-end text-xs text-gray-500 h-32 relative">
          <span className="font-bold mb-3 uppercase tracking-widest text-white/20 flex items-center gap-2">
             Historique
          </span>
          {/* Masque dégradé pour l'historique */}
          <div className="absolute top-8 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex flex-col-reverse gap-2 overflow-hidden mask-image-linear">
            {(isMultiplayer && gameState ? gameState.history.split(' > ').filter(x => !x.includes('Chaîne')) : history).slice(-5).reverse().map((artist, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-400">
                <Music className="w-3 h-3 text-gray-700" />
                {artist}
              </div>
            ))}
          </div>
        </div>

        {/* SPOTIFY PLAYER */}
        <div className="w-full md:col-start-2 flex justify-center">
          <AnimatePresence>
            {spotifyTrackId && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="w-full max-w-md bg-neutral-900 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(29,185,84,0.15)] border border-white/10 relative group"
              >
                {/* Petit effet glow sur le player */}
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
                <iframe 
                  src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0`}
                  width="100%" 
                  height="80" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="relative z-10 bg-neutral-900"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INFO ROOM (Mobile Only mainly) */}
        {isMultiplayer && (
          <div className="hidden md:flex justify-end items-end h-full">
            <div className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg text-[10px] font-mono border border-white/5 text-gray-400">
              ROOM ID: <span className="text-white font-bold text-sm ml-2">{gameState?.roomCode}</span>
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-gray-500 animate-pulse">Chargement du flow...</p>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  );
}