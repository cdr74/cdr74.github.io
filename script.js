/* Modular app architecture --------------------------------------------------
   - App.registerModule(name, module)
   - App.navigation manages sections
   - groessenModule contains unit-conversion exercises (previous logic)
   - deutschModule is a simple scaffold for future exercises
*/

(function(){
    const App = {
        modules: {},
        dom: {},
        registerModule(name, module) { this.modules[name] = module; if (module.init) module.init(this.dom); },
        showSection(id) {
            const sections = ['start-menu','settings','game-area','deutsch','deutsch-area'];
            sections.forEach(s => {
                const el = document.getElementById(s);
                if (!el) return;
                if (s === id) el.classList.remove('hidden'); else el.classList.add('hidden');
            });
        },
        initDOM() {
            // centralize DOM references
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
                // start groessen module with selected settings
                const mode = (d.modeSelect && d.modeSelect.value) || 'distance';
                const difficulty = (d.difficultySelect && d.difficultySelect.value) || 'easy';
                if (this.modules.groessen && this.modules.groessen.startGame) this.modules.groessen.startGame(mode, difficulty);
            });
            if (this.dom.deutschStartBtn) this.dom.deutschStartBtn.addEventListener('click', () => {
                const mode = (this.dom.deutschModeSelect && this.dom.deutschModeSelect.value) || 'grammar';
                const difficulty = (this.dom.deutschDifficultySelect && this.dom.deutschDifficultySelect.value) || 'easy';
                if (this.modules.deutsch && this.modules.deutsch.start) this.modules.deutsch.start(mode, difficulty);
            });
            if (this.dom.deutschExitBtn) this.dom.deutschExitBtn.addEventListener('click', () => this.showSection('start-menu'));
        },
        init() {
            this.initDOM();
            // register modules
            this.registerModule('groessen', groessenModule);
            this.registerModule('deutsch', deutschModule);
            this.attachNavHandlers();
            // show start
            this.showSection('start-menu');
        }
    };

    /* groessenModule: unit-conversion exercises (refactored) */
    const groessenModule = (function(){
        const UNITS = {
            distance: [
                { name: 'mm', factor: 0.001 },
                { name: 'cm', factor: 0.01 },
                { name: 'dm', factor: 0.1 },
                { name: 'm', factor: 1 },
                { name: 'km', factor: 1000 }
            ],
            area: [
                { name: 'mm²', factor: 0.000001 },
                { name: 'cm²', factor: 0.0001 },
                { name: 'dm²', factor: 0.01 },
                { name: 'm²', factor: 1 }
            ],
            volume: [
                { name: 'mm³', factor: 0.000000001 },
                { name: 'cm³', factor: 0.000001 },
                { name: 'dm³', factor: 0.001 },
                { name: 'm³', factor: 1 }
            ]
        };

        let state = {
            currentScore: 0,
            currentMode: 'distance',
            currentDifficulty: 'easy',
            currentProblem: null,
            dom: null
        };

        function formatNumber(num) {
            return parseFloat(num.toPrecision(10)).toString().replace('.', ',');
        }

        function updateScore() {
            if (state.dom && state.dom.scoreDisplay) state.dom.scoreDisplay.textContent = state.currentScore;
        }

        function generateProblem() {
            const d = state.dom;
            // Reset UI
            if (d.userInput) d.userInput.value = '';
            if (d.feedbackDisplay) { d.feedbackDisplay.classList.add('hidden'); d.feedbackDisplay.className = 'feedback hidden'; }
            if (d.nextBtn) d.nextBtn.classList.add('hidden');
            if (d.checkBtn) d.checkBtn.classList.remove('hidden');
            if (d.userInput) { d.userInput.disabled = false; d.userInput.focus(); }

            const units = UNITS[state.currentMode];
            let unit1Index, unit2Index;

            if (state.currentDifficulty === 'easy') {
                unit1Index = Math.floor(Math.random() * (units.length - 1));
                unit2Index = unit1Index + 1;
                if (Math.random() > 0.5) [unit1Index, unit2Index] = [unit2Index, unit1Index];
            } else {
                unit1Index = Math.floor(Math.random() * units.length);
                do { unit2Index = Math.floor(Math.random() * units.length); } while (unit1Index === unit2Index);
            }

            const unit1 = units[unit1Index];
            const unit2 = units[unit2Index];

            let value;
            if (state.currentDifficulty === 'easy') {
                const factorDiff = unit1.factor / unit2.factor;
                if (factorDiff < 1) {
                    const multiplier = Math.round(1 / factorDiff);
                    value = Math.floor(Math.random() * 10 + 1) * multiplier;
                } else {
                    value = Math.floor(Math.random() * 20 + 1);
                }
            } else if (state.currentDifficulty === 'medium') {
                value = parseFloat((Math.random() * 100).toFixed(1));
            } else {
                value = parseFloat((Math.random() * 1000).toFixed(3));
            }

            state.currentProblem = {
                value: value,
                unitFrom: unit1,
                unitTo: unit2,
                correctAnswer: (value * unit1.factor / unit2.factor)
            };

            if (d.valueDisplay) d.valueDisplay.textContent = state.currentProblem.value;
            if (d.unitFromDisplay) d.unitFromDisplay.textContent = state.currentProblem.unitFrom.name;
            if (d.unitToDisplay) d.unitToDisplay.textContent = state.currentProblem.unitTo.name;
        }

        function checkAnswer() {
            const d = state.dom;
            const userVal = d.userInput ? parseFloat(d.userInput.value.replace(',', '.')) : NaN;
            if (isNaN(userVal)) return;
            const epsilon = 0.0001;
            const isCorrect = Math.abs(userVal - state.currentProblem.correctAnswer) < epsilon;
            if (d.feedbackDisplay) d.feedbackDisplay.classList.remove('hidden');
            if (isCorrect) {
                if (d.feedbackDisplay) { d.feedbackDisplay.textContent = "Richtig! Super gemacht! 🎉"; d.feedbackDisplay.classList.add('correct'); }
                state.currentScore += 10; updateScore();
                if (d.checkBtn) d.checkBtn.classList.add('hidden');
                if (d.nextBtn) d.nextBtn.classList.remove('hidden');
                if (d.userInput) d.userInput.disabled = true;
                if (d.nextBtn) d.nextBtn.focus();
            } else {
                if (d.feedbackDisplay) { d.feedbackDisplay.textContent = `Leider falsch. Die richtige Antwort ist ${formatNumber(state.currentProblem.correctAnswer)}.`; d.feedbackDisplay.classList.add('incorrect'); }
                if (d.checkBtn) d.checkBtn.classList.add('hidden');
                if (d.nextBtn) d.nextBtn.classList.remove('hidden');
                if (d.userInput) d.userInput.disabled = true;
                if (d.nextBtn) d.nextBtn.focus();
            }
        }

        return {
            init(dom) {
                state.dom = dom;
                // wire UI actions specific to this module
                if (dom.checkBtn) dom.checkBtn.addEventListener('click', checkAnswer);
                if (dom.nextBtn) dom.nextBtn.addEventListener('click', generateProblem);
                if (dom.userInput) dom.userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
            },
            startGame(mode, difficulty) {
                state.currentMode = mode || 'distance';
                state.currentDifficulty = difficulty || 'easy';
                state.currentScore = 0; updateScore();
                // show game area
                App.showSection('game-area');
                generateProblem();
            }
        };
    })();

    /* deutschModule: scaffold for future exercises */
    const deutschModule = (function(){
        let dom = null;
        return {
            init(_dom) { dom = _dom; },
            start(mode, difficulty) {
                // show deutsch-area and set placeholder text
                App.showSection('deutsch-area');
                if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = '0';
                const title = document.getElementById('deutsch-title');
                const placeholder = document.getElementById('deutsch-placeholder');
                if (title) title.textContent = `Deutsch — ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
                if (placeholder) placeholder.textContent = `Übungstyp: ${mode}, Schwierigkeit: ${difficulty}. Aufgaben folgen...`;
            }
        };
    })();

    // Initialize app when DOM ready
    document.addEventListener('DOMContentLoaded', () => App.init());

    // Expose App for debugging (optional)
    window.App = App;

})();
