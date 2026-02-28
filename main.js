/* main.js - ESM Application Entry Point */

import { App } from './app.js';
import { createGroessenModule } from './math.js';
import { createDeutschModule } from './german.js';
import { createModule as createDeutschLesen } from './src/js/modules/deutsch-lesen.js';
import { createModule as createDeutschArtikel } from './src/js/modules/deutsch-artikel.js';
import { createModule as createDeutschOrdnen } from './src/js/modules/deutsch-ordnen.js';
import { createModule as createDeutschDiktat } from './src/js/modules/deutsch-diktat.js';
import { trackGameCompletion, requireLogin } from './src/js/modules/auth/stats-tracker.js';
import { initAuth } from './app-auth.js';

// Create stats tracker API object for dependency injection
const statsTrackerApi = {
    trackGameCompletion,
    requireLogin
};

// Create modules with dependencies
const deutschLesenModule = createDeutschLesen({ statsTracker: statsTrackerApi });
const deutschArtikelModule = createDeutschArtikel({ statsTracker: statsTrackerApi });
const deutschOrdnenModule = createDeutschOrdnen({ statsTracker: statsTrackerApi });
const deutschDiktatModule = createDeutschDiktat({ statsTracker: statsTrackerApi });
const groessenModule = createGroessenModule({ statsTracker: statsTrackerApi });
const deutschModule = createDeutschModule({
    statsTracker: statsTrackerApi,
    deutschLesenModule: deutschLesenModule,
    deutschArtikelModule: deutschArtikelModule,
    deutschOrdnenModule: deutschOrdnenModule,
    deutschDiktatModule: deutschDiktatModule
});

// Register modules
App.registerModule('groessen', groessenModule);
App.registerModule('deutsch', deutschModule);
App.registerModule('deutsch-lesen', deutschLesenModule);

// Bootstrap function
function bootstrap() {
    App.init();
    initAuth(App);
    window.dispatchEvent(new Event('app:ready'));
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

// Expose App on window for debugging
window.App = App;
