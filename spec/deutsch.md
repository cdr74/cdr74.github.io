# Deutsch — Spezifikation

## Übungstypen

### Grammatik (`deutsch-grammatik`)
- Wortarten zuordnen (Multiple Choice)
- Schwierigkeiten:
  - `easy`: Nomen, Artikel, Verb, Adjektiv
  - `medium`: + Pronomen, Präposition
  - `hard`: + Adverb, Konjunktion
- Datenquelle: `src/data/words.json` — Tupel `[word, type]`
- Punkte: +10 pro richtige Antwort
- Pure helpers: `filterWordpool(words, difficulty)`, Logik in `src/js/modules/german-core.js`

### Lesen (`deutsch-lesen`)
- Leseverständnis mit Multiple-Choice-Fragen zu kurzen Texten
- Datenquelle: `src/data/texts.json`
- Siehe `spec/deutsch-lesen.md` für Details

### Artikel (`deutsch-artikel`)
- Nomen wird angezeigt, Kind wählt den richtigen Artikel (der/die/das)
- Datenquelle: `src/data/artikel.json` (Felder: `noun`, `article`, `difficulty`)
- 10 Fragen pro Runde, 10 Punkte pro richtige Antwort
- Pure helper: `evaluateArtikel(selected, correct)` → `{ correct, selected, expected }`

### Wörter ordnen (`deutsch-ordnen`)
- Wörter eines Satzes werden gemischt angezeigt; Kind tippt Wörter in richtiger Reihenfolge an
- Datenquelle: `src/data/saetze.json` (Felder: `sentence`, `words`, `difficulty`)
- Interpunktion ist am Wort angehängt (z.B. `"gross."`)
- Pool-Area (gemischte Wörter) und Target-Area (zusammengesetzter Satz)
- Pure helpers: `shuffleWords(words)`, `evaluateSentence(assembled, correct)`

### Diktat (`deutsch-diktat`)
- Wort/Satz wird kurz angezeigt (mit visuellem Timer-Balken), dann verdeckt; Kind tippt aus Erinnerung
- Datenquelle: `src/data/diktate.json` (Felder: `text`, `type`, `difficulty`)
- Timer: Wort easy=5s / medium=4s / hard=3s; Satz easy=8s / medium=6s / hard=4s
- Vergleich ist **strikt** (Gross-/Kleinschreibung beachtet, nur Whitespace getrimmt)
- Pure helpers: `getTimerDuration(type, difficulty)`, `evaluateDiktat(input, expected)`

## Gemeinsames Verhalten

- Module erhalten `statsTracker` per Dependency Injection
- Jede Antwort wird getrackt: `trackGameCompletion(modulName, 10)` oder `trackGameCompletion(modulName, 0)`
- Antwortzeit wird gespeichert: `saveResponseTime(modulName, elapsedMs)`
- Login ist erforderlich bevor Stats gespeichert werden (`requireLogin`)
- Nach jeder Auswahl: sofortiges Feedback, Buttons deaktiviert, `Nächste`-Button erscheint
- Am Ende: Ergebnisseite mit Gesamtpunktzahl und Zurück-Button

## Modul-IDs (für Worker-Validierung und Auth-UI)

Alle IDs müssen in `workers/utils/validation.js` (`VALID_MODULES`) und `auth/auth-ui.js` (`MODULE_CONFIG`, `MODULE_ORDER`) eingetragen sein.

| Übung          | Modul-ID            |
|----------------|---------------------|
| Grammatik      | `deutsch-grammatik` |
| Lesen          | `deutsch-lesen`     |
| Artikel        | `deutsch-artikel`   |
| Wörter ordnen  | `deutsch-ordnen`    |
| Diktat         | `deutsch-diktat`    |
