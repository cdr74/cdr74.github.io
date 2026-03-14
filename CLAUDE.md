# CLAUDE.md

## Session-Start

Zu Beginn jeder neuen Konversation: Verfügbare Slash Commands kurz auflisten.

## Workflow

After every code change:
1. **Specs & README aktualisieren** — alle betroffenen `spec/*.md`, `README.md` und dieses File auf dem neuesten Stand halten
2. **Tests ausführen und Ergebnis zeigen** — immer `npm test` ausführen und das Ergebnis im Chat anzeigen
3. Lokaler explorativer Test durch den User (`npm run serve`)
4. Commit & Deployment durch den User

## Projekt

Deutschsprachige Lern-Web-App für Kinder: Grössen-Umrechnungen und Deutsch-Übungen (Grammatik, Lesen, Artikel, Wörter ordnen, Diktat). Vanilla JS, kein Framework, kein Bundler, Cloudflare Pages.

```bash
npm test                   # Unit-Tests + c8 Coverage (immer nach Änderungen)
npm run coverage           # HTML Coverage-Report → coverage/index.html
npm run test:e2e           # Playwright Smoke-Tests — vor Commits ausführen
npm run serve              # Lokaler Dev-Server → http://localhost:8000 (kein Cache)
```

**WSL2-Hinweis:** `npx playwright test --headed` und `--ui` benötigen einen X-Server. Alternativ: `npx playwright test --ui` öffnet sich im Browser unter `http://localhost:8080` ohne X-Server.

## Architektur — wichtige Konventionen

**ESM-only:** Alle Module als ES Modules, kein CommonJS, kein Bundler. `main.js` ist der Entry Point.

**Dependency Injection:** Module werden als Factory Functions erstellt und erhalten `statsTracker` als Parameter — nie direkt importieren.

```javascript
const groessenModule = createGroessenModule({ statsTracker: statsTrackerApi });
```

**Stats Tracking:** Jede Antwort wird getrackt — richtig mit Score 10, falsch mit Score 0. Die Fehlerquote wird daraus abgeleitet (`1 - totalScore / gamesPlayed / 10`), es gibt kein separates Fehler-Feld in der DB.

```javascript
statsTracker.trackGameCompletion('deutsch-grammatik', 10); // richtig
statsTracker.trackGameCompletion('deutsch-grammatik', 0);  // falsch
statsTracker.saveResponseTime('deutsch-grammatik', elapsed);
```

**Storage:** `sessionStorage` für die aktuelle User-Session (`cdr74_current_user`), `localStorage` für Antwortzeiten (`cdr74_response_times`), Cloudflare D1 für alle User- und Aktivitätsdaten.

**Neue Deutsch-Sub-Übung hinzufügen:**
1. Modulname in `workers/utils/validation.js` (`VALID_MODULES`) eintragen
2. Modulname in `auth/auth-ui.js` (`MODULE_CONFIG`, `MODULE_ORDER`) eintragen
3. Worker deployen: `cd workers && wrangler deploy --env=""`
4. DB-Migration: `module_check` Constraint in Remote-DB aktualisieren (siehe `workers/README.md` → "DB Migration")
5. Ohne Schritt 3+4 werden Aktivitäten für das neue Modul nicht gespeichert (500-Fehler, stiller Datenverlust)

**Sprache:** UI und Kommentare auf Deutsch.

## Skalierung erfordert ein Programm

Jede Aufgabe, die Skalierung erfordert (N Einträge, M Varianten, K Schwierigkeitsstufen), darf **nicht** direkt durch einen Agenten gelöst werden. Stattdessen: ein Programm schreiben, das die Multiplikation erledigt.

Beispiele für skalierbare Datenquellen:
- Sätze nach Schwierigkeit sortieren → öffentliches Buch (Gutenberg) einlesen, Sätze filtern
- Wortlisten → Wiktionary-Dump oder bestehende Korpora
- Aufgaben generieren → Template + Zufallsparameter

**Faustregel:** Wenn die Antwort "N × etwas" ist → erst das Programm, dann die Daten.

## Slash Commands

Projekt-spezifische Befehle (verfügbar als `/command-name`):

- `/new-modul <name>` — scaffoldet neues Deutsch-Sub-Übungsmodul (Datei, main.js, validation, auth-ui, Test, Spec)
- `/test-full` — führt Unit-Tests + Coverage + Playwright E2E aus
- `/deploy-worker` — begleitet Worker-Deployment mit Checkliste

## Agents

- `.github/agents/js-test-wizard.agent.md` — spezialisierter Agent zum Erstellen und Reparieren von Unit-Tests (`/run`, `/fix`, `/new`)

## Deployment

- **Frontend:** Cloudflare Pages, automatisch bei Push auf `main`
- **Backend:** Cloudflare Workers + D1 — `cd workers && wrangler deploy`
- Worker URL: https://cdr74-learning-api.christian-raess.workers.dev
- Setup & Migration: `workers/README.md`
