# CLAUDE.md

## Workflow

After every code change:
1. **Specs & README aktualisieren** — alle betroffenen `spec/*.md`, `README.md` und dieses File auf dem neuesten Stand halten
2. **Tests ausführen und Ergebnis zeigen** — immer `npm test` ausführen und das Ergebnis im Chat anzeigen
3. Lokaler explorativer Test durch den User (`python -m http.server 8000`)
4. Commit & Deployment durch den User

## Projekt

Deutschsprachige Lern-Web-App für Kinder: Grössen-Umrechnungen und Deutsch-Übungen (Grammatik, Lesen, Artikel, Wörter ordnen, Diktat). Vanilla JS, kein Framework, kein Bundler, Cloudflare Pages.

```bash
npm test                   # Tests ausführen (immer nach Änderungen)
python -m http.server 8000 # Lokaler Dev-Server → http://localhost:8000
```

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

## Deployment

- **Frontend:** Cloudflare Pages, automatisch bei Push auf `main`
- **Backend:** Cloudflare Workers + D1 — `cd workers && wrangler deploy`
- Worker URL: https://cdr74-learning-api.christian-raess.workers.dev
- Setup & Migration: `workers/README.md`
