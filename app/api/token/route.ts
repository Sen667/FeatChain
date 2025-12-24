import { NextResponse } from 'next/server';

// Variables d'environnement sécurisées
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiration: number = 0;

// Fonction pour récupérer un token Spotify
async function getSpotifyToken(): Promise<string | null> {
  // Vérification des credentials
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Credentials Spotify manquants dans .env.local');
    return null;
  }

  // Si on a un token valide, on le garde
  if (cachedToken && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  console.log("🔄 Génération d'un nouveau token...");

  // Sinon, on demande un nouveau à Spotify
  const authString = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + authString,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du token');
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // On définit l'expiration (1h moins 1 minute de marge)
    tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
    
    console.log("✅ Token généré avec succès");
    return cachedToken;
  } catch (error) {
    console.error("Erreur Token:", error);
    return null;
  }
}

// Route GET /api/token
export async function GET() {
  try {
    const token = await getSpotifyToken();
    
    if (token) {
      return NextResponse.json({ token });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la génération du token' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur dans la route token:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
