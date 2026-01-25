/**
 * Validation utilities for API inputs
 */

export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Benutzername ist erforderlich' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Benutzername muss mindestens 2 Zeichen lang sein' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Benutzername darf maximal 20 Zeichen lang sein' };
  }

  return { valid: true, username: trimmed };
}

export function validateModule(module) {
  if (!module || typeof module !== 'string') {
    return { valid: false, error: 'Modul ist erforderlich' };
  }

  if (module !== 'groessen' && module !== 'deutsch') {
    return { valid: false, error: 'Ungültiges Modul (muss "groessen" oder "deutsch" sein)' };
  }

  return { valid: true, module };
}

export function validateScore(score) {
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
    return { valid: false, error: 'Punkte müssen eine positive Ganzzahl sein' };
  }

  return { valid: true, score };
}

export function validateTimestamp(timestamp) {
  if (typeof timestamp !== 'number' || timestamp < 0) {
    return { valid: false, error: 'Ungültiger Zeitstempel' };
  }

  return { valid: true, timestamp };
}

export function validateDays(days) {
  if (days === undefined || days === null) {
    return { valid: true, days: 30 }; // Default
  }

  const num = parseInt(days, 10);

  if (isNaN(num) || num < 1 || num > 365) {
    return { valid: false, error: 'Tage müssen zwischen 1 und 365 liegen' };
  }

  return { valid: true, days: num };
}
