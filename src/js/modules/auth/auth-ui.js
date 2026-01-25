/* auth-ui.js - UI components for authentication */

import {
  getAllUsers,
  createUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from './auth.js';
import { getDailyActivity } from '../api-client.js';

export async function renderLoginScreen(container) {
  // Show loading state
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

    // Event handlers
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
    // Show error UI
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
  // Show loading state
  container.innerHTML = '<div class="loading">Lade Statistiken...</div>';

  try {
    // Fetch daily activity (last 30 days)
    const { activity } = await getDailyActivity(user.username, { days: 30 });

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Nie';
      return new Date(timestamp).toLocaleDateString('de-DE');
    };

    const formatActivityDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const groessen = user.stats.groessen || { totalPlayed: 0, totalScore: 0, lastPlayed: null };
    const deutsch = user.stats.deutsch || { totalPlayed: 0, totalScore: 0, lastPlayed: null };

    const groessenAvg = groessen.totalPlayed > 0
      ? Math.round(groessen.totalScore / groessen.totalPlayed)
      : 0;
    const deutschAvg = deutsch.totalPlayed > 0
      ? Math.round(deutsch.totalScore / deutsch.totalPlayed)
      : 0;

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

        ${activity.length > 0 ? `
          <div class="daily-activity-section">
            <h3>📅 Aktivität der letzten 30 Tage</h3>
            ${renderDailyActivityTable(activity, formatActivityDate)}
          </div>
        ` : ''}

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
    // Show error UI
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

function renderDailyActivityTable(activity, formatDate) {
  if (!activity || activity.length === 0) {
    return '<p>Noch keine Aktivitäten vorhanden.</p>';
  }

  const moduleNames = {
    groessen: '📏 Grössen',
    deutsch: '📝 Deutsch'
  };

  return `
    <table class="activity-table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Modul</th>
          <th>Spiele</th>
          <th>Punkte</th>
        </tr>
      </thead>
      <tbody>
        ${activity.map(row => `
          <tr>
            <td>${formatDate(row.date)}</td>
            <td>${moduleNames[row.module] || row.module}</td>
            <td>${row.gamesPlayed}</td>
            <td>${row.totalScore}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
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
