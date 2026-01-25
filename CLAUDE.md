# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A German-language educational web app for children learning unit conversions (Grössen) and German grammar/reading comprehension (Deutsch). Built with pure vanilla JavaScript, no build pipeline, deployed to Cloudflare Pages.

**Key Features:**
- Unit conversion exercises (length, area, volume)
- German grammar and reading comprehension
- User authentication and statistics tracking
- LocalStorage-based persistence
- Pure ESM modular architecture

## Development Commands

```bash
# Run all tests (recommended)
npm test

# Run legacy tests
npm run test:legacy

# Local development server
python -m http.server 8000
# → http://localhost:8000
```

## Architecture

### Pure ESM Module System
The codebase uses **ES Modules** exclusively:
- All modules in `src/js/modules/*.js` export ESM
- `main.js` is the entry point that wires all modules together
- Dependencies are injected via factory function parameters

### Core Application Flow

**Bootstrap sequence:**
1. `index.html` loads `main.js` as `type="module"`
2. `main.js` imports all ESM modules
3. Modules are created with dependency injection (statsTracker, etc.)
4. Modules are registered via `App.registerModule()`
5. `App.init()` initializes the DOM and navigation
6. `initAuth(App)` sets up authentication event handlers

**Module factory pattern:**
```javascript
// In math.js
export function createGroessenModule(dependencies = {}) {
    const { statsTracker } = dependencies;
    // ... module logic ...
    return { init, startGame };
}

// In main.js
const groessenModule = createGroessenModule({ statsTracker: statsTrackerApi });
App.registerModule('groessen', groessenModule);
```

### Navigation System
`App.showSection(id)` toggles visibility of sections:
- `start-menu` - Main topic selection
- `settings` - Grössen configuration
- `game-area` - Grössen gameplay
- `deutsch` - Deutsch configuration
- `deutsch-area` - Deutsch gameplay
- `login` - User authentication
- `stats` - Statistics display

### Event-Driven Architecture
Custom events coordinate app-wide state:
- `app:ready` - App initialized, modules can attach
- `user:show-login` - Show login screen
- `user:login` - User logged in successfully
- `user:logout` - User logged out
- `user:show-stats` - Display statistics
- `user:close-stats` - Return to menu

### Authentication & Statistics

**LocalStorage schema:**
```javascript
// Key: cdr74_users
[{
  username: "Alice",
  createdAt: 1234567890,
  stats: {
    groessen: { totalPlayed: 3, totalScore: 150, lastPlayed: 1234567900 },
    deutsch: { totalPlayed: 5, totalScore: 400, lastPlayed: 1234567950 }
  }
}]

// Key: cdr74_current_user
{ username: "Alice", ... }
```

**Auth module organization:**
- `auth/auth.js` - User management (create, login, logout, delete, updateStats)
- `auth/auth-ui.js` - UI components (login screen, user header, stats display)
- `auth/stats-tracker.js` - Helper functions (`trackGameCompletion`, `requireLogin`)

**Stats tracking via dependency injection:**
```javascript
// Stats tracker is injected into modules
const groessenModule = createGroessenModule({ statsTracker: statsTrackerApi });

// Inside the module, use the injected dependency
if (statsTracker && statsTracker.trackGameCompletion) {
    statsTracker.trackGameCompletion('groessen', 10);
}
```

### Data Structure

**Words:** `src/data/words.json`
```json
[["Hund", "Nomen"], ["laufen", "Verb"], ...]
```

**Texts:** `src/data/texts.json`
```json
[{
  "text": "...",
  "difficulty": "easy",
  "questions": [{"question": "...", "answers": [...], "correct": 0}]
}]
```

## Testing

**Test structure:**
- `tests/test-runner.js` - Main entry point, imports all unit tests
- `tests/unit/*.test.js` - Individual test files using Node.js `assert`
- Tests import ESM versions directly

**Test coverage:**
- ✅ `german-core.js` - normalizeType, filterWordpool, shuffle
- ✅ `deutsch-lesen.js` - filterByDifficulty, pickTextPool, evaluateChoice
- ✅ `auth.js` - createUser, login, stats tracking, deletion

**When writing tests:**
- Use ESM imports from `src/js/modules/*.js`
- Mock `localStorage` for Node.js environment (see `auth.test.js`)
- Follow pattern: test function name, arrange/act/assert, console.log results

## Common Tasks

### Adding a new module
1. Create `src/js/modules/my-module.js` with ESM exports
2. Export a factory function that accepts dependencies
3. Import and wire up in `main.js`
4. Register via `App.registerModule('name', module)`
5. Write tests in `tests/unit/my-module.test.js`
6. Import test in `tests/test-runner.js`

### Local development workflow
1. Run `python -m http.server 8000`
2. Open http://localhost:8000
3. Changes to `.js` files require browser refresh (no hot reload)
4. Cache-busting is handled by inline script in `index.html`

## Deployment

- **Platform:** Cloudflare Pages
- **URL:** https://cdr74-github-io.pages.dev/
- **Trigger:** Automatic on push to `main` branch
- **No build step:** Static files served directly

## Important Notes

- **No frameworks:** Pure vanilla JavaScript, no React/Vue/Angular
- **No bundler:** ESM scripts loaded directly in browser, no webpack/vite
- **Browser compatibility:** Targets modern browsers (ES6+ with native ESM support)
- **Language:** UI and comments in German
- **Entry point:** `main.js` is the ESM entry point loaded by `index.html`

## File Structure

```
├── index.html          # Main HTML, loads main.js as module
├── main.js             # ESM entry point, wires all modules
├── app.js              # Core App object (navigation, DOM)
├── app-auth.js         # Auth event handler integration
├── math.js             # Grössen module factory
├── german.js           # Deutsch module factory
├── style.css           # Styles
└── src/
    ├── data/
    │   ├── words.json  # Word data for grammar exercises
    │   └── texts.json  # Text data for reading exercises
    └── js/modules/
        ├── german-core.js      # German helpers (normalize, filter)
        ├── deutsch-lesen.js    # Reading comprehension module
        └── auth/
            ├── auth.js         # User management
            ├── auth-ui.js      # Auth UI components
            └── stats-tracker.js # Stats tracking helpers
```
