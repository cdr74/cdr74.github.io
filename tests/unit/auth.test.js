import assert from 'assert';
import { 
  createUser, 
  getAllUsers, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  updateUserStats,
  deleteUser 
} from '../../src/js/modules/auth/auth.js';

// Mock localStorage for Node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, value) => { storage[key] = value; },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

export function testAuthModule() {
  // Clear storage before tests
  localStorage.clear();
  
  // Test: createUser
  const user1 = createUser('TestUser');
  assert.strictEqual(user1.username, 'TestUser');
  assert.ok(user1.createdAt);
  assert.ok(user1.stats.groessen);
  assert.ok(user1.stats.deutsch);
  
  // Test: duplicate username
  assert.throws(() => createUser('TestUser'), /already exists/);
  assert.throws(() => createUser('testuser'), /already exists/); // case-insensitive
  
  // Test: invalid username
  assert.throws(() => createUser(''), /Valid username required/);
  assert.throws(() => createUser('a'), /2-20 characters/);
  assert.throws(() => createUser('a'.repeat(21)), /2-20 characters/);
  
  // Test: getAllUsers
  const user2 = createUser('AnotherUser');
  const users = getAllUsers();
  assert.strictEqual(users.length, 2);
  
  // Test: loginUser
  const loggedIn = loginUser('TestUser');
  assert.strictEqual(loggedIn.username, 'TestUser');
  
  const current = getCurrentUser();
  assert.strictEqual(current.username, 'TestUser');
  
  // Test: login non-existent user
  assert.throws(() => loginUser('NonExistent'), /not found/);
  
  // Test: updateUserStats
  updateUserStats('TestUser', 'groessen', 50);
  const updatedUsers = getAllUsers();
  const updatedUser = updatedUsers.find(u => u.username === 'TestUser');
  assert.strictEqual(updatedUser.stats.groessen.totalPlayed, 1);
  assert.strictEqual(updatedUser.stats.groessen.totalScore, 50);
  assert.ok(updatedUser.stats.groessen.lastPlayed);
  
  // Multiple updates
  updateUserStats('TestUser', 'groessen', 30);
  const users2 = getAllUsers();
  const user2Updated = users2.find(u => u.username === 'TestUser');
  assert.strictEqual(user2Updated.stats.groessen.totalPlayed, 2);
  assert.strictEqual(user2Updated.stats.groessen.totalScore, 80);
  
  // Test: logoutUser
  logoutUser();
  assert.strictEqual(getCurrentUser(), null);
  
  // Test: deleteUser
  deleteUser('TestUser');
  const remainingUsers = getAllUsers();
  assert.strictEqual(remainingUsers.length, 1);
  assert.strictEqual(remainingUsers[0].username, 'AnotherUser');
  
  // Test: delete non-existent user
  assert.throws(() => deleteUser('NonExistent'), /not found/);
  
  console.log('✓ Auth module tests passed');
}
