```markdown
# Deutsch — Lesen (Leseverständnis) — Spezifikation

Kurz: Multiple‑Choice Leseverständnis‑Übungen mit kurzen Texten. Ziel ist ein leicht erweiterbares, barrierearmes Modul mit klarer API und einfacher Testbarkeit.

## Datenformat
- `src/data/texts.json` enthält Einträge:
  - `id`: string
  - `title`: string
  - `difficulty`: `easy|medium|hard`
  - `text`: string (kurzer Abschnitt)
  - `questions`: array von { `id`, `q`, `choices` (array), `answer` (index) }

## Modul API
- `createModule()` (factory) liefert ein Modul-Objekt mit:
  - `init(dom)` — bindet UI-Elemente (z. B. `readingContent`, `scoreDisplay`, `feedbackDisplay`, `nextBtn`).
  - `start(mode, difficulty)` — lädt `texts.json`, filtert nach `difficulty`, startet mit der ersten Text/Frage.
  - `_test` — (nur für Unit‑Tests) pure helpers: `filterByDifficulty`, `pickTextPool`, `evaluateChoice`.

## Verhalten
- Beim Start: Score wird auf 0 gesetzt; erstes Text‑Fragment gerendert.
- Benutzer beantwortet MC‑Frage; das Modul zeigt sofort Feedback, aktualisiert Punkte (+10 korrekt), deaktiviert weitere Auswahl und zeigt `Nächste`.
- `Nächste` lädt die nächste Frage/Text; bei Ende kann eine Ergebnisansicht gezeigt werden.

## Akzeptanzkriterien
- Modul lädt `src/data/texts.json` erfolgreich im Browser (fetch) und filert nach `difficulty`.
- `evaluateChoice` identifiziert korrekte Antworten zuverlässig anhand des `answer`-Index.
- Punkte werden in `dom.scoreDisplay` korrekt angezeigt.
- UI ist keyboard‑bedienbar und die Buttons haben ausreichend ARIA/Labels.

## Testanforderungen
- Unit tests:
  - `filterByDifficulty` gibt nur passende Einträge zurück.
  - `evaluateChoice` liefert true bei korrekter Indexwahl und false sonst.
  - `pickTextPool` liefert Kopie/Shuffle‑optionen (falls implementiert).
- Integration tests:
  - Mock `fetch('src/data/texts.json')` und test `start(difficulty)` flow: render → answer → score update → next.

## Implementationshinweise
- Trenne Logik (select/evaluate) von DOM‑Glue; exportiere helpers für unit tests.
- Browser shim `src/js/modules/deutsch-lesen.browser.js` stellt die helpers auf `window.DeutschLesen` bereit und registriert das Modul automatisch mit `App` falls vorhanden.
- Accessibility: ensure options are focusable buttons; `aria-live` on `feedbackDisplay`.

```
