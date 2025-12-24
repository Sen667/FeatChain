# 🚀 Guide de déploiement FeatChain - Mode Multijoueur

## ⚠️ Problème : Socket.IO ne fonctionne pas sur Vercel

Vercel utilise des **fonctions serverless** qui s'arrêtent après chaque requête.  
Socket.IO nécessite une **connexion persistante**, impossible sur Vercel.

## ✅ Solution : Serveur Socket.IO séparé

Le mode multijoueur nécessite 2 déploiements :
1. **Frontend Next.js** → Vercel (déjà fait ✅)
2. **Serveur Socket.IO** → Railway/Render (à faire 👇)

---

## 📦 Étape 1 : Déployer le serveur Socket.IO sur Railway

### 1.1 Créer un compte Railway
- Allez sur [railway.app](https://railway.app)
- Cliquez sur "Start a New Project" (gratuit)
- Connectez-vous avec GitHub

### 1.2 Créer un nouveau service
1. Cliquez sur **"New Project"**
2. Sélectionnez **"Empty Project"**
3. Cliquez sur **"+ New"** → **"GitHub Repo"**
4. Sélectionnez votre repo **FeatChain**
5. Railway va détecter automatiquement le dossier `server/`

### 1.3 Configurer le Root Directory
1. Dans les settings du service
2. Trouvez **"Root Directory"**
3. Mettez : `server`
4. Build Command : `npm install`
5. Start Command : `npm start`

### 1.4 Ajouter les variables d'environnement
Dans l'onglet **"Variables"**, ajoutez :

```
CLIENT_URL=https://featchain-qfonrcyxp-mathishagnere230-gmailcoms-projects.vercel.app
SPOTIFY_CLIENT_ID=33be271de0874e1c87c7192910651c3f
SPOTIFY_CLIENT_SECRET=303c61c157e54f51ab546949a4484b45
PORT=3001
```

### 1.5 Déployer
- Railway va automatiquement déployer
- Une fois déployé, cliquez sur **"Settings"** → **"Generate Domain"**
- Vous obtiendrez une URL type : `https://featchain-server.up.railway.app`

### 1.6 Tester le serveur
Visitez : `https://votre-serveur.up.railway.app/health`

Vous devriez voir :
```json
{
  "status": "healthy",
  "rooms": 0,
  "timestamp": "2025-12-24T..."
}
```

---

## 🌐 Étape 2 : Configurer Vercel avec l'URL du serveur

### 2.1 Ajouter la variable d'environnement sur Vercel

```bash
vercel env add NEXT_PUBLIC_SOCKET_URL
```

Quand demandé :
- **Value** : `https://votre-serveur.up.railway.app` (l'URL Railway)
- **Environments** : Production, Preview
- **Sensitive** : No

Ou via le dashboard Vercel :
1. Allez sur vercel.com → Votre projet
2. Settings → Environment Variables
3. Ajoutez :
   - Name : `NEXT_PUBLIC_SOCKET_URL`
   - Value : `https://votre-serveur.up.railway.app`
   - Environments : Production, Preview

### 2.2 Redéployer sur Vercel

```bash
vercel --prod
```

---

## 🧪 Étape 3 : Tester le multijoueur

1. Allez sur votre site Vercel : https://featchain-qfonrcyxp-mathishagnere230-gmailcoms-projects.vercel.app
2. Cliquez sur **"Jouer en ligne"**
3. Créez une room
4. Partagez le lien avec un ami (ou ouvrez dans un autre onglet)
5. Démarrez la partie → Le multijoueur devrait fonctionner ! 🎉

---

## 🐛 Dépannage

### Le serveur Railway ne démarre pas
- Vérifiez les logs dans Railway
- Assurez-vous que `Root Directory` = `server`
- Vérifiez que les variables d'environnement sont bien définies

### Les clients ne se connectent pas
- Vérifiez que `CLIENT_URL` sur Railway correspond à votre URL Vercel
- Vérifiez que `NEXT_PUBLIC_SOCKET_URL` sur Vercel correspond à votre URL Railway
- Vérifiez la console du navigateur (F12) pour les erreurs

### "Aucun feat entre X et Y" alors qu'il existe
- Vérifiez que `SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET` sont bien définis sur Railway
- Testez l'endpoint : `https://votre-serveur.railway.app/health`

---

## 💰 Alternatives à Railway (toutes gratuites)

### Render.com
1. Créez un compte sur [render.com](https://render.com)
2. New → Web Service
3. Connectez GitHub → Sélectionnez FeatChain
4. Root Directory : `server`
5. Build Command : `npm install`
6. Start Command : `npm start`
7. Ajoutez les variables d'environnement

### Fly.io
```bash
cd server
fly launch
# Suivez les instructions
fly deploy
```

---

## 📝 Résumé

✅ **Mode Solo** : Fonctionne sur Vercel (pas de Socket.IO)  
✅ **Mode Multijoueur** : Nécessite un serveur Socket.IO séparé (Railway)

**Architecture finale :**
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ──API──→│   Vercel     │         │   Railway   │
│  (Browser)  │         │  (Frontend)  │         │  (Socket.IO)│
└─────────────┘         └──────────────┘         └─────────────┘
       │                                                  │
       └──────────────── WebSocket ─────────────────────┘
```

---

## 🆘 Besoin d'aide ?

Si vous avez des problèmes :
1. Vérifiez les logs Railway : Dashboard → Votre service → Logs
2. Vérifiez la console du navigateur (F12)
3. Testez l'endpoint de santé : `/health`
