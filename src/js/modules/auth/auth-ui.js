/* auth-ui.js - UI components for authentication */

import {
  getAllUsers,
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from './auth.js';
import { getDailyActivity } from '../api-client.js';

const MODULE_CONFIG = {
  'groessen':          { label: 'Grössen',   color: '#2196F3', icon: '📏' },
  'deutsch-grammatik': { label: 'Grammatik', color: '#4CAF50', icon: '📝' },
  'deutsch-lesen':     { label: 'Lesen',     color: '#FF9800', icon: '📖' },
  'deutsch-artikel':   { label: 'Artikel',   color: '#9C27B0', icon: '🔤' },
  'deutsch-ordnen':    { label: 'Ordnen',    color: '#F44336', icon: '🔀' },
  'deutsch-diktat':    { label: 'Diktat',    color: '#009688', icon: '✏️' },
  'deutsch':           { label: 'Deutsch',   color: '#757575', icon: '📝' },
};

const MODULE_ORDER = ['groessen', 'deutsch-grammatik', 'deutsch-lesen', 'deutsch-artikel', 'deutsch-ordnen', 'deutsch-diktat', 'deutsch'];

export async function renderLoginScreen(container) {
  container.innerHTML = '<div class="loading">Lade Benutzer...</div>';

  try {
    const users = await getAllUsers();

    container.innerHTML = `
      <div class="auth-container">
        <h2>👤 Benutzer wählen</h2>

        ${users.length > 0 ? `
          <div class="user-list">
            ${users.map(u => `
              <button class="btn user-btn" data-username="${u.username}">
                ${u.username}
              </button>
            `).join('')}
          </div>
        ` : '<p>Noch keine Benutzer vorhanden.</p>'}

        <div class="new-user-section">
          <h3>Neuer Benutzer</h3>
          <input
            type="text"
            id="new-username"
            placeholder="Name eingeben (2-20 Zeichen)"
            maxlength="20"
          >
          <button class="btn primary" id="create-user-btn">Erstellen</button>
          <div id="auth-error" class="feedback hidden"></div>
        </div>
      </div>
    `;

    container.querySelectorAll('.user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const username = btn.dataset.username;
        try {
          btn.disabled = true;
          btn.textContent = 'Anmelden...';
          await loginUser(username);
          window.dispatchEvent(new CustomEvent('user:login', { detail: { username } }));
        } catch (err) {
          btn.disabled = false;
          btn.textContent = username;
          showError(err.message);
        }
      });
    });

    const createBtn = container.querySelector('#create-user-btn');
    const usernameInput = container.querySelector('#new-username');

    if (createBtn && usernameInput) {
      const handleCreate = async () => {
        const username = usernameInput.value.trim();
        try {
          createBtn.disabled = true;
          createBtn.textContent = 'Erstellen...';
          const user = await createUser(username);
          await loginUser(user.username);
          window.dispatchEvent(new CustomEvent('user:login', { detail: { username: user.username } }));
        } catch (err) {
          createBtn.disabled = false;
          createBtn.textContent = 'Erstellen';
          showError(err.message);
        }
      };

      createBtn.addEventListener('click', handleCreate);
      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCreate();
      });
    }
  } catch (err) {
    container.innerHTML = `
      <div class="error-container">
        <p class="error">Fehler beim Laden der Benutzer: ${err.message}</p>
        <button class="btn secondary" id="retry-login">Erneut versuchen</button>
      </div>
    `;

    const retryBtn = container.querySelector('#retry-login');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderLoginScreen(container));
    }
  }
}

export function renderUserInfo(container) {
  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = '<button class="btn small" id="show-login">Anmelden</button>';
    const btn = container.querySelector('#show-login');
    if (btn) {
      btn.addEventListener('click', () => {
        window.dispatchEvent(new Event('user:show-login'));
      });
    }
    return;
  }

  container.innerHTML = `
    <div class="user-info">
      <span class="user-name">👤 ${user.username}</span>
      <button class="btn small" id="show-stats">Statistik</button>
      <button class="btn small" id="logout-btn">Abmelden</button>
    </div>
  `;

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      window.dispatchEvent(new Event('user:logout'));
    });
  }

  const statsBtn = container.querySelector('#show-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('user:show-stats', { detail: { user } }));
    });
  }
}

export async function renderStatsScreen(container, user) {
  container.innerHTML = '<div class="loading">Lade Statistiken...</div>';

  try {
    const { activity } = await getDailyActivity(user.username, { days: 30 });

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Nie';
      return new Date(timestamp).toLocaleDateString('de-DE');
    };

    // Grössen summary
    const groessen = user.stats.groessen || { totalPlayed: 0, totalScore: 0, lastPlayed: null };
    const groessenAvg = groessen.totalPlayed > 0 ? Math.round(groessen.totalScore / groessen.totalPlayed) : 0;

    // Deutsch summary — aggregate all deutsch and deutsch-* keys
    const deutschStatKeys = Object.keys(user.stats || {}).filter(k => k === 'deutsch' || k.startsWith('deutsch-'));
    const deutsch = { totalPlayed: 0, totalScore: 0, lastPlayed: null };
    deutschStatKeys.forEach(k => {
      const s = user.stats[k];
      if (s) {
        deutsch.totalPlayed += s.totalPlayed || 0;
        deutsch.totalScore += s.totalScore || 0;
        if (s.lastPlayed && (!deutsch.lastPlayed || s.lastPlayed > deutsch.lastPlayed)) {
          deutsch.lastPlayed = s.lastPlayed;
        }
      }
    });
    const deutschAvg = deutsch.totalPlayed > 0 ? Math.round(deutsch.totalScore / deutsch.totalPlayed) : 0;

    // Per-exercise totals from the last 30 days of activity
    const exerciseTotals = {};
    activity.forEach(row => {
      if (!exerciseTotals[row.module]) {
        exerciseTotals[row.module] = { gamesPlayed: 0, totalScore: 0 };
      }
      exerciseTotals[row.module].gamesPlayed += row.gamesPlayed;
      exerciseTotals[row.module].totalScore += row.totalScore;
    });

    container.innerHTML = `
      <div class="stats-container">
        <h2>📊 Statistik: ${user.username}</h2>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>📏 Grössen</h3>
            <p><strong>Gespielt:</strong> ${groessen.totalPlayed}x</p>
            <p><strong>Gesamt-Punkte:</strong> ${groessen.totalScore}</p>
            <p><strong>Durchschnitt:</strong> ${groessenAvg} Punkte</p>
            <p><strong>Zuletzt:</strong> ${formatDate(groessen.lastPlayed)}</p>
          </div>

          <div class="stat-card">
            <h3>📝 Deutsch</h3>
            <p><strong>Gespielt:</strong> ${deutsch.totalPlayed}x</p>
            <p><strong>Gesamt-Punkte:</strong> ${deutsch.totalScore}</p>
            <p><strong>Durchschnitt:</strong> ${deutschAvg} Punkte</p>
            <p><strong>Zuletzt:</strong> ${formatDate(deutsch.lastPlayed)}</p>
          </div>
        </div>

        <div class="daily-activity-section">
          <h3>📅 Aktivität letzte 30 Tage</h3>
          ${renderActivityChart(activity)}
        </div>

        ${renderExerciseBreakdown(user.stats, exerciseTotals)}

        <button class="btn secondary" id="close-stats">Zurück</button>
      </div>
    `;

    const closeBtn = container.querySelector('#close-stats');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.dispatchEvent(new Event('user:close-stats'));
      });
    }
  } catch (err) {
    container.innerHTML = `
      <div class="error-container">
        <p class="error">Fehler beim Laden der Statistiken: ${err.message}</p>
        <button class="btn secondary" id="retry-stats">Erneut versuchen</button>
        <button class="btn secondary" id="close-stats">Zurück</button>
      </div>
    `;

    const retryBtn = container.querySelector('#retry-stats');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => renderStatsScreen(container, user));
    }

    const closeBtn = container.querySelector('#close-stats');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.dispatchEvent(new Event('user:close-stats'));
      });
    }
  }
}

function renderActivityChart(activity) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Map: date → { module → gamesPlayed }
  const dayMap = {};
  days.forEach(d => { dayMap[d] = {}; });
  activity.forEach(row => {
    if (dayMap[row.date] !== undefined) {
      dayMap[row.date][row.module] = (dayMap[row.date][row.module] || 0) + row.gamesPlayed;
    }
  });

  const maxPerDay = Math.max(1, ...days.map(d =>
    Object.values(dayMap[d]).reduce((a, b) => a + b, 0)
  ));

  const activeModules = MODULE_ORDER.filter(mod =>
    activity.some(row => row.module === mod)
  );

  if (activeModules.length === 0) {
    return '<p class="chart-empty">Noch keine Aktivitäten in den letzten 30 Tagen.</p>';
  }

  // SVG layout
  const barW = 14, barGap = 4, startX = 2;
  const chartTop = 4, chartBottom = 100, chartH = chartBottom - chartTop;
  const svgW = 544, svgH = 120;

  let bars = '';
  days.forEach((date, i) => {
    const x = startX + i * (barW + barGap);
    let currentY = chartBottom;

    MODULE_ORDER.forEach(mod => {
      const count = dayMap[date][mod] || 0;
      if (count === 0) return;
      const h = Math.max(2, Math.round((count / maxPerDay) * chartH));
      currentY -= h;
      const cfg = MODULE_CONFIG[mod] || { color: '#ccc', label: mod };
      const dateLabel = new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      bars += `<rect x="${x}" y="${currentY}" width="${barW}" height="${h}" fill="${cfg.color}" rx="2"><title>${dateLabel}: ${cfg.label} — ${count}x</title></rect>`;
    });

    // X-axis labels at roughly weekly intervals
    if (i === 0 || i === 6 || i === 13 || i === 20 || i === 29) {
      const dateLabel = new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      bars += `<text x="${x + barW / 2}" y="${svgH - 2}" text-anchor="middle" font-size="9" fill="#999">${dateLabel}</text>`;
    }
  });

  const legendHtml = activeModules.map(mod => {
    const cfg = MODULE_CONFIG[mod] || { color: '#ccc', label: mod, icon: '' };
    return `<span class="legend-item"><span class="legend-dot" style="background:${cfg.color}"></span>${cfg.icon} ${cfg.label}</span>`;
  }).join('');

  return `
    <div class="activity-chart-container">
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" xmlns="http://www.w3.org/2000/svg">
        <line x1="${startX}" y1="${chartBottom}" x2="${svgW - startX}" y2="${chartBottom}" stroke="#e0e0e0" stroke-width="1"/>
        ${bars}
      </svg>
      <div class="chart-legend">${legendHtml}</div>
    </div>
  `;
}

function renderExerciseBreakdown(userStats, exerciseTotals30d) {
  const EXERCISES = [
    { key: 'deutsch-grammatik', label: 'Grammatik', icon: '📝', color: '#4CAF50' },
    { key: 'deutsch-lesen',     label: 'Lesen',     icon: '📖', color: '#FF9800' },
    { key: 'deutsch-artikel',   label: 'Artikel',   icon: '🔤', color: '#9C27B0' },
    { key: 'deutsch-ordnen',    label: 'Ordnen',    icon: '🔀', color: '#F44336' },
    { key: 'deutsch-diktat',    label: 'Diktat',    icon: '✏️', color: '#009688' },
  ];

  const cards = EXERCISES.map(ex => {
    const allTime = userStats[ex.key] || { totalPlayed: 0 };
    const recent = exerciseTotals30d[ex.key] || { gamesPlayed: 0 };
    if (allTime.totalPlayed === 0 && recent.gamesPlayed === 0) return null;
    return `
      <div class="exercise-mini-card">
        <div class="exercise-mini-dot" style="background:${ex.color}"></div>
        <div class="exercise-mini-name">${ex.icon} ${ex.label}</div>
        <div class="exercise-mini-stat">${allTime.totalPlayed}x gespielt</div>
        <div class="exercise-mini-secondary">${recent.gamesPlayed}x letzte 30T</div>
      </div>
    `;
  }).filter(Boolean);

  if (cards.length === 0) return '';

  return `
    <div class="exercise-breakdown-section">
      <h3>📊 Deutsch — Details</h3>
      <div class="exercise-breakdown-grid">
        ${cards.join('')}
      </div>
    </div>
  `;
}

function showError(message) {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.className = 'feedback incorrect';
    setTimeout(() => errorEl.classList.add('hidden'), 5000);
  }
}
