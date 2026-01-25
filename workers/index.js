/**
 * Cloudflare Worker - Main entry point
 * Handles routing for the German learning app API
 */

import { createUser, getAllUsers, getUser, deleteUser } from './handlers/users.js';
import { recordActivity, getDailyActivity } from './handlers/activity.js';
import { loginUser } from './handlers/session.js';

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const { pathname, searchParams } = url;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const db = env.DB;

    // Route: POST /api/session/login
    if (pathname === '/api/session/login' && request.method === 'POST') {
      const result = await loginUser(request, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Route: POST /api/users
    if (pathname === '/api/users' && request.method === 'POST') {
      const result = await createUser(request, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Route: GET /api/users
    if (pathname === '/api/users' && request.method === 'GET') {
      const result = await getAllUsers(db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Routes with username parameter
    const userMatch = pathname.match(/^\/api\/users\/([^\/]+)$/);
    const activityMatch = pathname.match(/^\/api\/users\/([^\/]+)\/activity$/);
    const dailyActivityMatch = pathname.match(/^\/api\/users\/([^\/]+)\/daily-activity$/);

    // Route: POST /api/users/:username/activity
    if (activityMatch && request.method === 'POST') {
      const username = decodeURIComponent(activityMatch[1]);
      const result = await recordActivity(username, request, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Route: GET /api/users/:username/daily-activity
    if (dailyActivityMatch && request.method === 'GET') {
      const username = decodeURIComponent(dailyActivityMatch[1]);
      const result = await getDailyActivity(username, searchParams, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Route: GET /api/users/:username
    if (userMatch && request.method === 'GET') {
      const username = decodeURIComponent(userMatch[1]);
      const result = await getUser(username, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // Route: DELETE /api/users/:username
    if (userMatch && request.method === 'DELETE') {
      const username = decodeURIComponent(userMatch[1]);
      const result = await deleteUser(username, db);
      return jsonResponse(result.body, result.status, corsHeaders);
    }

    // No route matched
    return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
  } catch (error) {
    console.error('Worker error:', error);
    return jsonResponse(
      { error: 'Internal server error', message: error.message },
      500,
      corsHeaders
    );
  }
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
