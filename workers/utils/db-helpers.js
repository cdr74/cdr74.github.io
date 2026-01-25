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
 * Get aggregate stats for a user
 */
export async function getUserStats(db, userId) {
  const stats = await db
    .prepare(`
      SELECT
        module,
        total_played,
        total_score,
        last_played
      FROM module_stats
      WHERE user_id = ?
    `)
    .bind(userId)
    .all();

  // Convert to object format
  const statsObj = {
    groessen: {
      totalPlayed: 0,
      totalScore: 0,
      lastPlayed: null
    },
    deutsch: {
      totalPlayed: 0,
      totalScore: 0,
      lastPlayed: null
    }
  };

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
 * Record or update daily activity
 */
export async function upsertDailyActivity(db, userId, module, score, timestamp) {
  const dateStr = getDateString(timestamp);

  // Use INSERT ... ON CONFLICT to upsert
  const result = await db
    .prepare(`
      INSERT INTO daily_activity (user_id, activity_date, module, games_played, total_score, last_updated)
      VALUES (?, ?, ?, 1, ?, ?)
      ON CONFLICT(user_id, activity_date, module)
      DO UPDATE SET
        games_played = games_played + 1,
        total_score = total_score + ?,
        last_updated = ?
    `)
    .bind(userId, dateStr, module, score, timestamp, score, timestamp)
    .run();

  return { success: result.success, date: dateStr };
}

/**
 * Get daily activity for a user
 */
export async function getDailyActivityForUser(db, userId, module = null, days = 30) {
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
      WHERE user_id = ? AND module = ?
      ORDER BY activity_date DESC
      LIMIT ?
    `;
    params = [userId, module, days];
  } else {
    query = `
      SELECT
        activity_date as date,
        module,
        games_played as gamesPlayed,
        total_score as totalScore
      FROM daily_activity
      WHERE user_id = ?
      ORDER BY activity_date DESC
      LIMIT ?
    `;
    params = [userId, days];
  }

  const result = await db.prepare(query).bind(...params).all();

  return result.results || [];
}
