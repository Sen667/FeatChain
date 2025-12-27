// Types partagés pour le jeu multijoueur

export interface Player {
  id: string;
  pseudo: string;
  lives: number;
  isActive: boolean;
}

export interface GameState {
  roomCode: string;
  currentArtist: string;
  usedArtists: string[];
  history: string;
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner?: string;
}

export interface ServerToClientEvents {
  gameState: (gameState: GameState) => void;
  roomCreated: (data: { roomCode: string }) => void;
  playerJoined: (data: { player: Player; players: Player[] }) => void;
  playerLeft: (data: { playerId: string; players: Player[] }) => void;
  gameStateUpdate: (gameState: GameState) => void;
  gameStarted: (gameState: GameState) => void;
  turnChanged: (data: { currentPlayerId: string; currentPlayerPseudo: string }) => void;
  artistValidated: (data: { 
    newArtist: string; 
    trackName: string; 
    trackId: string;
    history: string;
    nextPlayerId: string;
  }) => void;
  validationError: (data: { 
    message: string; 
    livesLost: boolean;
    remainingLives?: number;
    gameOver?: boolean;
  }) => void;
  playerEliminated: (data: { playerId: string; playerPseudo: string }) => void;
  gameEnded: (data: { winner: Player }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (data: { pseudo: string }, callback: (response: { success: boolean; roomCode?: string; error?: string }) => void) => void;
  joinRoom: (data: { roomCode: string; pseudo: string }, callback: (response: { success: boolean; gameState?: GameState; error?: string }) => void) => void;
  startGame: (roomCode: string) => void;
  validateArtist: (data: { roomCode: string; playerId: string; artistGuess: string }) => void;
  leaveRoom: (data: { roomCode: string; playerId: string }) => void;
}
