"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LobbyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pseudo, setPseudo] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Pré-remplir le code de room si présent dans l'URL
  useEffect(() => {
    const roomParam = searchParams?.get('room');
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateRoom = () => {
    if (!pseudo.trim()) {
      setError("Veuillez entrer un pseudo");
      return;
    }
    setIsCreating(true);
    setError("");
    // Redirection vers la page de jeu avec les paramètres
    router.push(`/game?action=create&pseudo=${encodeURIComponent(pseudo)}`);
  };

  const handleJoinRoom = () => {
    if (!pseudo.trim()) {
      setError("Veuillez entrer un pseudo");
      return;
    }
    if (!roomCode.trim()) {
      setError("Veuillez entrer un code de room");
      return;
    }
    setIsJoining(true);
    setError("");
    // Redirection vers la page de jeu avec les paramètres
    router.push(`/game?action=join&pseudo=${encodeURIComponent(pseudo)}&room=${roomCode.toUpperCase()}`);
  };

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

        <div className="relative z-20 flex flex-col items-center gap-6 max-w-md w-full">
          <h1 className="text-5xl font-bold text-center mb-4">
            Feat. <span className="text-green-500">Chain</span>
          </h1>
          
          <p className="text-center text-gray-300 mb-2">
            Jouez avec vos amis en temps réel ! 🎵
          </p>

          {/* Input Pseudo */}
          <div className="w-full">
            <label htmlFor="pseudo" className="block text-sm font-medium mb-2">
              Votre pseudo
            </label>
            <input
              id="pseudo"
              type="text"
              className="w-full rounded-lg bg-white px-6 py-3 text-black font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Entrez votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {/* Bouton Créer une Room */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Création..." : "🎮 Créer une Room"}
          </button>

          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">OU</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Input Code Room */}
          <div className="w-full">
            <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
              Code de la room
            </label>
            <input
              id="roomCode"
              type="text"
              className="w-full rounded-lg bg-white px-6 py-3 text-black font-semibold uppercase transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="off"
            />
            {searchParams?.get('room') && (
              <p className="mt-2 text-xs text-green-400">
                ✓ Code pré-rempli depuis le lien partagé
              </p>
            )}
          </div>

          {/* Bouton Rejoindre une Room */}
          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="w-full rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? "Connexion..." : "🚀 Rejoindre une Room"}
          </button>

          {/* Message d'erreur */}
          {error && (
            <div className="w-full p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-200 text-center">
              {error}
            </div>
          )}

          {/* Lien vers le mode solo */}
          <button
            onClick={() => router.push('/game?mode=solo')}
            className="mt-4 text-gray-400 hover:text-white transition underline"
          >
            Jouer en solo
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl">Chargement...</p>
        </div>
      </main>
    }>
      <LobbyPageContent />
    </Suspense>
  );
}
