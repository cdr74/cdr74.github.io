/* app.js — Core application bootstrap and navigation */
(function(){
    const App = {
        modules: {},
        dom: null,
        registerModule(name, module) {
            this.modules[name] = module;
            if (this.dom && module.init) module.init(this.dom);
        },
        showSection(id) {
            const sections = ['start-menu','settings','game-area','deutsch','deutsch-area'];
            sections.forEach(s => {
                const el = document.getElementById(s);
                if (!el) return;
                if (s === id) el.classList.remove('hidden'); else el.classList.add('hidden');
            });
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
                feedbackDisplay: document.getElementById('feedback')
            };
        },
        attachNavHandlers() {
            const d = this.dom;
            if (d.btnGroessen) d.btnGroessen.addEventListener('click', () => this.showSection('settings'));
            if (d.btnDeutsch) d.btnDeutsch.addEventListener('click', () => this.showSection('deutsch'));
            if (d.deutschBackBtn) d.deutschBackBtn.addEventListener('click', () => this.showSection('start-menu'));
            if (d.backBtn) d.backBtn.addEventListener('click', () => this.showSection('start-menu'));
            if (d.startBtn) d.startBtn.addEventListener('click', () => {
                const mode = (d.modeSelect && d.modeSelect.value) || 'distance';
                const difficulty = (d.difficultySelect && d.difficultySelect.value) || 'easy';
                if (this.modules.groessen && this.modules.groessen.startGame) this.modules.groessen.startGame(mode, difficulty);
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

    window.App = App;

    document.addEventListener('DOMContentLoaded', () => App.init());

})();
