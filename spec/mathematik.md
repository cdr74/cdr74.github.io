# Mathematik (Grössen) — Spezifikation

Modul für Einheiten-Umrechnungs-Übungen (Länge, Fläche, Volumen). Zielgruppe: Kinder/Schüler.

## Zweck

Interaktive Aufgaben zum Umrechnen zwischen Einheiten (mm, cm, dm, m, km; mm², cm², ...; mm³, cm³, ...).

## Öffentliche API

`createGroessenModule({ statsTracker })` liefert ein Modul mit:

- `init(dom)` — bindet DOM-Elemente (`scoreDisplay`, `valueDisplay`, `unitFromDisplay`, `unitToDisplay`, `userInput`, `checkBtn`, `nextBtn`, `feedbackDisplay`)
- `startGame(mode, difficulty)` — konfiguriert (`mode` ∈ `{distance, area, volume}`, `difficulty` ∈ `{easy, medium, hard}`), setzt Score zurück, startet erste Aufgabe

Registrierung: `App.registerModule('groessen', module)` in `main.js`.

## Datenmodell

Einheiten als interne Liste von `{ name, factor }` (Faktor relativ zur Basiseinheit, z.B. m = 1). Keine externe JSON-Datei.

## Verhalten

- `startGame` setzt `currentScore = 0` und ruft `generateProblem()` auf
- `generateProblem()` wählt zwei verschiedene Einheiten derselben Kategorie:
  - `easy`: benachbarte Einheiten, ganzzahlige Werte
  - `medium`/`hard`: Dezimalwerte, grössere Bereiche
- Eingabe akzeptiert `,` oder `.` als Dezimaltrennzeichen
- `check` vergleicht mit Epsilon (1e-4); bei richtig: +10 Punkte; bei falsch: Feedback mit formatiertem Ergebnis (Dezimaltrennzeichen `,`)
- Nach Antwort: Eingabe deaktiviert, `Nächste` erscheint
- Jede Antwort wird per `statsTracker.trackGameCompletion('groessen', score)` getrackt

## Akzeptanzkriterien

- `generateProblem()` liefert stets eine sinnvolle Zahl und zwei verschiedene Einheiten
- `checkAnswer()` toleriert Rundungsabweichungen und zeigt lokalisiertes Ergebnis
- Punktestand wird korrekt in `dom.scoreDisplay` aktualisiert

## Testanforderungen

- Konversion: `convert(value, fromFactor, toFactor)` — mathematische Korrektheit
- `generateProblem()` — Einheitenauswahl und Wertebereiche pro Difficulty
- `checkAnswer()` — kommastellige Eingaben, Rundungsfehler
- DOM-Integration: Modul mit gemocktem `dom` initialisieren, `startGame` aufrufen, Eingabe simulieren

## Beispiele

- `startGame('distance', 'easy')` → Aufgabe: `100 cm = ? m` (Antwort: `1`)
- `startGame('volume', 'hard')` → Aufgabe: `2,375 m³ = ? dm³` (Antwort: `2375`)
