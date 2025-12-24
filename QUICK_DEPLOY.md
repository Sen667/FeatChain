# 🚀 Déploiement Rapide - FeatChain Multijoueur

## ⚡ Action Immédiate

Votre serveur Socket.IO local fonctionne ! Maintenant déployons-le sur Railway.

### 1️⃣ Pusher le code sur GitHub

```bash
cd /Users/sen/Documents/Project/Pro/FeatChainAPP/featchain
git add .
git commit -m "feat: add standalone socket.io server for multiplayer"
git push
```

### 2️⃣ Déployer sur Railway

1. **Allez sur** → https://railway.app
2. **Cliquez sur** "Start a New Project" (gratuit)
3. **Login avec GitHub**
4. **New Project** → **Deploy from GitHub repo**
5. **Sélectionnez** : `Sen667/FeatChain`
6. Railway va scanner et trouver le dossier `server/`

### 3️⃣ Configurer Railway

Une fois le projet créé :

#### Settings :
- **Root Directory** : `server`
- **Build Command** : `npm install`
- **Start Command** : `npm start`

#### Variables (onglet "Variables") :
Ajoutez ces 4 variables :

```
CLIENT_URL=https://featchain-qfonrcyxp-mathishagnere230-gmailcoms-projects.vercel.app
SPOTIFY_CLIENT_ID=33be271de0874e1c87c7192910651c3f
SPOTIFY_CLIENT_SECRET=303c61c157e54f51ab546949a4484b45
PORT=3001
```

#### Networking :
- Cliquez sur **"Settings"** → **"Networking"**
- Cliquez sur **"Generate Domain"**
- Copiez l'URL générée (ex: `featchain-production.up.railway.app`)

### 4️⃣ Configurer Vercel

Ajoutez la variable d'environnement :

```bash
cd /Users/sen/Documents/Project/Pro/FeatChainAPP/featchain
vercel env add NEXT_PUBLIC_SOCKET_URL
```

- **Value** : Collez l'URL Railway (ex: `https://featchain-production.up.railway.app`)
- **Environments** : Production, Preview
- **Sensitive** : No

### 5️⃣ Redéployer Vercel

```bash
vercel --prod
```

### 6️⃣ Tester

1. Allez sur votre site Vercel
2. Cliquez "Jouer en ligne"
3. Créez une room
4. Ouvrez le lien dans un autre onglet
5. Jouez ! 🎮

---

## ✅ Checklist

- [ ] Code pushé sur GitHub
- [ ] Projet créé sur Railway
- [ ] Variables d'environnement ajoutées sur Railway
- [ ] Domain généré sur Railway
- [ ] NEXT_PUBLIC_SOCKET_URL ajouté sur Vercel
- [ ] Site redéployé sur Vercel
- [ ] Test du multijoueur réussi

---

## 🐛 Si ça ne marche pas

### Tester le serveur Railway
```bash
curl https://votre-url.railway.app/health
```

Réponse attendue :
```json
{"status":"healthy","rooms":0,"timestamp":"..."}
```

### Vérifier les logs Railway
Dans Railway → Votre projet → Onglet "Deployments" → Voir les logs

### Vérifier la console navigateur
F12 → Console → Cherchez les erreurs Socket.IO

---

## 📞 URL importantes

- **Railway Dashboard** : https://railway.app/dashboard
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Votre site** : https://featchain-qfonrcyxp-mathishagnere230-gmailcoms-projects.vercel.app
- **Serveur Socket.IO** : À obtenir après déploiement Railway
