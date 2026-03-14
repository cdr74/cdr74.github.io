Begleite den Worker-Deployment-Prozess.

Prüfe zuerst ob es offene Änderungen in `workers/` gibt:
```bash
git diff --name-only workers/
```

Dann erinnere an die Deployment-Schritte und warte auf Bestätigung:

1. **Worker deployen:**
   ```bash
   cd workers && wrangler deploy --env=""
   ```

2. **Falls neue Module hinzugefügt wurden** — DB-Migration prüfen:
   - Wurde `VALID_MODULES` in `workers/utils/validation.js` erweitert?
   - Wenn ja: `module_check` Constraint in Remote-DB aktualisieren (siehe `workers/README.md` → "DB Migration")

3. **Nach dem Deploy testen:**
   ```bash
   curl https://cdr74-learning-api.christian-raess.workers.dev/users
   ```

Hinweis: `wrangler` ist bewusst nicht in den Auto-Allow-Berechtigungen — Deployment auf Production immer manuell bestätigen.
