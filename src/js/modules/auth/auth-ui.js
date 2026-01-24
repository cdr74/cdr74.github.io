/* auth-ui.js - UI components for authentication */

import { 
  getAllUsers, 
  createUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser 
} from './auth.js';

export function renderLoginScreen(container) {
  const users = getAllUsers();
  
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
    btn.addEventListener('click', () => {
      const username = btn.dataset.username;
      try {
        loginUser(username);
        window.dispatchEvent(new CustomEvent('user:login', { detail: { username } }));
      } catch (err) {
        showError(err.message);
      }
    });
  });
  
  const createBtn = container.querySelector('#create-user-btn');
  const usernameInput = container.querySelector('#new-username');
  
  if (createBtn && usernameInput) {
    const handleCreate = () => {
      const username = usernameInput.value.trim();
      try {
        const user = createUser(username);
        loginUser(user.username);
        window.dispatchEvent(new CustomEvent('user:login', { detail: { username: user.username } }));
      } catch (err) {
        showError(err.message);
      }
    };
    
    createBtn.addEventListener('click', handleCreate);
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleCreate();
    });
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

export function renderStatsScreen(container, user) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nie';
    return new Date(timestamp).toLocaleDateString('de-DE');
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
      
      <button class="btn secondary" id="close-stats">Zurück</button>
    </div>
  `;
  
  const closeBtn = container.querySelector('#close-stats');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.dispatchEvent(new Event('user:close-stats'));
    });
  }
}

function showError(message) {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.className = 'feedback incorrect';
    setTimeout(() => errorEl.classList.add('hidden'), 5000);
  }
}
