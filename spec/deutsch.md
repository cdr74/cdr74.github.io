# Deutsch — Spezifikation

- Übungstypen: `grammar` (Wortarten zuordnen), später: `artikel`, `satzbau`, `konjugation`
- Schwierigkeiten:
  - `easy`: Nomen, Artikel, Verb, Adjektiv
  - `medium`: + Pronomen, Präposition
  - `hard`: + Adverb, Konjunktion
- Akzeptanzkriterien:
  - Beim Start einer Grammatik-Übung werden nur erlaubte Wortarten angezeigt.
  - Wortlisten sind in `src/data/words.json` wartbar.
  - Punktewertung: +10 pro richtig.

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
