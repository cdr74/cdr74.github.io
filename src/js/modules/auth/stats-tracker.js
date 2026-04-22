/* stats-tracker.js - Helper to track user statistics */

import { getCurrentUser, updateUserStats } from './auth.js';

const PERF_KEY = 'cdr74_response_times';

/**
 * Track game completion and update user stats (async)
 * @param {string} module - e.g. 'groessen', 'deutsch-artikel'
 * @param {number} score - Points earned (10 = correct, 0 = wrong)
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
export async function trackGameCompletion(module, score, difficulty = 'unknown') {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in, stats not tracked');
    return;
  }

  try {
    await updateUserStats(user.username, module, score, difficulty);
    console.log(`Stats updated for ${user.username}: ${module}/${difficulty} +${score}`);
  } catch (err) {
    console.error('Failed to update stats:', err);
    // Don't throw - graceful degradation
  }
}

/**
 * Record response time for a question (stored in localStorage per module)
 * @param {string} module - Module name
 * @param {number} ms - Time in milliseconds from question display to answer
 */
export function saveResponseTime(module, ms) {
  if (!ms || ms <= 0 || ms > 300000) return; // ignore invalid / >5min
  try {
    const raw = localStorage.getItem(PERF_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[module]) data[module] = { totalMs: 0, count: 0 };
    data[module].totalMs += ms;
    data[module].count += 1;
    localStorage.setItem(PERF_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

/**
 * Get stored response time data per module
 * @returns {Object} Map of module → { totalMs, count }
 */
export function getResponseTimes() {
  try {
    const raw = localStorage.getItem(PERF_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
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
