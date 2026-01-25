/**
 * Activity tracking operations
 */

import { validateModule, validateScore, validateTimestamp, validateDays } from '../utils/validation.js';
import { getUserByUsername, upsertDailyActivity, getDailyActivityForUser } from '../utils/db-helpers.js';

/**
 * POST /api/users/:username/activity - Record game completion
 */
export async function recordActivity(username, request, db) {
  const user = await getUserByUsername(db, username);

  if (!user) {
    return {
      status: 404,
      body: { error: 'Benutzer nicht gefunden' }
    };
  }

  const body = await request.json();

  // Validate inputs
  const moduleValidation = validateModule(body.module);
  if (!moduleValidation.valid) {
    return {
      status: 400,
      body: { error: moduleValidation.error }
    };
  }

  const scoreValidation = validateScore(body.score);
  if (!scoreValidation.valid) {
    return {
      status: 400,
      body: { error: scoreValidation.error }
    };
  }

  const timestamp = body.timestamp || Date.now();
  const timestampValidation = validateTimestamp(timestamp);
  if (!timestampValidation.valid) {
    return {
      status: 400,
      body: { error: timestampValidation.error }
    };
  }

  try {
    const result = await upsertDailyActivity(
      db,
      user.id,
      moduleValidation.module,
      scoreValidation.score,
      timestampValidation.timestamp
    );

    return {
      status: 200,
      body: result
    };
  } catch (error) {
    console.error('Error recording activity:', error);
    return {
      status: 500,
      body: { error: 'Fehler beim Speichern der Aktivität' }
    };
  }
}

/**
 * GET /api/users/:username/daily-activity - Get daily activity history
 */
export async function getDailyActivity(username, searchParams, db) {
  const user = await getUserByUsername(db, username);

  if (!user) {
    return {
      status: 404,
      body: { error: 'Benutzer nicht gefunden' }
    };
  }

  // Parse query parameters
  const module = searchParams.get('module');
  const daysParam = searchParams.get('days');

  // Validate module if provided
  let validatedModule = null;
  if (module) {
    const moduleValidation = validateModule(module);
    if (!moduleValidation.valid) {
      return {
        status: 400,
        body: { error: moduleValidation.error }
      };
    }
    validatedModule = moduleValidation.module;
  }

  // Validate days
  const daysValidation = validateDays(daysParam);
  if (!daysValidation.valid) {
    return {
      status: 400,
      body: { error: daysValidation.error }
    };
  }

  try {
    const activity = await getDailyActivityForUser(
      db,
      user.id,
      validatedModule,
      daysValidation.days
    );

    return {
      status: 200,
      body: { activity }
    };
  } catch (error) {
    console.error('Error getting daily activity:', error);
    return {
      status: 500,
      body: { error: 'Fehler beim Laden der Aktivitäten' }
    };
  }
}
