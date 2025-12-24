"use client";

import { useState, useRef, KeyboardEvent } from "react";

export default function GamePage() {
  const [currentArtist, setCurrentArtist] = useState("Ninho");
  const [usedArtists, setUsedArtists] = useState<string[]>(["ninho"]);
  const [guess, setGuess] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusClass, setStatusClass] = useState("");
  const [playerEmbed, setPlayerEmbed] = useState("");
  const [history, setHistory] = useState("Chaîne actuelle : Ninho");
  const [isAnimating, setIsAnimating] = useState(false);
  
  const guessInputRef = useRef<HTMLInputElement>(null);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const checkFeat = async () => {
    const guessValue = guess.trim();

    if (!guessValue) return;

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

      } else {
        // DÉFAITE
        setStatusMessage(`❌ Aucun feat trouvé entre ${currentArtist} et ${guessValue}.`);
        setStatusClass("error");
      }

    } catch (error) {
      console.error(error);
      setStatusMessage("Erreur technique");
      setStatusClass("error");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      checkFeat();
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="container ">
        <h1>Feat. <span className="accent">Chain</span></h1>
        
        <div 
          id="current-artist-box"
          style={{
            transform: isAnimating ? "scale(1.05)" : "scale(1)",
            borderColor: isAnimating ? "#1DB954" : "transparent",
            transition: "all 0.3s ease"
          }}
        >
          L&apos;artiste actuel est :
          <span id="current-artist-name">{currentArtist}</span>
        </div>

        <input 
          ref={guessInputRef}
          type="text" 
          id="guess-input" 
          placeholder="Qui a fait un feat avec lui ?" 
          autoComplete="off"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <br />
        <button onClick={checkFeat}>Valider</button>

        <div id="status-msg" className={statusClass}>
          {statusMessage}
        </div>
        
        <div 
          id="player-container"
          dangerouslySetInnerHTML={{ __html: playerEmbed }}
        />

        <div id="history">{history}</div>
      </div>
    </main>
  );
}
