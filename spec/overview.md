# Projekt-Spezifikation — Übersicht

## Ziel

Deutschsprachige Lern-Web-App für Kinder: Grössen-Umrechnungen und Deutsch-Übungen (Grammatik, Lesen, Artikel, Wörter ordnen, Diktat).

## Technologie-Stack

- **Frontend:** Vanilla JS, ESM-only, kein Framework, kein Bundler — Cloudflare Pages
- **Backend:** Cloudflare Workers + D1 (SQLite) — REST-API für User- und Aktivitätsdaten
- **Tests:** Node.js Unit-Tests mit c8-Coverage, Playwright Smoke-Tests
- **Entry Point:** `main.js` — registriert alle Module und initialisiert Auth

## Architektur

### Module
Module sind Factory Functions, die `statsTracker` per Dependency Injection erhalten:

```javascript
const modul = createModule({ statsTracker: statsTrackerApi });
App.registerModule('modul-name', modul);
```

Aktive Module: `groessen`, `deutsch`, `deutsch-lesen`, `deutsch-artikel`, `deutsch-ordnen`, `deutsch-diktat`

### Auth & Session
- Benutzer werden über die Workers-API erstellt/eingeloggt
- Aktive Session in `sessionStorage` (`cdr74_current_user`)
- Login erforderlich, bevor Stats gespeichert werden (`requireLogin`)
- Benutzerverwaltung: `src/js/modules/auth/auth.js`, `auth-ui.js`

### Stats Tracking
- Jede Antwort wird getrackt: richtig = Score 10, falsch = Score 0
- Fehlerquote wird abgeleitet: `1 - totalScore / gamesPlayed / 10`
- Antwortzeiten in `localStorage` (`cdr74_response_times`)
- Aktivitätsdaten (aggregiert pro Tag/Modul) in Cloudflare D1
- Stats-Anzeige: Gesamtübersicht, 30-Tage-Aktivitätschart, Deutsch-Detailaufschlüsselung

### Backend (Cloudflare Workers)
- Worker URL: `https://cdr74-learning-api.christian-raess.workers.dev`
- DB-Schema: `workers/schema.sql`
  - Tabelle `users`: `id`, `username`, `created_at`
  - Tabelle `daily_activity`: aggregierte Tagesaktivität pro User/Modul
- API-Endpunkte: Users (GET/POST/DELETE), Login, Activity (POST), Daily Activity (GET)
- Validierung: `workers/utils/validation.js` — VALID_MODULES definiert erlaubte Modul-IDs

## Datenquellen (`src/data/`)

| Datei           | Wird verwendet von        |
|-----------------|---------------------------|
| `words.json`    | Grammatik-Übung           |
| `texts.json`    | Lese-Übung                |
| `artikel.json`  | Artikel-Übung             |
| `saetze.json`   | Wörter-ordnen-Übung       |
| `diktate.json`  | Diktat-Übung              |

## Tests

```bash
npm test          # Unit-Tests + c8 Coverage
npm run test:e2e  # Playwright Smoke-Tests
npm run serve     # Dev-Server → http://localhost:8000
```

Unit-Tests in `tests/unit/`, Playwright-Tests in `tests/`. Coverage-Report in `coverage/`.

## Deployment

- **Frontend:** automatisch bei Push auf `main` (Cloudflare Pages)
- **Backend:** `cd workers && wrangler deploy`
- Setup & Migration: `workers/README.md`
