# Deutsch — Spezifikation

## Übungstypen

### Grammatik (`grammar`)
- Wortarten zuordnen
- Schwierigkeiten:
  - `easy`: Nomen, Artikel, Verb, Adjektiv
  - `medium`: + Pronomen, Präposition
  - `hard`: + Adverb, Konjunktion
- Datenquelle: `src/data/words.json`
- Punktewertung: +10 pro richtig

### Lesen (`reading`)
- Leseverständnis mit Multiple-Choice-Fragen
- Datenquelle: `src/data/texts.json`
- Siehe `spec/deutsch-lesen.md` für Details

### Schreiben: Artikel (`artikel`)
- Nomen wird angezeigt, Kind wählt den richtigen Artikel (der/die/das)
- Datenquelle: `src/data/artikel.json` (Felder: `noun`, `article`, `difficulty`)
- 10 Fragen pro Runde, 10 Punkte pro richtige Antwort
- Pure helper: `evaluateArtikel(selected, correct)` → `{ correct, selected, expected }`

### Schreiben: Wörter ordnen (`woerter-ordnen`)
- Wörter eines Satzes werden gemischt angezeigt; Kind tippt Wörter in richtiger Reihenfolge an
- Datenquelle: `src/data/saetze.json` (Felder: `sentence`, `words`, `difficulty`)
- Interpunktion ist am Wort angehängt (z.B. `"gross."`)
- Pool-Area (gemischte Wörter) und Target-Area (zusammengesetzter Satz)
- Pure helpers: `shuffleWords(words)`, `evaluateSentence(assembled, correct)`

### Schreiben: Diktat (`diktat`)
- Wort/Satz wird kurz angezeigt (mit visuellem Timer-Balken), dann verdeckt; Kind tippt aus Erinnerung
- Datenquelle: `src/data/diktate.json` (Felder: `text`, `type`, `difficulty`)
- Timer: Wort easy=5s/medium=4s/hard=3s; Satz easy=8s/medium=6s/hard=4s
- Vergleich ist **strikt** (Gross-/Kleinschreibung beachtet, nur Whitespace getrimmt)
- Pure helpers: `getTimerDuration(type, difficulty)`, `evaluateDiktat(input, expected)`

Verbesserte Spezifikation — Deutsch Modul

- Ziel: eine datengetriebene, erweiterbare Grammatik-Übung für Kinder, die klares visuelles Feedback gibt und leicht erweiterbar ist.
- Module-API: `init(dom)` und `start(mode, difficulty)`; `start` rendert die Übung und lädt Fragen asynchron.
- Datenquelle: `src/data/words.json` enthält Tupel `[word, type]`. Tests und UI erwarten normalisierte Typen (z. B. `nomen`, `adjektiv`).
- Verhalten:
  - Beim Laden werden Einträge nach Difficulty gefiltert (siehe `DIFFICULTY_TYPES`).
  - Optionen, die nicht in der aktuellen Wortliste vorkommen, werden ausgeblendet.
  - Nach jeder Auswahl wird Feedback angezeigt; ein `Nächste`-Button führt zur nächsten Frage.
  - Am Ende wird eine Ergebnisseite angezeigt mit Gesamtpunktzahl und Zurück‑Button.
- Akzeptanzkriterien (erweitert):
  - Die Übung lädt `src/data/words.json` asynchron und zeigt "Lade Aufgaben..." solange noch nichts verfügbar ist.
  - Alle angezeigten Wortarten müssen zu den erlaubten Typen der gewählten Difficulty gehören.
  - Die UI deaktiviert Optionsbuttons nach einer Auswahl und zeigt korrektes/falsches Feedback.
  - Punkte werden korrekt aufsummiert und in `dom.deutschScoreDisplay` angezeigt.
  - Das Modul verwendet die gemeinsamen Helfer (`window.GermanCore` / `german-core.js`) wenn verfügbar; andernfalls arbeitet es mit der eingebetteten Fallback‑CORE.

Testhinweise:
- Unit tests should validate `filterWordpool` behavior (already covered), the `renderSkeleton()` output shape, and `showQuestion()` logic by mocking DOM and word lists.
- Integration tests should mock `fetch('src/data/words.json')` to exercise async loading, filtering, and full exercise flow.
