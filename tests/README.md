Tests
-----

## Unit-Tests (schnell, kein Browser)

```bash
npm test
```

Führt alle Unit-Tests mit Node aus und gibt c8-Coverage aus. Kein Browser, keine Dependencies ausser `c8`.

Der Runner (`tests/test-runner.js`) importiert alle Suiten unter `tests/unit/`:

- `german-core.test.js` — normalizeType, filterWordpool, shuffle
- `deutsch-lesen.test.js` — filterByDifficulty, pickTextPool, evaluateChoice
- `deutsch-artikel.test.js` — evaluateArtikel
- `deutsch-ordnen.test.js` — shuffleWords, evaluateSentence
- `deutsch-diktat.test.js` — getTimerDuration, evaluateDiktat
- `auth.test.js` — übersprungen (benötigt API-Backend)

Coverage-Bericht als HTML:
```bash
npm run coverage   # → coverage/index.html
```

## E2E-Tests / Smoke-Tests (Playwright, Chromium)

```bash
npm run test:e2e
```

Startet automatisch einen lokalen Dev-Server und führt 21 Browser-Tests durch (~8s). Erfordert Chromium (via `npx playwright install chromium`) sowie die System-Bibliothek `libasound2t64` auf Ubuntu/Debian.

Tests unter `tests/e2e/`:

- `page-load.spec.js` — Seitentitel, Header, Login-Button, Startmenü-Buttons
- `navigation.spec.js` — Grössen/Deutsch-Navigation, Zurück-Button, Anmelde-Seite
- `deutsch-exercises.spec.js` — Alle 5 Deutsch-Übungsmodi + Redirect ohne Login

Die E2E-Tests fangen UI-Regressionen ab (z.B. fehlender Titel), die Unit-Tests nicht sehen.
