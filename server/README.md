# FeatChain Socket.IO Server

Serveur Socket.IO standalone pour le mode multijoueur de FeatChain.

## Déploiement sur Railway

### Étape 1 : Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub

### Étape 2 : Déployer le serveur
1. Cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez votre repo FeatChain
4. Railway détectera automatiquement le dossier `server/`

### Étape 3 : Configurer les variables d'environnement
Dans Railway, ajoutez ces variables :

```
CLIENT_URL=https://votre-site-vercel.vercel.app
SPOTIFY_CLIENT_ID=33be271de0874e1c87c7192910651c3f
SPOTIFY_CLIENT_SECRET=303c61c157e54f51ab546949a4484b45
PORT=3001
```

### Étape 4 : Obtenir l'URL du serveur
Railway vous donnera une URL type : `https://featchain-server.up.railway.app`

### Étape 5 : Mettre à jour le client
Dans votre projet Next.js, ajoutez la variable d'environnement :

```
NEXT_PUBLIC_SOCKET_URL=https://featchain-server.up.railway.app
```

## Déploiement local (dev)

```bash
cd server
npm install
npm run dev
```

Le serveur sera disponible sur `http://localhost:3001`

## Alternative : Render.com

1. Créez un compte sur [render.com](https://render.com)
2. New → Web Service
3. Connectez votre repo GitHub
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Ajoutez les variables d'environnement

## Alternative : Fly.io

```bash
cd server
fly launch
fly deploy
```

## Vérifier que ça fonctionne

Visitez : `https://votre-serveur.railway.app/health`

Vous devriez voir :
```json
{
  "status": "healthy",
  "rooms": 0,
  "timestamp": "2025-12-24T..."
}
```
