/**
 * Database helper utilities
 */

/**
 * Convert a date timestamp to YYYY-MM-DD format
 */
export function getDateString(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Get user by username
 */
export async function getUserByUsername(db, username) {
  const result = await db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
    .bind(username)
    .first();

  return result;
}

/**
 * Get aggregate stats for a user (computed directly from daily_activity)
 */
export async function getUserStats(db, userId) {
  const stats = await db
    .prepare(`
      SELECT
        module,
        SUM(games_played) as total_played,
        SUM(total_score) as total_score,
        MAX(last_updated) as last_played
      FROM daily_activity
      WHERE user_id = ?
      GROUP BY module
    `)
    .bind(userId)
    .all();

  const statsObj = {};
  for (const row of stats.results || []) {
    statsObj[row.module] = {
      totalPlayed: row.total_played,
      totalScore: row.total_score,
      lastPlayed: row.last_played
    };
  }

  return statsObj;
}

/**
 * Format user object with stats
 */
export async function formatUserWithStats(db, user) {
  const stats = await getUserStats(db, user.id);

  return {
    username: user.username,
    createdAt: user.created_at,
    stats
  };
}

/**
 * Record or update daily activity (SELECT+UPDATE/INSERT — funktioniert ohne UNIQUE-Constraint)
 */
export async function upsertDailyActivity(db, userId, module, score, timestamp) {
  const dateStr = getDateString(timestamp);

  const existing = await db
    .prepare('SELECT id FROM daily_activity WHERE user_id = ? AND activity_date = ? AND module = ?')
    .bind(userId, dateStr, module)
    .first();

  if (existing) {
    await db
      .prepare(`
        UPDATE daily_activity
        SET games_played = games_played + 1,
            total_score = total_score + ?,
            last_updated = ?
        WHERE id = ?
      `)
      .bind(score, timestamp, existing.id)
      .run();
  } else {
    await db
      .prepare(`
        INSERT INTO daily_activity (user_id, activity_date, module, games_played, total_score, last_updated)
        VALUES (?, ?, ?, 1, ?, ?)
      `)
      .bind(userId, dateStr, module, score, timestamp)
      .run();
  }

  return { success: true, date: dateStr };
}

/**
 * Get daily activity for a user within a date range
 */
export async function getDailyActivityForUser(db, userId, module = null, days = 30) {
  // Compute cutoff date in JS to avoid SQLite date string concatenation
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  let query;
  let params;

  if (module) {
    query = `
      SELECT
        activity_date as date,
        module,
        games_played as gamesPlayed,
        total_score as totalScore
      FROM daily_activity
      WHERE user_id = ? AND module = ? AND activity_date >= ?
      ORDER BY activity_date ASC
    `;
    params = [userId, module, cutoffDate];
  } else {
    query = `
      SELECT
        activity_date as date,
        module,
        games_played as gamesPlayed,
        total_score as totalScore
      FROM daily_activity
      WHERE user_id = ? AND activity_date >= ?
      ORDER BY activity_date ASC
    `;
    params = [userId, cutoffDate];
  }

  const result = await db.prepare(query).bind(...params).all();

  return result.results || [];
}
