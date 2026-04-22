# Deutsch — Lesen (Leseverständnis) — Spezifikation

Multiple-Choice Leseverständnis-Übungen mit kurzen Texten. Datengetrieben, klar testbare Logik, Stats Tracking per DI.

## Datenformat (`src/data/texts.json`)

```json
{
  "id": "string",
  "title": "string",
  "difficulty": "easy|medium|hard",
  "text": "string",
  "questions": [
    { "id": "string", "q": "string", "choices": ["..."], "answer": 0 }
  ]
}
```

## Modul API

`createModule({ statsTracker })` liefert ein Modul-Objekt mit:

- `init(dom)` — bindet UI-Elemente (`readingContent`, `scoreDisplay`, `feedbackDisplay`, `nextBtn`)
- `start(mode, difficulty)` — lädt `texts.json`, filtert nach `difficulty`, startet erste Text/Frage
- `_test` — (nur für Unit-Tests) pure helpers: `filterByDifficulty`, `pickTextPool`, `evaluateChoice`

## Verhalten

- Beim Start: Score auf 0; erstes Text-Fragment gerendert
- Benutzer beantwortet MC-Frage → sofortiges Feedback, +10 bei richtig, Buttons deaktiviert, `Nächste` erscheint
- `Nächste` lädt nächste Frage/Text; am Ende Ergebnisansicht
- Jede Antwort wird per `statsTracker.trackGameCompletion('deutsch-lesen', score)` getrackt

## Akzeptanzkriterien

- Modul lädt `src/data/texts.json` asynchron (fetch) und filtert nach `difficulty`
- `evaluateChoice` identifiziert korrekte Antworten zuverlässig anhand des `answer`-Index
- Punkte werden in `dom.scoreDisplay` korrekt angezeigt

## Testanforderungen

## Stats-Tracking

Nach jeder Antwort wird `statsTracker.trackGameCompletion('deutsch-lesen', score, state.currentDifficulty)` aufgerufen. `state.currentDifficulty` wird in `start(mode, difficulty)` gesetzt.

- `filterByDifficulty` gibt nur passende Einträge zurück
- `evaluateChoice` liefert `true` bei korrekter Indexwahl, `false` sonst
- Mock `fetch('src/data/texts.json')` und teste `start(difficulty)` flow: render → answer → score update → next
