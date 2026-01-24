/* auth.js - Simple user management (localStorage-based) */

const STORAGE_KEY = 'cdr74_users';
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

export function getAllUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load users:', err);
    return [];
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function createUser(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Valid username required');
  }
  
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    throw new Error('Username must be 2-20 characters');
  }
  
  const users = getAllUsers();
  if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('Username already exists');
  }
  
  const newUser = {
    username: trimmed,
    createdAt: Date.now(),
    stats: {
      groessen: { totalPlayed: 0, totalScore: 0, lastPlayed: null },
      deutsch: { totalPlayed: 0, totalScore: 0, lastPlayed: null }
    }
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to load current user:', err);
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

export function loginUser(username) {
  const users = getAllUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    throw new Error('User not found');
  }
  
  setCurrentUser(user);
  return user;
}

export function logoutUser() {
  setCurrentUser(null);
}

export function updateUserStats(username, module, scoreIncrement) {
  const users = getAllUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.stats[module]) {
    user.stats[module] = { totalPlayed: 0, totalScore: 0, lastPlayed: null };
  }
  
  user.stats[module].totalPlayed++;
  user.stats[module].totalScore += scoreIncrement;
  user.stats[module].lastPlayed = Date.now();
  
  saveUsers(users);
  
  // Update current user if it's the same
  const current = getCurrentUser();
  if (current && current.username === username) {
    setCurrentUser(user);
  }
  
  return user;
}

export function deleteUser(username) {
  const users = getAllUsers();
  const filtered = users.filter(u => u.username !== username);
  
  if (filtered.length === users.length) {
    throw new Error('User not found');
  }
  
  saveUsers(filtered);
  
  // Logout if deleting current user
  const current = getCurrentUser();
  if (current && current.username === username) {
    logoutUser();
  }
}
