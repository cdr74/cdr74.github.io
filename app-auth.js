/* app-auth.js - Authentication integration (ESM) */

import { getCurrentUser } from './src/js/modules/auth/auth.js';
import { renderLoginScreen, renderUserInfo, renderStatsScreen } from './src/js/modules/auth/auth-ui.js';

export function initAuth(app) {
    const userInfoHeader = document.getElementById('user-info-header');
    const loginSection = document.getElementById('login');
    const loginContent = document.getElementById('login-content');
    const statsSection = document.getElementById('stats');
    const statsContent = document.getElementById('stats-content');

    function updateHeader() {
        if (userInfoHeader) {
            renderUserInfo(userInfoHeader);
        }
    }

    window.addEventListener('user:show-login', () => {
        if (loginContent) {
            renderLoginScreen(loginContent);
            app.showSection('login');
        }
    });

    window.addEventListener('user:login', () => {
        updateHeader();
        app.showSection('start-menu');
    });

    window.addEventListener('user:logout', () => {
        updateHeader();
        app.showSection('start-menu');
    });

    window.addEventListener('user:show-stats', (e) => {
        if (statsContent && e.detail && e.detail.user) {
            renderStatsScreen(statsContent, e.detail.user);
            app.showSection('stats');
        }
    });

    window.addEventListener('user:close-stats', () => {
        app.showSection('start-menu');
    });

    updateHeader();

    const currentUser = getCurrentUser();
    if (!currentUser) {
        setTimeout(() => {
            if (loginContent) {
                renderLoginScreen(loginContent);
                app.showSection('login');
            }
        }, 500);
    }
}
