Projekt-Spezifikation — Übersicht

- Ziele: Interaktive Lernübungen (Grössen, Deutsch, ...)
- Modulare Architektur: `App.registerModule(name, module)`
- Daten-getriebene Übungen: Wortlisten / Einheiten in `src/data`
- Anforderungen: einfache Tests, CI, Deployment via GitHub Pages
 - Ziele: Interaktive, zugängliche Lernübungen (Grössen, Deutsch, ...)
 - Modulare Architektur: `App.registerModule(name, module)` — Module sollten eine kleine, testbare API (`init(dom)`, `start(...)`) bereitstellen.
 - Daten-getriebene Übungen: Wortlisten / Einheiten in `src/data` (JSON‑Fixtures als einzige Quelle für Inhalte)
 - Distribution vs. Source: Browser-ready entry scripts (`app.js`, `math.js`, `german.js`) live in the repo root; source modules live in `src/js/modules` (e.g. `german-core.js`). Consider a `dist/` folder for built artifacts in future.
 - Testing & CI: lightweight node tests in `tests/` validate core helpers. Add nyc and CI for coverage during refactors.

Mathematics module (Groessen)
- Purpose: provide unit-conversion exercises (distance, area, volume) as an independent, testable module.
- Public API: `init(dom)` — wire DOM controls (score, displays, input, buttons); `startGame(mode, difficulty)` — configure and start exercises.
- Data model: units and conversion factors are defined in-module (or optionally loaded from `src/data/units.json` in future).
- Behaviour and UX:
	- On `startGame`, score resets to 0 and the first problem is generated.
	- Problems present `value`, `unitFrom`, `unitTo` and accept numeric input (comma or dot accepted).
	- `easy` difficulty presents neighbor-unit conversions (e.g., cm ↔ m) with whole-number-friendly values.
	- `medium`/`hard` introduce non-trivial factors and decimal precision.
	- Correct answer awards +10 points and shows success feedback; incorrect reveals formatted correct answer.
- Acceptance criteria:
	- Module exposes the API and registers with `App` via `App.registerModule('groessen', module)` when loaded.
	- `generateProblem()` produces a valid numeric value and two different units within the selected mode.
	- Answer checking tolerates small floating point differences (epsilon) and formats the displayed correct answer using localized decimal separator (comma).
	- Unit tests cover conversion logic, problem generation boundaries, and UI-integration points using a mocked DOM.

Migration notes:
- When refactoring, extract pure logic (conversion factors, generateProblem, checkAnswer) into testable functions in `src/js/modules` and keep DOM glue small.
- Add CI workflow that runs `npm test` and a coverage reporter to prevent regressions.
