/* stats-tracker.js - Helper to track user statistics */

import { getCurrentUser, updateUserStats } from './auth.js';

/**
 * Track game completion and update user stats
 * @param {string} module - 'groessen' or 'deutsch'
 * @param {number} score - Points earned in this session
 */
export function trackGameCompletion(module, score) {
  const user = getCurrentUser();
  
  if (!user) {
    console.warn('No user logged in, stats not tracked');
    return;
  }
  
  try {
    updateUserStats(user.username, module, score);
    console.log(`Stats updated for ${user.username}: ${module} +${score}`);
  } catch (err) {
    console.error('Failed to update stats:', err);
  }
}

/**
 * Check if user is logged in before starting game
 * @returns {boolean} true if user logged in
 */
export function requireLogin() {
  const user = getCurrentUser();
  
  if (!user) {
    window.dispatchEvent(new Event('user:show-login'));
    return false;
  }
  
  return true;
}
