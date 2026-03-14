/* app.js — Core application bootstrap and navigation (ESM) */

export const App = {
    modules: {},
    dom: null,
    registerModule(name, module) {
        this.modules[name] = module;
        if (this.dom && module.init) module.init(this.dom);
    },
    showSection(id) {
        const sections = ['start-menu','settings','game-area','deutsch','deutsch-area','login','stats'];
        const homeScreens = ['start-menu', 'login', 'stats'];
        sections.forEach(s => {
            const el = document.getElementById(s);
            if (!el) return;
            if (s === id) el.classList.remove('hidden'); else el.classList.add('hidden');
        });
        const backBtn = document.getElementById('header-back-btn');
        if (backBtn) {
            if (homeScreens.includes(id)) backBtn.classList.add('hidden');
            else backBtn.classList.remove('hidden');
        }
    },
    initDOM() {
        this.dom = {
            settingsSection: document.getElementById('settings'),
            gameAreaSection: document.getElementById('game-area'),
            startMenuSection: document.getElementById('start-menu'),
            deutschSection: document.getElementById('deutsch'),
            deutschAreaSection: document.getElementById('deutsch-area'),
            deutschModeSelect: document.getElementById('deutsch-mode'),
            deutschDifficultySelect: document.getElementById('deutsch-difficulty'),
            deutschStartBtn: document.getElementById('deutsch-start'),
            deutschScoreDisplay: document.getElementById('deutsch-score'),
            deutschExitBtn: document.getElementById('deutsch-exit'),
            settingsBackBtn: document.getElementById('settings-back'),
            modeSelect: document.getElementById('mode'),
            difficultySelect: document.getElementById('difficulty'),
            startBtn: document.getElementById('start-btn'),
            backBtn: document.getElementById('back-btn'),
            btnGroessen: document.getElementById('btn-groessen'),
            btnDeutsch: document.getElementById('btn-deutsch'),
            deutschBackBtn: document.getElementById('deutsch-back'),
            scoreDisplay: document.getElementById('score'),
            valueDisplay: document.getElementById('value-display'),
            unitFromDisplay: document.getElementById('unit-from'),
            unitToDisplay: document.getElementById('unit-to'),
            userInput: document.getElementById('user-input'),
            checkBtn: document.getElementById('check-btn'),
            nextBtn: document.getElementById('next-btn'),
            feedbackDisplay: document.getElementById('feedback'),
            headerBackBtn:   document.getElementById('header-back-btn'),
            headerLoginBtn:  document.getElementById('header-login-btn')
        };
    },
    attachNavHandlers() {
        const d = this.dom;
        if (d.btnGroessen) d.btnGroessen.addEventListener('click', () => this.showSection('settings'));
        if (d.btnDeutsch) d.btnDeutsch.addEventListener('click', () => this.showSection('deutsch'));
        if (d.deutschBackBtn) d.deutschBackBtn.addEventListener('click', () => this.showSection('start-menu'));
        if (d.settingsBackBtn) d.settingsBackBtn.addEventListener('click', () => this.showSection('start-menu'));
        if (d.backBtn) d.backBtn.addEventListener('click', () => this.showSection('start-menu'));
        if (d.headerBackBtn) d.headerBackBtn.addEventListener('click', () => this.showSection('start-menu'));
        if (d.headerLoginBtn) d.headerLoginBtn.addEventListener('click', () => window.dispatchEvent(new Event('user:show-login')));
        if (d.startBtn) d.startBtn.addEventListener('click', () => {
            const mode = (d.modeSelect && d.modeSelect.value) || 'distance';
            const difficulty = (d.difficultySelect && d.difficultySelect.value) || 'easy';
            try {
                if (this.modules.groessen && this.modules.groessen.startGame) {
                    this.modules.groessen.startGame(mode, difficulty);
                } else {
                    console.warn('groessen module not ready; will retry shortly');
                    setTimeout(() => {
                        if (this.modules.groessen && this.modules.groessen.startGame) {
                            this.modules.groessen.startGame(mode, difficulty);
                        } else {
                            console.warn('groessen module still not available; showing game-area as fallback');
                            this.showSection('game-area');
                        }
                    }, 120);
                }
            } catch (err) {
                console.error('Error starting groessen module', err);
                this.showSection('settings');
            }
        });
        if (d.deutschStartBtn) d.deutschStartBtn.addEventListener('click', () => {
            const mode = (d.deutschModeSelect && d.deutschModeSelect.value) || 'grammar';
            const difficulty = (d.deutschDifficultySelect && d.deutschDifficultySelect.value) || 'easy';
            if (this.modules.deutsch && this.modules.deutsch.start) this.modules.deutsch.start(mode, difficulty);
        });
        if (d.deutschExitBtn) d.deutschExitBtn.addEventListener('click', () => this.showSection('start-menu'));
    },
    init() {
        this.initDOM();
        // initialize any modules that were registered before DOM ready
        Object.keys(this.modules).forEach((k) => { const m = this.modules[k]; if (m.init) m.init(this.dom); });
        this.attachNavHandlers();
        this.showSection('start-menu');
    }
};
