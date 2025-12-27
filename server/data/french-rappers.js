// Liste des rappeurs français les plus populaires
const frenchRappers = [
  // Top 100 rappeurs français les plus populaires
  "Ninho", "Booba", "PNL", "Damso", "Nekfeu", "Orelsan", "Jul", "SCH",
  "Niska", "Leto", "Gradur", "Koba LaD", "Kaaris", "Lacrim", "Maes",
  "Freeze Corleone", "Naps", "Rim'K", "Heuss L'Enfoiré", "Soolking",
  "Dadju", "Gims", "Aya Nakamura", "Niska", "Vald", "Lomepal", "Kekra",
  "Chily", "Niro", "Soso Maness", "YL", "Hornet La Frappe", "Elh Kmer",
  "Dinos", "Lefa", "Sofiane", "Stromae", "Gambi", "Tiakola", "Laylow",
  "Zola", "Gazo", "Hamza", "SDM", "Zuukou Mayzie", "Ashe 22", "PLK",
  "Moha La Squale", "Kalash Criminel", "Alpha Wann", "Dosseh", "Kalash",
  "Werenoi", "Alonzo", "Dj Hamida", "Doria", "Kpoint", "Luv Resval",
  "Mister You", "MZ", "Naps", "Sadek", "Shotas", "Soso Maness", "Souldia",
  "TiiwTiiw", "Vald", "YBN Nahmir", "Zbig", "13 Block", "1Pliké140",
  
  // Autres rappeurs populaires (100-200)
  "4Keus", "Alkpote", "Bramsito", "Captaine Roshi", "Cheu-B", "Dabs",
  "Djadja & Dinaz", "Doria", "Elams", "FMK", "Fresh La Peufra", "GLK",
  "Green Montana", "Guy2Bezbar", "Hayce Lemsi", "Hiro", "Hugo TSR",
  "ISK", "Jazzy Bazz", "JuL", "Kanoé", "Khali", "Kodes", "L2B Gang",
  "La Fouine", "Lacrim", "Le Rat Luciano", "Lefa", "Les Gold", "Lil Durk",
  "Lim", "Livai", "Luidji", "Mac Tyer", "Maes", "Maître Gims", "MHD",
  "Mohamed Ali", "Moubarak", "Myth Syzer", "N.O.S", "Nad", "Nahir",
  "Nakk", "Naps", "Nassi", "Naza", "Nessbeal", "Ninho", "Niro",
  
  // Rappeurs émergents et confirmés (200-300)
  "Noochee", "Obama", "Oboy", "OGB", "Ol' Kainry", "Osirus Jack", "Oxmo Puccino",
  "PA Sports", "Pejmaxx", "PLK", "Primero", "Prince Waly", "Ralphie", "Rayvanny",
  "Remy", "Rim-K", "RK", "Rohff", "Sadek", "Samba Peuzzi", "Sat L'Artificier",
  "SCH", "Seth Gueko", "Sevran", "Shay", "Sheldon", "Shotas", "Sifax",
  "Sinik", "Slimane", "Slt Yogi", "Smayl", "Sneazzy", "Sofiane Pamart",
  "Solda", "Soolking", "Soprano", "Soso Maness", "Squidji", "Stavo",
  "Still Fresh", "Sultan", "T-Matt", "TK", "Tandem", "Tiers Monde",
  "Tiitof", "Tiiwtiw", "Timal", "Tino", "Toko Blaze", "Tony Montana",
  
  // Légendes et classiques (300-400)
  "Tsr Crew", "Tunisiano", "Tyna", "Uzi", "V2", "Vald", "Vaï", "Vegedream",
  "Volts Face", "Vyp", "Wadyy", "Wallen", "Wejdene", "Werenoi", "Wilfrido",
  "Wojtek", "X.V", "Xan", "XIII", "YBN", "YL", "Yaro", "Yelli", "Youssoupha",
  "Yuzmv", "Zed", "Zefor", "Zekwé Ramos", "Zifukoro", "Zola", "Zoxea",
  "113", "1995", "2Bal", "3010", "4Keus Gang", "5 Majeur", "6ix9ine",
  "7 Jaws", "8Ruki", "92i", "Akhenaton", "Alibi Montana", "Alpha 5.20",
  "Alonzo", "Amel Bent", "Anas", "AP", "Apash", "Arma Jackson", "ARS",
  "Arsenik", "Ateyaba", "ATK", "Axel Tony", "Azrock", "B.James", "Badjer",
  
  // Nouveaux talents et rappeurs underground (400-500)
  "Bakari", "Balti", "Bana C4", "Banlieuz'Art", "Barack Adama", "Benash",
  "Benzz", "Big Flo & Oli", "Bilel", "Billy", "Bisso Na Bisso", "Black M",
  "Black Kent", "Blacko", "Blanka", "Boef", "Bonnie Banane", "Booba", "Boss",
  "Brav", "Brulux", "Bushi", "Busta Flex", "C-Sen", "Caballero & JeanJass",
  "Capo", "Casseurs Flowters", "Cedric", "Chaman", "Chiens De Paille",
  "Chilla", "Chris", "Cinco", "Civilized", "Claudio Capéo", "Columbine",
  "Croma", "Dadoo", "Davodka", "Despo Rutti", "Diam's", "Disiz",
  "Django", "Don Choa", "Dr. Beriz", "Drapeau Blanc", "DTF", "Dub Inc",
  "Dub Inc", "Duc", "Dulce", "Dwa", "E2S", "Edge", "El Matador", "Eloquence",
  "Emkal", "Esken", "Expression Direkt", "F430", "Fabe", "FAB", "Fianso",
  "Flynt", "Fonky Family", "Furax Barbarossa", "G-Style", "Georgio", "GGolden",
  "Ghetto Phénomène", "GLK", "Gringe", "Grodash", "Guizmo", "Hatik"
];

// Fonction pour obtenir un rappeur aléatoire
function getRandomRapper() {
  const randomIndex = Math.floor(Math.random() * frenchRappers.length);
  return frenchRappers[randomIndex];
}

module.exports = { getRandomRapper, frenchRappers };
