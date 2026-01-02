/* german.js — 'deutsch' module (scaffold for exercises) */
(function(){
    const deutschModule = (function(){
        let dom = null;
        let state = {
            score: 0,
            index: 0,
            questions: [],
            difficulty: 'easy'
        };

        // Note: the master wordpool was moved to `src/data/words.json`.
        // Loading is done dynamically in `loadQuestions()` so this module is data-driven.

        // Use the shared german helpers provided by src/js/modules/german-core.browser.js
        const CORE = (typeof window !== 'undefined' && window.GermanCore) ? window.GermanCore : (function(){
            // fallback implementations (same behavior as core)
            const DIFFICULTY_TYPES = {
                easy: ['nomen','artikel','verb','adjektiv'],
                medium: ['nomen','artikel','verb','adjektiv','pronomen','praeposition'],
                hard: ['nomen','artikel','verb','adjektiv','pronomen','praeposition','adverb','konjunktion']
            };
            function normalizeType(t) {
                if (!t) return '';
                t = String(t).toLowerCase();
                if (t === 'nomen' || t === 'noun') return 'nomen';
                if (t === 'pronomen' || t === 'pronoun') return 'pronomen';
                if (t === 'verb') return 'verb';
                if (t === 'adjektiv' || t === 'adjective') return 'adjektiv';
                if (t === 'adverb' || t === 'adverbien' || t === 'umstandswort') return 'adverb';
                if (t === 'konjunktion' || t === 'konjunktionen' || t === 'konj') return 'konjunktion';
                if (t === 'praeposition' || t === 'präposition' || t === 'praepositionen') return 'praeposition';
                if (t === 'artikel' || t === 'artikelwort' || t === 'det') return 'artikel';
                return t;
            }
            function filterWordpool(wordpool, difficulty = 'easy') {
                const allowed = DIFFICULTY_TYPES[difficulty] || DIFFICULTY_TYPES.easy;
                return (Array.isArray(wordpool) ? wordpool : [])
                    .filter(item => allowed.includes(normalizeType(item[1])))
                    .map(item => ({ word: item[0], type: normalizeType(item[1]) }));
            }
            function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
            return { DIFFICULTY_TYPES, normalizeType, filterWordpool, shuffle };
        })();

        function renderSkeleton() {
            const container = document.getElementById('deutsch-content');
            if (!container) return;
            container.innerHTML = `
                <div id="grammar-exercise">
                    <div class="grammar-header">
                        <h3 id="deutsch-title">Deutsch — Grammatik</h3>
                        <p id="deutsch-instr">Wähle die richtige Wortart:</p>
                    </div>
                    <div id="grammar-question" class="card">
                        <div id="grammar-word" class="word-display" style="font-size:2rem;font-weight:bold;margin:1rem 0;">Wort</div>
                        <div id="grammar-options" class="options" style="display:flex;flex-wrap:wrap;gap:0.6rem;justify-content:center;">
                            <button class="btn option" data-type="nomen">Nomen</button>
                            <button class="btn option" data-type="pronomen">Pronomen</button>
                            <button class="btn option" data-type="verb">Verben</button>
                            <button class="btn option" data-type="adjektiv">Adjektive</button>
                            <button class="btn option" data-type="adverb">Adverbien</button>
                            <button class="btn option" data-type="konjunktion">Konjunktionen</button>
                            <button class="btn option" data-type="praeposition">Präpositionen</button>
                            <button class="btn option" data-type="artikel">Artikel</button>
                        </div>
                        <div id="grammar-feedback" class="feedback hidden"></div>
                        <div style="margin-top:0.8rem;"><button id="grammar-next" class="btn secondary hidden">Nächste</button></div>
                    </div>
                </div>
            `;
        }

        function loadQuestions(difficulty) {
            state.difficulty = difficulty || 'easy';
            const allowed = CORE.DIFFICULTY_TYPES[state.difficulty] || CORE.DIFFICULTY_TYPES.easy;
            state.questions = [];
            state.index = 0; state.score = 0;
            updateScore();

            // load wordpool from JSON file (data-driven)
            (async () => {
                try {
                    const v = Date.now();
                    const res = await fetch('src/data/words.json?v=' + v);
                    if (!res.ok) throw new Error('Failed to load words.json');
                    const wp = await res.json();
                    // filter and normalize
                    const arr = (Array.isArray(wp) ? wp : []).filter(item => allowed.includes(CORE.normalizeType(item[1])) ).slice();
                    // shuffle
                    for (let i = arr.length -1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
                    state.questions = arr.map(item => ({ word: item[0], type: CORE.normalizeType(item[1]) }));
                    state.index = 0;
                    // if the exercise is already rendered, show first question
                    showQuestion();
                } catch (err) {
                    console.error('Error loading wordpool', err);
                }
            })();
        }

        function updateScore() {
            if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = String(state.score);
        }

        function showQuestion() {
            // if questions haven't loaded yet, show a loading placeholder
            const container = document.getElementById('deutsch-content');
            if (!state.questions || state.questions.length === 0) {
                if (container) container.querySelector && container.querySelector('#grammar-word') && (container.querySelector('#grammar-word').textContent = 'Lade Aufgaben...');
                return;
            }

            // determine allowed types from the loaded questions (robust if CORE is missing)
            const allowedFromQuestions = Array.from(new Set(state.questions.map(q => q.type)));
            const allowed = (CORE && CORE.DIFFICULTY_TYPES && CORE.DIFFICULTY_TYPES[state.difficulty]) ? CORE.DIFFICULTY_TYPES[state.difficulty] : allowedFromQuestions;
            // ensure index points to an allowed question
            while (state.index < state.questions.length && !allowed.includes(state.questions[state.index].type)) {
                state.index++;
            }
            if (state.index >= state.questions.length) {
                // finished
                if (container) container.innerHTML = `<h3>Fertig!</h3><p>Dein Ergebnis: ${state.score} Punkte</p><p><button id="deutsch-finish-back" class="btn small">Zurück</button></p>`;
                const back = document.getElementById('deutsch-finish-back');
                if (back) back.addEventListener('click', () => { if (window.App) window.App.showSection('start-menu'); });
                return;
            }

            const q = state.questions[state.index];
            const wordEl = document.getElementById('grammar-word');
            const feedback = document.getElementById('grammar-feedback');
            const nextBtn = document.getElementById('grammar-next');
            if (wordEl) wordEl.textContent = q ? q.word : '';
            if (feedback) { feedback.className = 'feedback hidden'; feedback.textContent = ''; }
            if (nextBtn) nextBtn.classList.add('hidden');
            // enable options and hide those not present in allowedFromQuestions (preferred) or allowed list
            const visibleTypes = allowedFromQuestions.length ? allowedFromQuestions : allowed;
            document.querySelectorAll('#grammar-options .option').forEach(b => {
                const t = b.getAttribute('data-type');
                if (!visibleTypes.includes(t)) {
                    b.style.display = 'none';
                    b.disabled = true;
                } else {
                    b.style.display = '';
                    b.disabled = false;
                    b.classList.remove('disabled');
                }
            });
        }

        function handleOptionClick(e) {
            const btn = e.currentTarget;
            const selected = CORE.normalizeType(btn.getAttribute('data-type'));
            const q = state.questions[state.index];
            const feedback = document.getElementById('grammar-feedback');
            const nextBtn = document.getElementById('grammar-next');
            // disable options
            document.querySelectorAll('#grammar-options .option').forEach(b => b.disabled = true);
            if (selected === q.type) {
                state.score += 10; updateScore();
                if (feedback) { feedback.textContent = 'Richtig! 🎉'; feedback.className = 'feedback correct'; }
            } else {
                if (feedback) { feedback.textContent = `Falsch — richtig wäre: ${typeLabel(q.type)}`; feedback.className = 'feedback incorrect'; }
            }
            if (nextBtn) nextBtn.classList.remove('hidden');
        }

        function typeLabel(t) {
            if (!t) return '';
            switch(t) {
                case 'nomen': return 'Nomen';
                case 'pronomen': return 'Pronomen';
                case 'verb': return 'Verb';
                case 'adjektiv': return 'Adjektiv';
                case 'adverb': return 'Adverb';
                case 'konjunktion': return 'Konjunktion';
                case 'praeposition': return 'Präposition';
                case 'artikel': return 'Artikel';
                default: return t;
            }
        }

        function nextQuestion() {
            state.index++;
            if (state.index >= state.questions.length) {
                // finished
                const container = document.getElementById('deutsch-content');
                if (container) container.innerHTML = `<h3>Fertig!</h3><p>Dein Ergebnis: ${state.score} Punkte</p><p><button id="deutsch-finish-back" class="btn small">Zurück</button></p>`;
                const back = document.getElementById('deutsch-finish-back');
                if (back) back.addEventListener('click', () => { if (window.App) window.App.showSection('start-menu'); });
                return;
            }
            showQuestion();
        }

        return {
            init(_dom) { dom = _dom; },
            start(mode, difficulty) {
                // show deutsch area
                if (window.App) window.App.showSection('deutsch-area');
                if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = '0';

                // determine actual mode: prefer explicit param, else read from DOM select
                let actualMode = (typeof mode === 'string' && mode) ? String(mode).toLowerCase() : null;
                if (!actualMode && dom && dom.deutschModeSelect && dom.deutschModeSelect.value) actualMode = String(dom.deutschModeSelect.value).toLowerCase();
                if (!actualMode) actualMode = 'grammar';

                const diff = (difficulty === 'medium' || difficulty === 'hard') ? difficulty : 'easy';

                if (actualMode === 'grammar') {
                    // default grammar exercise
                    renderSkeleton();
                    // load questions (async). showQuestion will be invoked when load completes.
                    loadQuestions(diff);
                    // wire option buttons and next
                    document.querySelectorAll('#grammar-options .option').forEach(b => b.addEventListener('click', handleOptionClick));
                    const nextBtn = document.getElementById('grammar-next');
                    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
                    return;
                }

                // Reading exercise integration: accept 'reading', 'lesen' or 'read'
                if (actualMode === 'reading' || actualMode === 'lesen' || actualMode === 'read') {
                    // render a simple reading skeleton inside #deutsch-content
                    const container = document.getElementById('deutsch-content');
                    if (container) {
                        container.innerHTML = `
                            <div id="reading-area">
                                <div id="reading-content"></div>
                                <div id="reading-feedback" class="feedback hidden" aria-live="polite"></div>
                                <div style="margin-top:0.8rem;"><button id="reading-next" class="btn secondary hidden">Nächste</button></div>
                            </div>`;
                    }

                    // wire DOM into the deutsch-lesen module
                    const readingDom = Object.assign({}, dom);
                    readingDom.readingContent = document.getElementById('reading-content');
                    readingDom.nextBtn = document.getElementById('reading-next');
                    readingDom.feedbackDisplay = document.getElementById('reading-feedback');
                    // reuse deutsch score display for the reading module
                    readingDom.scoreDisplay = dom && dom.deutschScoreDisplay ? dom.deutschScoreDisplay : null;

                    // Use any registered module `deutsch-lesen` or the global shim
                    const ml = (window.App && window.App.modules && window.App.modules['deutsch-lesen']) || (window.DeutschLesen && window.DeutschLesen.createModule && window.DeutschLesen.createModule());
                    if (ml) {
                        try {
                            if (ml.init) ml.init(readingDom);
                            if (ml.start) ml.start('reading', diff);
                        } catch (err) {
                            console.error('Error starting deutsch-lesen module', err);
                            const placeholder = document.getElementById('deutsch-placeholder');
                            if (placeholder) placeholder.textContent = `Fehler beim Starten der Leseübung: ${err.message}`;
                        }
                    } else {
                        const placeholder = document.getElementById('deutsch-placeholder');
                        if (placeholder) placeholder.textContent = `Noch keine Übungen für ${actualMode}.`;
                    }
                    return;
                }

                // unsupported mode
                const placeholder = document.getElementById('deutsch-placeholder');
                if (placeholder) placeholder.textContent = `Noch keine Übungen für ${actualMode}.`;
            }
        };
    })();

    if (window.App && window.App.registerModule) {
        window.App.registerModule('deutsch', deutschModule);
    } else {
        const onApp = () => { window.App.registerModule('deutsch', deutschModule); window.removeEventListener('app:ready', onApp); };
        window.addEventListener('app:ready', onApp);
    }

})();
