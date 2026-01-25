/**
 * User CRUD operations
 */

import { validateUsername } from '../utils/validation.js';
import { getUserByUsername, formatUserWithStats } from '../utils/db-helpers.js';

/**
 * POST /api/users - Create new user
 */
export async function createUser(request, db) {
  const body = await request.json();
  const validation = validateUsername(body.username);

  if (!validation.valid) {
    return {
      status: 400,
      body: { error: validation.error }
    };
  }

  const username = validation.username;

  // Check if user already exists
  const existing = await getUserByUsername(db, username);
  if (existing) {
    return {
      status: 409,
      body: { error: 'Benutzername bereits vergeben' }
    };
  }

  // Create user
  const createdAt = Date.now();

  try {
    const result = await db
      .prepare('INSERT INTO users (username, created_at) VALUES (?, ?)')
      .bind(username, createdAt)
      .run();

    if (!result.success) {
      throw new Error('Failed to create user');
    }

    // Get the created user
    const user = await getUserByUsername(db, username);
    const userWithStats = await formatUserWithStats(db, user);

    return {
      status: 201,
      body: {
        id: user.id,
        ...userWithStats
      }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      status: 500,
      body: { error: 'Fehler beim Erstellen des Benutzers' }
    };
  }
}

/**
 * GET /api/users - Get all users (list of usernames)
 */
export async function getAllUsers(db) {
  try {
    const result = await db
      .prepare('SELECT username FROM users ORDER BY username COLLATE NOCASE')
      .all();

    return {
      status: 200,
      body: {
        users: (result.results || []).map(row => ({ username: row.username }))
      }
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      status: 500,
      body: { error: 'Fehler beim Laden der Benutzer' }
    };
  }
}

/**
 * GET /api/users/:username - Get user with stats
 */
export async function getUser(username, db) {
  const validation = validateUsername(username);

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
    body: userWithStats
  };
}

/**
 * DELETE /api/users/:username - Delete user and all activity
 */
export async function deleteUser(username, db) {
  const validation = validateUsername(username);

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

  try {
    // Delete user (cascade will delete activity)
    const result = await db
      .prepare('DELETE FROM users WHERE id = ?')
      .bind(user.id)
      .run();

    if (!result.success) {
      throw new Error('Failed to delete user');
    }

    return {
      status: 200,
      body: { success: true }
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      status: 500,
      body: { error: 'Fehler beim Löschen des Benutzers' }
    };
  }
}
