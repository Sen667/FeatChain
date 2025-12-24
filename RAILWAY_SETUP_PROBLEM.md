# ⚠️ IMPORTANT : Configuration Railway

## Le serveur Railway ne fonctionne PAS actuellement !

**Erreur détectée** : Railway a déployé le frontend Next.js au lieu du serveur Socket.IO

### 🔧 Comment corriger (dans Railway) :

1. **Allez sur** → https://railway.app/dashboard
2. **Cliquez sur votre projet** FeatChain
3. **Cliquez sur le service** déployé
4. **Settings** (dans le menu de gauche)
5. **Trouvez** "Root Directory" ou "Watch Paths"
6. **Changez à** : `server` (sans /)
7. **Save changes**
8. Railway va automatiquement redéployer

### ✅ Vérification :

Une fois redéployé, testez :
```bash
curl https://featchain-production.up.railway.app/health
```

Vous devriez voir :
```json
{
  "status": "healthy",
  "rooms": 0,
  "timestamp": "2025-12-24T..."
}
```

### 📋 Variables à vérifier (onglet Variables) :

- `CLIENT_URL` = https://featchain-6yk0zya9e-mathishagnere230-gmailcoms-projects.vercel.app
- `SPOTIFY_CLIENT_ID` = 33be271de0874e1c87c7192910651c3f
- `SPOTIFY_CLIENT_SECRET` = 303c61c157e54f51ab546949a4484b45
- `PORT` = 3001

### 🚨 Si "Root Directory" n'existe pas :

Railway utilise peut-être **Nixpacks** qui détecte automatiquement. Dans ce cas :

1. Supprimez le service actuel
2. Créez un nouveau service
3. Choisissez "Empty Service" → "GitHub Repo"
4. Sélectionnez Sen667/FeatChain
5. **IMPORTANT** : Avant de déployer, allez dans Settings
6. Ajoutez "Root Directory" : `server`
7. Puis déployez

### 📞 Alternative : Déployer manuellement

Si Railway ne permet pas de configurer le Root Directory :

```bash
cd server
railway init
railway link
railway up
```

---

**RAPPEL** : Sans serveur Socket.IO fonctionnel, le mode multijoueur NE PEUT PAS marcher !
