-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at INTEGER NOT NULL,
    CONSTRAINT username_length CHECK(length(username) >= 2 AND length(username) <= 20)
);

CREATE INDEX idx_users_username ON users(username COLLATE NOCASE);

-- Daily activity table (aggregated by day)
CREATE TABLE daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_date TEXT NOT NULL,  -- YYYY-MM-DD format
    module TEXT NOT NULL,         -- 'groessen', 'deutsch', or sub-modules like 'deutsch-grammatik'
    games_played INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    last_updated INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT module_check CHECK(module IN ('groessen', 'deutsch', 'deutsch-grammatik', 'deutsch-lesen', 'deutsch-artikel', 'deutsch-ordnen', 'deutsch-diktat')),
    UNIQUE(user_id, activity_date, module)
);

CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
CREATE INDEX idx_daily_activity_user_module ON daily_activity(user_id, module);

-- Migration für bestehende Datenbanken (z.B. neue Sub-Module hinzufügen):
-- SQLite unterstützt kein ALTER TABLE DROP/MODIFY CONSTRAINT — Tabelle neu erstellen:
-- Siehe workers/README.md → "DB Migration" für die vollständigen Schritte.
--
-- Hinweis: Das frühere module_stats VIEW wurde entfernt. Stats werden direkt
-- aus daily_activity per GROUP BY aggregiert (siehe db-helpers.js getUserStats).
