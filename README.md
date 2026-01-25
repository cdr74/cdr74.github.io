# cdr74-github-io — Lern-Website

## 📚 Features

- **Grössen-Übungen:** Einheiten-Umrechnung (Längen, Flächen, Volumen)
- **Deutsch-Übungen:** Grammatik, Leseverständnis
- **Benutzer-System:** Cloud-basiertes Login, Statistik-Tracking mit Cloudflare D1
- **Tägliche Aktivitäts-Verfolgung:** Aggregierte Statistiken pro Tag und Modul
- **Modulare Architektur:** Testbare, erweiterbare Komponenten (Pure ESM)

## 🚀 Schnellstart

**Frontend:**
```bash
# Tests ausführen
npm test

# Lokal entwickeln
python -m http.server 8000
# → http://localhost:8000
```

**Backend (Optional):**
```bash
# Worker lokal testen
cd workers
wrangler dev
# → http://localhost:8787

# Worker deployen
wrangler deploy
```

Siehe `workers/README.md` für vollständige Backend-Setup-Anleitung.

## 📁 Struktur

**Frontend (Cloudflare Pages):**
- `index.html` - Hauptseite
- `main.js` - ESM Entry Point, Dependency Injection
- `app.js` - Core Navigation
- `app-auth.js` - Auth Integration
- `math.js` - Grössen-Modul
- `german.js` - Deutsch-Modul
- `src/js/modules/` - Wiederverwendbare Module (ESM)
  - `api-client.js` - API-Client für Cloudflare Worker
  - `auth/` - User-Management, Stats-Tracking
  - `german-core.js`, `deutsch-lesen.js` - Deutsch-Logik
- `src/data/` - JSON-Daten (Wörter, Texte)
- `tests/` - Unit-Tests

**Backend (Cloudflare Workers):**
- `workers/index.js` - Worker Entry Point, API Router
- `workers/handlers/` - API Endpoint Handlers
  - `users.js` - User-Management
  - `activity.js` - Aktivitäts-Tracking
  - `session.js` - Login-Logik
- `workers/schema.sql` - D1 Datenbankschema
- `workers/wrangler.toml` - Worker-Konfiguration

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
- Cloud-basiertes User-Management (Create, Login, Logout, Delete)
- Statistik pro Modul (Spiele, Punkte, Durchschnitt)
- **Cloudflare D1 Datenbank** - Persistenz über Geräte hinweg
- **Tägliche Aktivitäts-Aggregation** - Effiziente Speicherung pro Tag/Modul

**Statistiken:**
- Anzahl gespielter Sessions (pro Tag/Modul aggregiert)
- Gesamt-Punkte
- Durchschnittliche Punktzahl
- Letzte Aktivität
- 30-Tage Aktivitäts-Historie

**API Endpoints:**
- `POST /api/users` - User erstellen
- `POST /api/session/login` - Login
- `GET /api/users/:username` - User + Stats abrufen
- `POST /api/users/:username/activity` - Aktivität aufzeichnen
- `GET /api/users/:username/daily-activity` - Tägliche Aktivität abrufen
- `DELETE /api/users/:username` - User löschen

## 📖 Dokumentation

- `CLAUDE.md` - Projekt-Übersicht für Claude Code
- `workers/README.md` - Cloudflare Worker Setup & Deployment
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

**Frontend (Cloudflare Pages):**
- Automatisch bei push zu `main`
- URL: https://cdr74-github-io.pages.dev/
- Kein Build: Statische Files, direkt auslieferbar

**Backend (Cloudflare Workers):**
- Deploy: `cd workers && wrangler deploy`
- Worker URL: https://cdr74-learning-api.christian-raess.workers.dev
- D1 Datenbank: `wrangler d1 execute` für Schema-Updates
- Siehe `workers/README.md` für Setup-Anleitung

## 🎯 Roadmap

- [x] Modulare Test-Struktur
- [x] Benutzer-Login & Statistik
- [x] ESM-Migration (reine ESM-Architektur, keine `.browser.js` Duplikate)
- [x] Stats-Tracking in math.js/german.js integrieren
- [x] Cloud-Backend mit Cloudflare Workers + D1
- [x] Tägliche Aktivitäts-Aggregation
- [x] Multi-Device Sync (via Cloud-Backend)
- [ ] Erweiterte Metriken (Fehlerquote, Zeit)
- [ ] Visualisierung der täglichen Aktivität (Charts)

## 🤝 Beitragen

1. Tests schreiben: `tests/unit/mein-feature.test.js`
2. Module dokumentieren: JSDoc-Kommentare
3. Code-Style: 2 Spaces, Semikolons optional


