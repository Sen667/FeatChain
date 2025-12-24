# FeatChain - Mode Multijoueur 🎮

## 🎯 Fonctionnalités Multijoueur

Votre jeu FeatChain a été transformé en version **multijoueur temps réel** ! 

### ✨ Nouvelles fonctionnalités

#### 1. **Système de Lobby/Salles**
- Créer une room avec un **code unique à 6 caractères**
- Partager le code avec vos amis
- Les joueurs peuvent rejoindre en entrant le code
- Salle d'attente avec liste des joueurs connectés

#### 2. **Gestion des Tours**
- Le jeu affiche **"C'est au tour de [Pseudo]"**
- Les inputs sont **automatiquement bloqués** pour les autres joueurs
- Indication visuelle du joueur actif (badge vert + 🎯)
- Tour passe automatiquement au joueur suivant après validation

#### 3. **Synchronisation en Temps Réel**
- Changement d'artiste **instantané** sur tous les écrans
- Affichage du lecteur Spotify synchronisé
- Mise à jour des vies en direct
- Notifications pour chaque événement (feat trouvé, élimination, etc.)

#### 4. **Système de Vies par Joueur**
- Chaque joueur a **3 vies**
- Perte d'une vie en cas d'erreur
- Élimination après 3 erreurs
- Le dernier joueur restant gagne ! 🏆

---

## 🚀 Comment jouer

### Mode Multijoueur

1. **Page d'accueil** (`/`)
   - Cliquez sur "Jouer en ligne"

2. **Lobby** (`/lobby`)
   - Entrez votre **pseudo**
   - Choisissez :
     - **"Créer une Room"** : Générez un code unique
     - **"Rejoindre une Room"** : Entrez le code partagé

3. **Salle d'attente**
   - Le créateur voit la liste des joueurs
   - Attendez au moins **2 joueurs**
   - Le créateur démarre la partie

4. **Partie en cours**
   - À votre tour, entrez un artiste ayant un feat avec l'artiste actuel
   - Le feat est vérifié via l'API Spotify
   - Si correct : l'artiste change et c'est au tour du suivant
   - Si faux : vous perdez une vie

5. **Fin de partie**
   - Le dernier joueur avec des vies gagne
   - Message de victoire affiché à tous

### Mode Solo

- Cliquez sur "Mode solo" depuis la page d'accueil
- Même gameplay qu'avant, mais en solo avec 3 vies

---

## 🛠️ Architecture Technique

### Stack
- **Frontend** : Next.js 14 (App Router) + React + TypeScript
- **Communication temps réel** : Socket.IO
- **API musicale** : Spotify Web API
- **Styling** : Tailwind CSS

### Structure des fichiers

```
featchain/
├── app/
│   ├── page.tsx              # Page d'accueil
│   ├── lobby/
│   │   └── page.tsx          # Lobby multijoueur
│   └── game/
│       └── page.tsx          # Jeu (solo + multijoueur)
├── pages/
│   └── api/
│       └── socket.ts         # Serveur Socket.IO
├── types/
│   └── game.ts               # Types TypeScript partagés
```

### Événements Socket.IO

#### Client → Serveur
- `createRoom` : Créer une room
- `joinRoom` : Rejoindre une room
- `startGame` : Démarrer la partie
- `validateArtist` : Valider un artiste
- `leaveRoom` : Quitter une room

#### Serveur → Client
- `roomCreated` : Room créée avec succès
- `playerJoined` : Un joueur a rejoint
- `playerLeft` : Un joueur est parti
- `gameStarted` : La partie démarre
- `turnChanged` : Changement de tour
- `artistValidated` : Feat validé
- `validationError` : Erreur de validation
- `playerEliminated` : Joueur éliminé
- `gameEnded` : Fin de partie
- `gameStateUpdate` : Mise à jour de l'état

---

## 🔧 Configuration

### Variables d'environnement

Assurez-vous d'avoir configuré vos identifiants Spotify dans `.env.local` :

```env
SPOTIFY_CLIENT_ID=votre_client_id
SPOTIFY_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Installation

```bash
npm install
```

### Démarrage

```bash
npm run dev
```

Le jeu sera accessible sur `http://localhost:3000`

---

## 📱 Utilisation

### Créer une partie

1. Allez sur la page d'accueil
2. Cliquez sur "Jouer en ligne"
3. Entrez votre pseudo
4. Cliquez sur "Créer une Room"
5. Partagez le code à 6 lettres avec vos amis
6. Attendez qu'ils rejoignent
7. Cliquez sur "Démarrer la partie"

### Rejoindre une partie

1. Allez sur la page d'accueil
2. Cliquez sur "Jouer en ligne"
3. Entrez votre pseudo
4. Entrez le code de la room
5. Cliquez sur "Rejoindre une Room"
6. Attendez que l'hôte démarre

---

## 🎨 Interface Utilisateur

### Indicateurs visuels

- **Badge vert** : Joueur dont c'est le tour
- **🎯** : Indicateur du joueur actif
- **❤️** : Vies restantes de chaque joueur
- **👑** : Créateur de la room
- **Opacité réduite** : Joueur éliminé

### Messages

- ✅ **Succès** : Fond vert
- ❌ **Erreur** : Fond rouge
- ⚠️ **Avertissement** : Fond orange
- 💀 **Élimination** : Message spécial
- 🏆 **Victoire** : Annonce du gagnant

---

## 🐛 Debug

### Vérifier la connexion Socket.IO

Ouvrez la console du navigateur (F12) et vérifiez :
- `Connecté au serveur Socket.IO`
- Les événements reçus/envoyés

### Problèmes courants

1. **Socket.IO ne se connecte pas**
   - Vérifiez que le serveur est bien démarré
   - Route `/api/socket` doit être accessible

2. **Les tours ne changent pas**
   - Vérifiez la console pour les erreurs
   - Assurez-vous que le joueur actif envoie bien sa validation

3. **Spotify API ne répond pas**
   - Vérifiez vos identifiants dans `.env.local`
   - Le token est généré via `/api/token`

---

## 🚀 Déploiement

### Vercel

1. Configurez vos variables d'environnement dans Vercel
2. Socket.IO fonctionne automatiquement avec les API Routes de Next.js
3. Déployez normalement

**Note** : Pour un déploiement en production, vous pourriez vouloir utiliser un serveur Socket.IO séparé pour de meilleures performances.

---

## 📈 Améliorations futures

- [ ] Rejouer une partie après Game Over
- [ ] Classement des meilleurs scores
- [ ] Chat en temps réel
- [ ] Modes de jeu supplémentaires (chrono, élimination directe, etc.)
- [ ] Système de salons publics
- [ ] Statistiques des joueurs
- [ ] Replay des parties

---

## 📄 Licence

Ce projet est sous licence MIT.

---

Amusez-vous bien avec FeatChain Multiplayer ! 🎵🎮
