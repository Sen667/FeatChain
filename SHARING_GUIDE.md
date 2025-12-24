# 🔗 Guide de Partage - FeatChain Multiplayer

## Comment partager une room avec vos amis

### Méthode 1 : Copier le lien complet (Recommandé) 🌟

1. **Créez votre room**
   - Allez sur `/lobby`
   - Entrez votre pseudo
   - Cliquez sur "Créer une Room"

2. **Dans la salle d'attente**
   - Vous verrez votre code de room (ex: `ABC123`)
   - Cliquez sur **"🔗 Copier le lien"**
   - Le lien complet est copié : `https://votresite.com/lobby?room=ABC123`

3. **Partagez le lien**
   - Envoyez-le par WhatsApp, Discord, SMS, etc.
   - Vos amis cliquent sur le lien
   - Le code est automatiquement pré-rempli
   - Ils n'ont qu'à entrer leur pseudo et rejoindre !

### Méthode 2 : Partager le code uniquement

1. **Copiez le code**
   - Cliquez sur **"📋 Copier le code"**
   - Le code (ex: `ABC123`) est copié

2. **Communiquez le code**
   - Dites à vos amis : "Rejoins avec le code ABC123"
   - Ils vont sur `/lobby`
   - Entrent le code manuellement
   - Cliquent sur "Rejoindre"

### Méthode 3 : Partage direct du lien

Le lien affiché sous les boutons peut être copié manuellement :
```
http://localhost:3001/lobby?room=ABC123
```

---

## 🎮 Workflow complet

### Joueur 1 (Hôte)
1. Ouvre `http://localhost:3001/lobby`
2. Entre son pseudo : "Alice"
3. Clique "Créer une Room"
4. Reçoit le code : `XYZ789`
5. Clique "🔗 Copier le lien"
6. Envoie le lien à ses amis

### Joueur 2 (Invité)
1. Reçoit le lien : `http://localhost:3001/lobby?room=XYZ789`
2. Clique sur le lien
3. Le code `XYZ789` est déjà rempli ✅
4. Entre son pseudo : "Bob"
5. Clique "Rejoindre une Room"
6. Entre dans la salle d'attente

### Joueur 3 (Invité)
1. Reçoit le même lien
2. Suit les mêmes étapes
3. Rejoint la même room

### Démarrage
1. L'hôte (Alice) voit tous les joueurs
2. Quand au moins 2 joueurs sont présents
3. L'hôte clique "Démarrer la partie"
4. Le jeu commence pour tout le monde !

---

## 📱 Exemples de messages de partage

### WhatsApp / SMS
```
🎵 Rejoins-moi sur FeatChain !
Lien : http://localhost:3001/lobby?room=ABC123
ou Code : ABC123
```

### Discord
```
@everyone Partie de FeatChain !
Cliquez ici pour rejoindre : http://localhost:3001/lobby?room=ABC123
Code de room : ABC123
```

### Email
```
Salut !

Je t'invite à jouer à FeatChain avec moi 🎮

Clique sur ce lien pour me rejoindre :
http://localhost:3001/lobby?room=ABC123

Ou entre manuellement le code : ABC123

À tout de suite !
```

---

## 🔧 Fonctionnalités de partage

### Dans la salle d'attente

✅ **Affichage du code**
- Grand texte visible : `ABC123`
- Police grasse et espacée pour faciliter la lecture

✅ **Bouton "Copier le code"**
- Copie juste le code (ex: `ABC123`)
- Feedback visuel : ✓ Copié !

✅ **Bouton "Copier le lien"**
- Copie le lien complet avec le code
- Format : `http://localhost:3001/lobby?room=ABC123`
- Feedback visuel : ✓ Copié !

✅ **Affichage du lien complet**
- Visible sous les boutons
- Peut être sélectionné et copié manuellement
- Format lisible et compréhensible

### Dans le lobby (avec lien partagé)

✅ **Pré-remplissage automatique**
- Si l'URL contient `?room=ABC123`
- Le champ "Code de la room" est automatiquement rempli
- Message de confirmation : "✓ Code pré-rempli depuis le lien partagé"

---

## 💡 Conseils

1. **Privilégiez le lien complet** : Plus simple pour vos amis
2. **Vérifiez le code** : Assurez-vous qu'il s'affiche bien dans la salle d'attente
3. **Partagez rapidement** : Les rooms sont éphémères (tant qu'un joueur est connecté)
4. **Utilisez des noms clairs** : Des pseudos reconnaissables facilitent la communication

---

## 🎯 Résumé visuel

```
┌─────────────────────────────────────────┐
│         SALLE D'ATTENTE                 │
├─────────────────────────────────────────┤
│  Code de la room :                      │
│      ABC123                             │
│  Partagez ce code avec vos amis !       │
│                                         │
│  [📋 Copier le code] [🔗 Copier le lien]│
│                                         │
│  http://localhost:3001/lobby?room=ABC123│
└─────────────────────────────────────────┘
```

Voilà ! Vos amis peuvent maintenant facilement rejoindre votre partie ! 🎮🎵
