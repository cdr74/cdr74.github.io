/* auth-ui.js - UI components for authentication */

import {
  getAllUsers,
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from './auth.js';
import { getDailyActivity, getUser } from '../api-client.js';
import { getResponseTimes } from './stats-tracker.js';

const MODULE_CONFIG = {
  'groessen':          { label: 'Grössen',   color: '#60a5fa' },
  'deutsch-grammatik': { label: 'Grammatik', color: '#4ade80' },
  'deutsch-lesen':     { label: 'Lesen',     color: '#fb923c' },
  'deutsch-artikel':   { label: 'Artikel',   color: '#c084fc' },
  'deutsch-ordnen':    { label: 'Ordnen',    color: '#f87171' },
  'deutsch-diktat':    { label: 'Diktat',    color: '#2dd4bf' },
  'deutsch':           { label: 'Deutsch',   color: '#94a3b8' },
};

const MODULE_ORDER = ['groessen', 'deutsch-grammatik', 'deutsch-lesen', 'deutsch-artikel', 'deutsch-ordnen', 'deutsch-diktat', 'deutsch'];

export async function renderLoginScreen(container) {
  container.innerHTML = '<div class="loading">Lade Benutzer...</div>';

  try {
    const users = await getAllUsers();

    container.innerHTML = `
      <div class="auth-container">
        <h2>Benutzer wählen</h2>

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

export function renderUserInfo(_container) {
  const user = getCurrentUser();

  const greetingSlot = document.getElementById('user-greeting-slot');
  const loginBtn     = document.getElementById('header-login-btn');
  const statsBtn     = document.getElementById('header-stats-btn');
  const logoutBtn    = document.getElementById('header-logout-btn');

  if (!user) {
    if (greetingSlot) greetingSlot.innerHTML = '';
    if (loginBtn)  loginBtn.classList.remove('hidden');
    if (statsBtn)  statsBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');

    if (loginBtn) {
      loginBtn.onclick = () => window.dispatchEvent(new Event('user:show-login'));
    }
    return;
  }

  if (greetingSlot) greetingSlot.innerHTML = `<h1 class="user-greeting">Hallo, ${user.username}</h1>`;
  if (loginBtn)  loginBtn.classList.add('hidden');
  if (statsBtn)  statsBtn.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');

  if (statsBtn) {
    statsBtn.onclick = () => window.dispatchEvent(new CustomEvent('user:show-stats', { detail: { user } }));
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      logoutUser();
      window.dispatchEvent(new Event('user:logout'));
    };
  }
}

export async function renderStatsScreen(container, user) {
  container.innerHTML = '<div class="loading">Lade Statistiken...</div>';

  try {
    // Frische Daten parallel laden
    const [{ activity }, freshUser] = await Promise.all([
      getDailyActivity(user.username, { days: 30 }),
      getUser(user.username)
    ]);
    const userStats = freshUser.stats || {};
    const responseTimes = getResponseTimes();

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Nie';
      return new Date(timestamp).toLocaleDateString('de-DE');
    };

    const calcSuccessRate = (played, score) => {
      if (!played) return null;
      return Math.round(((score / 10) / played) * 100);
    };

    const formatAvgTime = (module) => {
      const t = responseTimes[module];
      if (!t || !t.count) return null;
      return (t.totalMs / t.count / 1000).toFixed(1) + 's';
    };

    const aggregateAvgTime = (modules) => {
      let totalMs = 0, count = 0;
      modules.forEach(m => {
        const t = responseTimes[m];
        if (t && t.count) { totalMs += t.totalMs; count += t.count; }
      });
      return count > 0 ? (totalMs / count / 1000).toFixed(1) + 's' : null;
    };

    // Gesamtübersicht
    let totalAllPlayed = 0, totalAllScore = 0;
    Object.values(userStats).forEach(s => {
      totalAllPlayed += s.totalPlayed || 0;
      totalAllScore += s.totalScore || 0;
    });
    const overallSuccessRate = calcSuccessRate(totalAllPlayed, totalAllScore);
    const activeDays30 = new Set(activity.map(r => r.date)).size;

    // Grössen
    const groessen = userStats.groessen || { totalPlayed: 0, totalScore: 0, lastPlayed: null };
    const groessenSuccessRate = calcSuccessRate(groessen.totalPlayed, groessen.totalScore);
    const groessenAvgTime = formatAvgTime('groessen');

    // Deutsch — alle deutsch und deutsch-* Einträge zusammenfassen
    const deutschStatKeys = Object.keys(userStats).filter(k => k === 'deutsch' || k.startsWith('deutsch-'));
    const deutsch = { totalPlayed: 0, totalScore: 0, lastPlayed: null };
    deutschStatKeys.forEach(k => {
      const s = userStats[k];
      if (s) {
        deutsch.totalPlayed += s.totalPlayed || 0;
        deutsch.totalScore += s.totalScore || 0;
        if (s.lastPlayed && (!deutsch.lastPlayed || s.lastPlayed > deutsch.lastPlayed)) {
          deutsch.lastPlayed = s.lastPlayed;
        }
      }
    });
    const deutschSuccessRate = calcSuccessRate(deutsch.totalPlayed, deutsch.totalScore);
    const deutschSubModules = ['deutsch-grammatik', 'deutsch-lesen', 'deutsch-artikel', 'deutsch-ordnen', 'deutsch-diktat', 'deutsch'];
    const deutschAvgTime = aggregateAvgTime(deutschSubModules);

    // Summe pro Übung aus den letzten 30 Tagen
    const exerciseTotals = {};
    activity.forEach(row => {
      if (!exerciseTotals[row.module]) {
        exerciseTotals[row.module] = { gamesPlayed: 0, totalScore: 0 };
      }
      exerciseTotals[row.module].gamesPlayed += row.gamesPlayed;
      exerciseTotals[row.module].totalScore += row.totalScore;
    });

    const rateClass = (pct) => pct >= 80 ? 'good' : pct >= 50 ? 'medium' : 'bad';

    container.innerHTML = `
      <div class="stats-container">
        <h2>Statistik: ${user.username}</h2>

        ${overallSuccessRate !== null ? `
          <div class="stats-summary">
            <div class="summary-stat">
              <div class="summary-value">${totalAllPlayed}</div>
              <div class="summary-label">Versuche gesamt</div>
            </div>
            <div class="summary-stat">
              <div class="summary-value ${rateClass(overallSuccessRate)}">${overallSuccessRate}%</div>
              <div class="summary-label">Erfolgsquote</div>
            </div>
            <div class="summary-stat">
              <div class="summary-value">${activeDays30}</div>
              <div class="summary-label">Aktive Tage (30T)</div>
            </div>
          </div>
        ` : ''}

        <div class="stats-grid">
          <div class="stat-card" style="border-left: 3px solid #60a5fa">
            <h3>Grössen</h3>
            <p><strong>Versuche:</strong> ${groessen.totalPlayed}x</p>
            ${groessenSuccessRate !== null ? `
              <p><strong>Erfolgsquote:</strong> ${groessenSuccessRate}%</p>
              ${renderSuccessBar(groessenSuccessRate)}
            ` : ''}
            ${groessenAvgTime ? `<p><strong>Ø Zeit:</strong> ${groessenAvgTime}</p>` : ''}
            <p class="stat-date">Zuletzt: ${formatDate(groessen.lastPlayed)}</p>
          </div>

          <div class="stat-card" style="border-left: 3px solid #4ade80">
            <h3>Deutsch</h3>
            <p><strong>Versuche:</strong> ${deutsch.totalPlayed}x</p>
            ${deutschSuccessRate !== null ? `
              <p><strong>Erfolgsquote:</strong> ${deutschSuccessRate}%</p>
              ${renderSuccessBar(deutschSuccessRate)}
            ` : ''}
            ${deutschAvgTime ? `<p><strong>Ø Zeit:</strong> ${deutschAvgTime}</p>` : ''}
            <p class="stat-date">Zuletzt: ${formatDate(deutsch.lastPlayed)}</p>
          </div>
        </div>

        <div class="daily-activity-section">
          <h3>Aktivität letzte 30 Tage</h3>
          ${renderActivityChart(activity)}
        </div>

        ${renderExerciseBreakdown(userStats, exerciseTotals)}

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
    return `<span class="legend-item"><span class="legend-dot" style="background:${cfg.color}"></span>${cfg.label}</span>`;
  }).join('');

  return `
    <div class="activity-chart-container">
      <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" xmlns="http://www.w3.org/2000/svg">
        <line x1="${startX}" y1="${chartBottom}" x2="${svgW - startX}" y2="${chartBottom}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        ${bars}
      </svg>
      <div class="chart-legend">${legendHtml}</div>
    </div>
  `;
}

function renderSuccessBar(successRate) {
  const pct = Math.min(100, Math.max(0, successRate));
  const cls = pct >= 80 ? 'good' : pct >= 50 ? 'medium' : 'bad';
  return `<div class="metric-bar"><div class="metric-bar-fill ${cls}" style="width:${pct}%"></div></div>`;
}

function renderExerciseBreakdown(userStats, exerciseTotals30d) {
  const EXERCISES = [
    { key: 'deutsch-grammatik', label: 'Grammatik', color: '#4ade80' },
    { key: 'deutsch-lesen',     label: 'Lesen',     color: '#fb923c' },
    { key: 'deutsch-artikel',   label: 'Artikel',   color: '#c084fc' },
    { key: 'deutsch-ordnen',    label: 'Ordnen',    color: '#f87171' },
    { key: 'deutsch-diktat',    label: 'Diktat',    color: '#2dd4bf' },
  ];

  const times = getResponseTimes();

  const rows = EXERCISES.map(ex => {
    const allTime = userStats[ex.key] || { totalPlayed: 0, totalScore: 0 };
    const recent = exerciseTotals30d[ex.key] || { gamesPlayed: 0, totalScore: 0 };
    if (allTime.totalPlayed === 0 && recent.gamesPlayed === 0) return null;

    const successRate = allTime.totalPlayed > 0
      ? Math.round(((allTime.totalScore / 10) / allTime.totalPlayed) * 100)
      : null;
    const rateClass = successRate !== null ? (successRate >= 80 ? 'good' : successRate >= 50 ? 'medium' : 'bad') : '';
    const t = times[ex.key];
    const avgTime = t && t.count > 0 ? (t.totalMs / t.count / 1000).toFixed(1) + 's' : null;
    const recentLabel = recent.gamesPlayed > 0 ? `${recent.gamesPlayed}× letzte 30 Tage` : 'Zuletzt >30 Tage';

    return `
      <div class="exercise-row" style="border-left-color:${ex.color}">
        <div class="exercise-row-body">
          <div class="exercise-row-head">
            <span class="exercise-row-name">${ex.label}</span>
            <span class="exercise-row-count">${allTime.totalPlayed}× gesamt</span>
            ${successRate !== null ? `<span class="exercise-row-rate ${rateClass}">${successRate}%</span>` : ''}
          </div>
          ${successRate !== null ? renderSuccessBar(successRate) : ''}
          <div class="exercise-row-meta">${recentLabel}${avgTime ? ` · Ø ${avgTime}` : ''}</div>
        </div>
      </div>
    `;
  }).filter(Boolean);

  if (rows.length === 0) return '';

  return `
    <div class="exercise-breakdown-section">
      <h3>Deutsch — Details</h3>
      <div class="exercise-list">
        ${rows.join('')}
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
