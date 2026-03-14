Erstelle ein neues Deutsch-Sub-Übungsmodul mit dem Namen "$ARGUMENTS".

Führe folgende Schritte durch:

1. **Modul-Datei** erstellen: `src/js/modules/deutsch-$ARGUMENTS.js`
   - Factory Function `createModule({ statsTracker })` exportieren
   - `init(dom)` und `start(mode, difficulty)` implementieren
   - `statsTracker.trackGameCompletion('deutsch-$ARGUMENTS', score)` bei jeder Antwort aufrufen
   - `statsTracker.saveResponseTime('deutsch-$ARGUMENTS', elapsedMs)` aufrufen
   - `_test` Objekt mit pure helpers für Unit-Tests exportieren

2. **main.js** aktualisieren:
   - Import hinzufügen: `import { createModule as createDeutsch$ARGUMENTS } from './src/js/modules/deutsch-$ARGUMENTS.js';`
   - Modul instanziieren mit: `createDeutsch$ARGUMENTS({ statsTracker: statsTrackerApi })`
   - Als Parameter an `createDeutschModule(...)` übergeben

3. **workers/utils/validation.js** — `'deutsch-$ARGUMENTS'` zu `VALID_MODULES` hinzufügen

4. **src/js/modules/auth/auth-ui.js** — Eintrag in `MODULE_CONFIG` und `MODULE_ORDER` hinzufügen

5. **Daten-Datei** erstellen: `src/data/$ARGUMENTS.json` mit passendem Schema

6. **Unit-Test** erstellen: `tests/unit/deutsch-$ARGUMENTS.test.js`

7. **spec/deutsch.md** aktualisieren — neuen Übungstyp dokumentieren

8. Danach Erinnerung ausgeben:
   > ⚠️  Manuelle Schritte erforderlich:
   > - Worker deployen: `cd workers && wrangler deploy --env=""`
   > - DB-Migration: `module_check` Constraint in Remote-DB aktualisieren (siehe workers/README.md → "DB Migration")
   > - Ohne diese Schritte werden Aktivitäten nicht gespeichert (500-Fehler, stiller Datenverlust)

9. `npm test` ausführen und Ergebnis zeigen
