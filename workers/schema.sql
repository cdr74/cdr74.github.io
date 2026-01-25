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
    module TEXT NOT NULL,         -- 'groessen' or 'deutsch'
    games_played INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    last_updated INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT module_check CHECK(module IN ('groessen', 'deutsch')),
    UNIQUE(user_id, activity_date, module)
);

CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
CREATE INDEX idx_daily_activity_user_module ON daily_activity(user_id, module);

-- View for backward-compatible aggregate stats
CREATE VIEW module_stats AS
SELECT
    user_id,
    module,
    SUM(games_played) as total_played,
    SUM(total_score) as total_score,
    MAX(last_updated) as last_played
FROM daily_activity
GROUP BY user_id, module;
