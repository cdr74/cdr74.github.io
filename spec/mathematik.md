```markdown
# Mathematik (Groessen) — Spezifikation

Kurz: Modul für Einheiten-Umrechnungs-Übungen (Länge, Fläche, Volumen). Zielgruppe: Kinder/Schüler; Fokus auf einfachem UX, datengetriebener Aufgabenstellung und gut testbarer Logik.

## Zweck
- Interaktive Aufgaben zum Umrechnen zwischen Einheiten (mm, cm, dm, m, km; mm², cm², ...; mm³, cm³, ...).
- Lernziele: Verständnis von Maßstabsfaktoren, Stellenwertsystem und Dezimalzahlen.

## Öffentliche API
- `init(dom)` — empfängt eine DOM-Helper-Struktur (scoreDisplay, valueDisplay, unitFromDisplay, unitToDisplay, userInput, checkBtn, nextBtn, feedbackDisplay) und bindet UI-Handler.
- `startGame(mode, difficulty)` — konfiguriert (`mode` ∈ {`distance`,`area`,`volume`}, `difficulty` ∈ {`easy`,`medium`,`hard`}), setzt Score zurück und startet die erste Aufgabe.

Hinweis: Module soll sich selbst bei `App.registerModule('groessen', module)` registrieren (oder über `App`/`app.js` geladen werden).

## Datenmodell
- Interne Definition von Einheiten als Liste von { name, factor } (Faktor in Basis‑Einheit, z. B. m = 1).
- Option: externe JSON `src/data/units.json` ermöglichen, aber Standard-Implementierung hält Faktoren im Modul für Einfachheit.

## Verhalten / UX
- `startGame` setzt `currentScore = 0` und ruft `generateProblem()`.
- `generateProblem()` wählt zwei unterschiedliche Einheiten derselben Kategorie; für `easy` bevorzugt benachbarte Einheiten und ganzzahlige, leicht zu rechnende Werte; für `medium`/`hard` Dezimalwerte und größere Bereiche.
- UI zeigt: `value`, `unitFrom`, `unitTo`, ein numerisches Eingabefeld akzeptiert `,` oder `.` als Dezimaltrennzeichen.
- `check` vergleicht mit `correctAnswer` innerhalb eines kleinen Epsilons (z. B. 1e-4); bei richtig: +10 Punkte, positives Feedback; bei falsch: Feedback mit formatiertem Ergebnis (Dezimaltrennzeichen = `,`).
- Nach Antwort wird Eingabe deaktiviert, `Nächste` sichtbar; `Nächste` löst `generateProblem()` aus.

## Akzeptanzkriterien
- Modul exportiert/registriert die API und arbeitet mit `App` zusammen.
- `generateProblem()` liefert stets eine sinnvolle, interpretierbare Zahl und zwei verschiedene Einheiten.
- `checkAnswer()` toleriert minimale Rundungsabweichungen und zeigt lokalisiertes Ergebnis.
- Punktestand wird korrekt in `dom.scoreDisplay` aktualisiert.

## Testanforderungen
- Unit tests für:
  - Konversion: reine Funktion `convert(value, fromFactor, toFactor)` prüft mathematische Korrektheit.
  - `generateProblem()` Grenzen: Einheitenauswahl, Wertebereiche pro Difficulty.
  - `checkAnswer()` mit Grenzfällen (kommastellige Eingaben, Rundungsfehler).
  - DOM-Integration: Modul mit mocked `dom` initialisieren, `startGame` aufrufen, Eingabe simulieren, Ergebnis prüfen.
- Integrationstest: browser-shim / App-Registration (wie bereits für `german-core`).

## Migrations- / Refactoring-Hinweise
- Extrahiere reine Funktionen (`convert`, `formatNumber`, `selectUnits`, `generateProblem`) nach `src/js/modules/groessen-core.js` für bessere Testbarkeit.
- Halte DOM-Code dünn: nur `init`/`bind`/`render` in der Entry‑Datei (`math.js`).
- Ergänze CI (GitHub Actions) mit `npm test` und Coverage (nyc) bevor größere Refactorings.

## Beispiele
- `startGame('distance','easy')` → mögliche Aufgabe: `100 cm = ? m` (Antwort `1`).
- `startGame('volume','hard')` → Aufgabe mit Dezimal: `2.375 m³ = ? dm³` (Antwort `2375`).

```
