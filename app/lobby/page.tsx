"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type Lang = "fr" | "en";

const TEXT = {
  fr: {
    subtitle: "Jouez avec vos amis en temps réel 🎵",
    pseudoLabel: "Votre pseudo",
    pseudoPlaceholder: "Entrez votre pseudo",
    create: "Créer une room",
    creating: "Création...",
    join: "Rejoindre une room",
    joining: "Connexion...",
    roomCode: "Code de la room",
    roomPlaceholder: "Ex: ABC123",
    prefilled: "Code pré-rempli depuis le lien partagé",
    solo: "Jouer en solo",
    or: "OU",
    errors: {
      pseudo: "Veuillez entrer un pseudo",
      room: "Veuillez entrer un code de room",
    },
    loading: "Chargement...",
  },
  en: {
    subtitle: "Play with your friends in real time 🎵",
    pseudoLabel: "Your username",
    pseudoPlaceholder: "Enter your username",
    create: "Create a room",
    creating: "Creating...",
    join: "Join a room",
    joining: "Joining...",
    roomCode: "Room code",
    roomPlaceholder: "e.g. ABC123",
    prefilled: "Code prefilled from shared link",
    solo: "Play solo",
    or: "OR",
    errors: {
      pseudo: "Please enter a username",
      room: "Please enter a room code",
    },
    loading: "Loading...",
  },
};

function LobbyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Lang>("fr");
  const t = TEXT[lang];

  const [pseudo, setPseudo] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Détection langue navigateur (safe)
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      if (navigator.language.startsWith("en")) {
        setLang("en");
      }
    }
  }, []);

  // Pré-remplir le code de room si présent dans l'URL
  useEffect(() => {
    const roomParam = searchParams?.get("room");
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateRoom = () => {
    if (!pseudo.trim()) {
      setError(t.errors.pseudo);
      return;
    }
    setIsCreating(true);
    setError("");
    router.push(`/game?action=create&pseudo=${encodeURIComponent(pseudo)}`);
  };

  const handleJoinRoom = () => {
    if (!pseudo.trim()) {
      setError(t.errors.pseudo);
      return;
    }
    if (!roomCode.trim()) {
      setError(t.errors.room);
      return;
    }
    setIsJoining(true);
    setError("");
    router.push(
      `/game?action=join&pseudo=${encodeURIComponent(
        pseudo
      )}&room=${roomCode.toUpperCase()}`
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* Header */}
<header className="relative z-20 px-6 pt-6">
  <div className="flex items-center justify-center sm:justify-start">
    <Image
      src="/logo.png"
      alt="FeatChain Logo"
      width={56}
      height={56}
      priority
    />
  </div>
</header>

      {/* Background logo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="FeatChain Logo"
          width={700}
          height={700}
          priority
          className="opacity-[0.06]"
        />
      </div>

      {/* Language switch */}
      <button
        onClick={() => setLang(lang === "fr" ? "en" : "fr")}
        className="absolute right-6 top-6 z-20 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-[#32CC8C] hover:text-[#32CC8C]"
      >
        {lang === "fr" ? "EN" : "FR"}
      </button>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">

          {/* Pseudo */}
          <div className="mt-2">
            <label className="text-sm font-semibold">{t.pseudoLabel}</label>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-white outline-none focus:border-[#32CC8C]/60 focus:ring-2 focus:ring-[#32CC8C]/25"
              placeholder={t.pseudoPlaceholder}
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Create */}
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="mt-6 w-full rounded-2xl bg-[#32CC8C] px-6 py-3 font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {isCreating ? t.creating : t.create}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">{t.or}</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Join */}
          <div>
            <label className="text-sm font-semibold">{t.roomCode}</label>
            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3 uppercase text-white outline-none focus:border-[#32CC8C]/60 focus:ring-2 focus:ring-[#32CC8C]/25"
              placeholder={t.roomPlaceholder}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            {searchParams?.get("room") && (
              <p className="mt-2 text-xs text-[#CFFFE2]">✓ {t.prefilled}</p>
            )}
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="mt-4 w-full rounded-2xl border border-[#32CC8C]/35 bg-black/35 px-6 py-3 font-semibold text-[#CFFFE2] transition hover:bg-[#32CC8C]/10 disabled:opacity-50"
          >
            {isJoining ? t.joining : t.join}
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            onClick={() => router.push("/game?mode=solo")}
            className="mt-6 block w-full text-center text-sm text-white/40 underline hover:text-white"
          >
            {t.solo}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LobbyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-[#32CC8C]" />
            <p className="text-lg">Chargement...</p>
          </div>
        </main>
      }
    >
      <LobbyPageContent />
    </Suspense>
  );
}
