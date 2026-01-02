# cdr74.github.io — Lern-Website

Kurzes Developer-Readme

- Startseite: `index.html` (statisch)
- Quellcode: `src/` enthält neue module und Daten
- Daten: `src/data/words.json` hält Wortlisten für `Deutsch`-Übung
- Tests: `npm test` führt leichte Node-Runner-Tests aus

Vorschläge zum Weitermachen:
- Module schrittweise in `src/js/modules/` migrieren und `german.js` refactoren, damit es `german-core` verwendet.
- CI: `.github/workflows/ci.yml` hinzufügen, um `npm test` auszuführen.


