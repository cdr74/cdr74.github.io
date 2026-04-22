/**
 * API Client for Cloudflare D1 Backend
 * Handles all HTTP communication with the backend API
 */

const API_BASE_URL = 'https://cdr74-learning-api.christian-raess.workers.dev/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make a fetch request with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Die Anfrage hat zu lange gedauert', 408);
    }
    throw error;
  }
}

/**
 * Handle API response
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Ein Fehler ist aufgetreten',
      response.status,
      data
    );
  }

  return data;
}

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other fetch error
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new ApiError('Keine Verbindung zum Server', 0);
    }

    throw new ApiError('Ein unerwarteter Fehler ist aufgetreten', 0);
  }
}

/**
 * Create a new user
 * @param {string} username - Username to create
 * @returns {Promise<Object>} Created user with stats
 */
export async function createUser(username) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
}

/**
 * Get all users (list of usernames)
 * @returns {Promise<Object>} Object with users array
 */
export async function getAllUsers() {
  return apiRequest('/users', {
    method: 'GET'
  });
}

/**
 * Get user with stats
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User object with stats
 */
export async function getUser(username) {
  return apiRequest(`/users/${encodeURIComponent(username)}`, {
    method: 'GET'
  });
}

/**
 * Delete user and all activity
 * @param {string} username - Username to delete
 * @returns {Promise<Object>} Success response
 */
export async function deleteUser(username) {
  return apiRequest(`/users/${encodeURIComponent(username)}`, {
    method: 'DELETE'
  });
}

/**
 * Login user (authenticate)
 * @param {string} username - Username to login
 * @returns {Promise<Object>} Object with user data
 */
export async function loginUser(username) {
  return apiRequest('/session/login', {
    method: 'POST',
    body: JSON.stringify({ username })
  });
}

/**
 * Record game activity
 * @param {string} username - Username
 * @param {string} module - Module name ('groessen' or 'deutsch')
 * @param {number} score - Points scored
 * @param {number} timestamp - Optional timestamp (defaults to now)
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} Success response with date
 */
export async function recordActivity(username, module, score, timestamp = Date.now(), difficulty = 'unknown') {
  return apiRequest(`/users/${encodeURIComponent(username)}/activity`, {
    method: 'POST',
    body: JSON.stringify({ module, score, timestamp, difficulty })
  });
}

/**
 * Get daily activity history
 * @param {string} username - Username
 * @param {Object} options - Query options
 * @param {string} options.module - Optional module filter ('groessen' or 'deutsch')
 * @param {number} options.days - Number of days to fetch (default: 30, max: 365)
 * @returns {Promise<Object>} Object with activity array
 */
export async function getDailyActivity(username, options = {}) {
  const params = new URLSearchParams();

  if (options.module) {
    params.append('module', options.module);
  }

  if (options.days) {
    params.append('days', options.days.toString());
  }

  const queryString = params.toString();
  const endpoint = `/users/${encodeURIComponent(username)}/daily-activity${queryString ? '?' + queryString : ''}`;

  return apiRequest(endpoint, {
    method: 'GET'
  });
}
