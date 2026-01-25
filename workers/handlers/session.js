/**
 * Session/login operations
 */

import { validateUsername } from '../utils/validation.js';
import { getUserByUsername, formatUserWithStats } from '../utils/db-helpers.js';

/**
 * POST /api/session/login - Authenticate user
 */
export async function loginUser(request, db) {
  const body = await request.json();
  const validation = validateUsername(body.username);

  if (!validation.valid) {
    return {
      status: 400,
      body: { error: validation.error }
    };
  }

  const user = await getUserByUsername(db, validation.username);

  if (!user) {
    return {
      status: 404,
      body: { error: 'Benutzer nicht gefunden' }
    };
  }

  const userWithStats = await formatUserWithStats(db, user);

  return {
    status: 200,
    body: { user: userWithStats }
  };
}
