# 🚶 Ashra Route

Ashra Route er en mobilapplikation udviklet i **React Native med Expo**, som hjælper brugeren med at generere intelligente gå-ruter baseret på et ønsket antal skridt.

I stedet for blot at navigere fra A til B forsøger appen at skabe en route, som passer til brugerens mål og samtidig kan inkludere interessante steder som parker, strande og supermarkeder.

---

# ✨ Funktioner

## Nuværende funktioner

- 📍 Henter brugerens aktuelle lokation
- 🗺️ Viser et interaktivt kort
- 🚶 Vælg antal skridt
- 🌳 Generér en rundtur gennem en park
- 📏 Beregner estimeret distance og tid
- 📍 Viser den valgte destination på kortet
- 📈 Intelligent valg af destination baseret på ønsket distance
- ⚡ Caching af nærliggende steder for hurtigere ruteplanlægning

---

# 🚧 Kommende funktioner

- 🏖️ Ruter gennem strande
- 🛒 Ruter gennem supermarkeder
- ☕ Ruter gennem caféer
- 🌲 Flere destinationer på samme rute
- 🎯 Mere præcis ruteplanlægning
- ❤️ Gem favorit-ruter
- 📊 Historik over tidligere gåture

---

# 🛠️ Teknologier

Projektet er udviklet med:

- React Native
- Expo
- TypeScript
- NativeWind
- React Native Maps
- Expo Location
- Axios
- OpenStreetMap (Overpass API)
- OpenRouteService

---

# 📂 Projektstruktur

```text
src/
│
├── components/
├── hooks/
├── screens/
├── services/
├── types/
├── utils/
└── constants/
```

---

# 🚀 Installation

Klon projektet

```bash
git clone https://github.com/DIT_BRUGERNAVN/ashra-route-app.git
```

Gå ind i projektet

```bash
cd ashra-route-app
```

Installer afhængigheder

```bash
npm install
```

Start Expo

```bash
npx expo start
```

---

# 🔑 Miljøvariabler

Opret en `.env` fil i projektets rod.

Eksempel:

```env
EXPO_PUBLIC_ORS_API_KEY=DIN_API_NØGLE
```

API-nøglen kan oprettes gratis hos OpenRouteService.

---

# 📌 Projektets mål

Målet med Ashra Route er at gøre daglige gåture mere interessante ved automatisk at generere ruter, som matcher brugerens ønskede antal skridt og passerer relevante destinationer undervejs.

På længere sigt skal appen kunne optimere ruter ud fra flere kriterier såsom:

- Parker
- Strande
- Supermarkeder
- Caféer
- Søer
- Legepladser
- Udsigtspunkter

samt vælge den bedst mulige kombination af destinationer.

---

# 👨‍💻 Udvikler

Udviklet af Mohammad Murtada.

Projektet udvikles løbende med fokus på god arkitektur, skalerbarhed og en god brugeroplevelse.

---

# 📄 Licens

Dette projekt er udviklet til læring og videreudvikling.