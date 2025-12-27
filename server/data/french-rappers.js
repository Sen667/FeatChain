// Liste des rappeurs français les plus populaires
const frenchRappers = [
  // Top 100 rappeurs français les plus populaires
  "Ninho", "Booba", "PNL", "Damso", "Nekfeu", "Orelsan", "Jul", "SCH",
  "Niska", "Leto", "Gradur", "Koba LaD", "Kaaris", "Lacrim", "Maes",
  "Freeze Corleone", "Naps", "Rim'K", "Heuss L'Enfoiré", "Soolking",
  "Dadju", "Gims", "Aya Nakamura", "Niska", "Vald", "Lomepal", "Kekra",
  "Chily", "Niro", "Soso Maness", "Hornet La Frappe", "Dinos", "Lefa",
  "Sofiane", "Stromae", "Gambi", "Tiakola", "Laylow", "Zola", "Gazo",
  "Hamza", "SDM", "Zuukou Mayzie", "Ashe 22", "PLK", "Moha La Squale",
  "Kalash Criminel", "Alpha Wann", "Dosseh", "Kalash", "Werenoi",
  "Alonzo","Luv Resval", "Mister You", "MZ", "Naps", "Sadek", "Shotas", "Soso Maness", 
   "Vald", "13 Block", "1Pliké140","Alkpote",
    "Bosh", "Bramsito", "Céza", "Djadja & Dinaz", "Elams", "Fianso",
];

// Fonction pour obtenir un rappeur aléatoire
function getRandomRapper() {
  const randomIndex = Math.floor(Math.random() * frenchRappers.length);
  return frenchRappers[randomIndex];
}

module.exports = { getRandomRapper, frenchRappers };
