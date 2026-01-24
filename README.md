# cdr74.github.io — Lern-Website

## 📚 Features

- **Grössen-Übungen:** Einheiten-Umrechnung (Längen, Flächen, Volumen)
- **Deutsch-Übungen:** Grammatik, Leseverständnis
- **Benutzer-System:** Login, Statistik-Tracking
- **Modulare Architektur:** Testbare, erweiterbare Komponenten

## 🚀 Schnellstart

```bash
# Tests ausführen
npm test

# Lokal entwickeln
python -m http.server 8000
# → http://localhost:8000
```

## 📁 Struktur

- `index.html` - Hauptseite
- `app.js` - Core Navigation
- `app-auth.js` - Auth Integration
- `math.js` - Grössen-Modul
- `german.js` - Deutsch-Modul
- `src/js/modules/` - Wiederverwendbare Module (ESM)
- `src/data/` - JSON-Daten (Wörter, Texte)
- `tests/` - Unit-Tests

## 🧪 Tests

```bash
npm test          # Alle Tests (empfohlen)
npm run test:legacy  # Legacy Tests
```

**Test-Coverage:**
- ✅ german-core.js (normalizeType, filterWordpool, shuffle)
- ✅ deutsch-lesen.js (filterByDifficulty, pickTextPool, evaluateChoice)
- ✅ auth.js (createUser, login, stats, delete)

## 👤 Benutzer-System

**Features:**
- User-Management (Create, Login, Logout)
- Statistik pro Modul (Spiele, Punkte, Durchschnitt)
- LocalStorage-Persistenz

**Statistiken:**
- Anzahl gespielter Sessions
- Gesamt-Punkte
- Durchschnittliche Punktzahl
- Letzte Aktivität

## 📖 Dokumentation

- `IMPLEMENTATION_GUIDE.md` - Schritt-für-Schritt Integration
- `ARCHITECTURE.md` - Modulstruktur, Datenflüsse
- `.github/agents/js-test-wizard.agent.md` - Test-Automation (Draft)

## 🔧 Entwicklung

**Module hinzufügen:**
1. Erstelle `src/js/modules/mein-modul.js`
2. Exportiere Funktionen (ESM)
3. Registriere in `app.js`: `App.registerModule('name', modul)`
4. Schreibe Tests in `tests/unit/mein-modul.test.js`

**Daten hinzufügen:**
- Wörter: `src/data/words.json` (Array: `[word, type]`)
- Texte: `src/data/texts.json` (Objekte mit `difficulty`, `questions`)

## 🚢 Deployment

- **GitHub Pages:** Automatisch bei push zu `main`
- **URL:** https://cdr74.github.io/
- **Kein Build:** Statische Files, direkt auslieferbar

## 🎯 Roadmap

- [x] Modulare Test-Struktur
- [x] Benutzer-Login & Statistik
- [x] ESM-Migration (reine ESM-Architektur, keine `.browser.js` Duplikate)
- [x] Stats-Tracking in math.js/german.js integrieren
- [ ] Export/Import von User-Daten
- [ ] Erweiterte Metriken (Fehlerquote, Zeit)

## 🤝 Beitragen

1. Tests schreiben: `tests/unit/mein-feature.test.js`
2. Module dokumentieren: JSDoc-Kommentare
3. Code-Style: 2 Spaces, Semikolons optional


