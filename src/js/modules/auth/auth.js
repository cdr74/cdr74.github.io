/* auth.js - User management (Cloudflare D1 backend) */

import * as api from '../api-client.js';

const CURRENT_USER_KEY = 'cdr74_current_user';

/**
 * User structure:
 * {
 *   username: string,
 *   createdAt: timestamp,
 *   stats: {
 *     groessen: { totalPlayed: 0, totalScore: 0, lastPlayed: null },
 *     deutsch: { totalPlayed: 0, totalScore: 0, lastPlayed: null }
 *   }
 * }
 */

/**
 * Get all users (returns array of username objects)
 */
export async function getAllUsers() {
  try {
    const response = await api.getAllUsers();
    return response.users || [];
  } catch (err) {
    console.error('Failed to load users:', err);
    throw err;
  }
}

/**
 * Create a new user
 */
export async function createUser(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Valid username required');
  }

  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    throw new Error('Username must be 2-20 characters');
  }

  try {
    const user = await api.createUser(trimmed);
    return user;
  } catch (err) {
    if (err instanceof api.ApiError) {
      if (err.status === 409) {
        throw new Error('Username already exists');
      }
      throw new Error(err.message);
    }
    throw err;
  }
}

/**
 * Get current user from session storage (synchronous)
 */
export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load current user:', err);
    return null;
  }
}

/**
 * Set current user in session storage (synchronous)
 */
export function setCurrentUser(user) {
  try {
    if (user) {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

/**
 * Login user (authenticate and set session)
 */
export async function loginUser(username) {
  try {
    const response = await api.loginUser(username);
    setCurrentUser(response.user);
    return response.user;
  } catch (err) {
    if (err instanceof api.ApiError) {
      if (err.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(err.message);
    }
    throw err;
  }
}

/**
 * Logout user (clear session)
 */
export function logoutUser() {
  setCurrentUser(null);
}

/**
 * Update user stats (record game completion)
 */
export async function updateUserStats(username, module, scoreIncrement, difficulty = 'unknown') {
  try {
    await api.recordActivity(username, module, scoreIncrement, Date.now(), difficulty);

    // Refresh current user stats if logged in
    const current = getCurrentUser();
    if (current && current.username === username) {
      const updatedUser = await api.getUser(username);
      setCurrentUser(updatedUser);
      return updatedUser;
    }

    return await api.getUser(username);
  } catch (err) {
    if (err instanceof api.ApiError) {
      if (err.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(err.message);
    }
    throw err;
  }
}

/**
 * Delete user and all activity
 */
export async function deleteUser(username) {
  try {
    await api.deleteUser(username);

    // Logout if deleting current user
    const current = getCurrentUser();
    if (current && current.username === username) {
      logoutUser();
    }
  } catch (err) {
    if (err instanceof api.ApiError) {
      if (err.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(err.message);
    }
    throw err;
  }
}
