/* german.js — 'deutsch' module (scaffold for exercises) - ESM */

import * as GermanCore from './src/js/modules/german-core.js';

export function createDeutschModule(dependencies = {}) {
    const { statsTracker, deutschLesenModule, deutschArtikelModule, deutschOrdnenModule, deutschDiktatModule } = dependencies;

    let dom = null;
    let state = {
        score: 0,
        index: 0,
        questions: [],
        difficulty: 'easy'
    };

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
        const allowed = GermanCore.DIFFICULTY_TYPES[state.difficulty] || GermanCore.DIFFICULTY_TYPES.easy;
        state.questions = [];
        state.index = 0; state.score = 0;
        updateScore();

        // load wordpool from JSON file (data-driven)
        (async () => {
            try {
                const v = Date.now();
                const url = 'src/data/words.json?v=' + v;
                const res = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
                if (!res.ok) throw new Error('Failed to load words.json');
                const wp = await res.json();
                // filter and normalize
                const arr = (Array.isArray(wp) ? wp : []).filter(item => allowed.includes(GermanCore.normalizeType(item[1])) ).slice();
                // shuffle
                for (let i = arr.length -1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
                state.questions = arr.map(item => ({ word: item[0], type: GermanCore.normalizeType(item[1]) }));
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

        // determine allowed types from the loaded questions (robust if GermanCore is missing)
        const allowedFromQuestions = Array.from(new Set(state.questions.map(q => q.type)));
        const allowed = GermanCore.DIFFICULTY_TYPES[state.difficulty] || allowedFromQuestions;
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
        const selected = GermanCore.normalizeType(btn.getAttribute('data-type'));
        const q = state.questions[state.index];
        const feedback = document.getElementById('grammar-feedback');
        const nextBtn = document.getElementById('grammar-next');
        // disable options
        document.querySelectorAll('#grammar-options .option').forEach(b => b.disabled = true);
        if (selected === q.type) {
            state.score += 10; updateScore();

            // Track stats (non-blocking)
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch-grammatik', 10).catch(err => {
                    console.error('Stats tracking failed:', err);
                });
            }

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
            // Check if user is logged in
            if (statsTracker && statsTracker.requireLogin) {
                if (!statsTracker.requireLogin()) {
                    return; // User needs to login first
                }
            }

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

                // Use injected deutschLesenModule or check App.modules
                const ml = deutschLesenModule || (window.App && window.App.modules && window.App.modules['deutsch-lesen']);
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

            // Artikel exercise (der/die/das)
            if (actualMode === 'artikel') {
                const container = document.getElementById('deutsch-content');
                if (container) {
                    container.innerHTML = `
                        <div id="artikel-area">
                            <h3>Artikel — Wähle den richtigen Artikel</h3>
                            <div id="artikel-word" class="word-display" style="font-size:2rem;font-weight:bold;margin:1rem 0;">Wort</div>
                            <div id="artikel-buttons" class="artikel-options">
                                <button class="btn artikel-btn" data-artikel="der">der</button>
                                <button class="btn artikel-btn" data-artikel="die">die</button>
                                <button class="btn artikel-btn" data-artikel="das">das</button>
                            </div>
                            <div id="artikel-feedback" class="feedback hidden" aria-live="polite"></div>
                            <div style="margin-top:0.8rem;"><button id="artikel-next" class="btn secondary hidden">Nächste</button></div>
                        </div>`;
                }
                const artikelDom = Object.assign({}, dom);
                artikelDom.container = document.getElementById('artikel-area');
                artikelDom.wordDisplay = document.getElementById('artikel-word');
                artikelDom.buttons = Array.from(document.querySelectorAll('#artikel-buttons .artikel-btn'));
                artikelDom.feedbackDisplay = document.getElementById('artikel-feedback');
                artikelDom.nextBtn = document.getElementById('artikel-next');
                artikelDom.scoreDisplay = dom && dom.deutschScoreDisplay ? dom.deutschScoreDisplay : null;

                const ma = deutschArtikelModule || (window.App && window.App.modules && window.App.modules['deutsch-artikel']);
                if (ma) {
                    try { if (ma.init) ma.init(artikelDom); if (ma.start) ma.start('artikel', diff); }
                    catch (err) { console.error('Error starting deutsch-artikel module', err); }
                }
                return;
            }

            // Wörter ordnen exercise
            if (actualMode === 'woerter-ordnen') {
                const container = document.getElementById('deutsch-content');
                if (container) {
                    container.innerHTML = `
                        <div id="ordnen-area">
                            <h3>Wörter ordnen — Bilde den richtigen Satz</h3>
                            <div id="ordnen-target" class="sentence-target-area"></div>
                            <div id="ordnen-pool" class="sentence-pool-area"></div>
                            <div id="ordnen-feedback" class="feedback hidden" aria-live="polite"></div>
                            <div style="margin-top:0.8rem;display:flex;gap:0.6rem;justify-content:center;">
                                <button id="ordnen-check" class="btn action">Prüfen</button>
                                <button id="ordnen-next" class="btn secondary hidden">Nächste</button>
                            </div>
                        </div>`;
                }
                const ordnenDom = Object.assign({}, dom);
                ordnenDom.container = document.getElementById('ordnen-area');
                ordnenDom.targetArea = document.getElementById('ordnen-target');
                ordnenDom.poolArea = document.getElementById('ordnen-pool');
                ordnenDom.feedbackDisplay = document.getElementById('ordnen-feedback');
                ordnenDom.checkBtn = document.getElementById('ordnen-check');
                ordnenDom.nextBtn = document.getElementById('ordnen-next');
                ordnenDom.scoreDisplay = dom && dom.deutschScoreDisplay ? dom.deutschScoreDisplay : null;

                const mo = deutschOrdnenModule || (window.App && window.App.modules && window.App.modules['deutsch-ordnen']);
                if (mo) {
                    try { if (mo.init) mo.init(ordnenDom); if (mo.start) mo.start('woerter-ordnen', diff); }
                    catch (err) { console.error('Error starting deutsch-ordnen module', err); }
                }
                return;
            }

            // Diktat exercise
            if (actualMode === 'diktat') {
                const container = document.getElementById('deutsch-content');
                if (container) {
                    container.innerHTML = `
                        <div id="diktat-area">
                            <h3>Diktat — Merke dir das Wort oder den Satz</h3>
                            <div class="diktat-timer-container"><div id="diktat-timer-bar" class="diktat-timer-bar"></div></div>
                            <div id="diktat-text" class="word-display" style="font-size:2rem;font-weight:bold;margin:1rem 0;">Wort</div>
                            <input type="text" id="diktat-input" class="diktat-input hidden" placeholder="Schreibe hier..." autocomplete="off" autocapitalize="sentences">
                            <div id="diktat-feedback" class="feedback hidden" aria-live="polite"></div>
                            <div style="margin-top:0.8rem;display:flex;gap:0.6rem;justify-content:center;">
                                <button id="diktat-check" class="btn action hidden">Prüfen</button>
                                <button id="diktat-next" class="btn secondary hidden">Nächste</button>
                            </div>
                        </div>`;
                }
                const diktatDom = Object.assign({}, dom);
                diktatDom.container = document.getElementById('diktat-area');
                diktatDom.textDisplay = document.getElementById('diktat-text');
                diktatDom.inputArea = document.getElementById('diktat-input');
                diktatDom.timerBar = document.getElementById('diktat-timer-bar');
                diktatDom.feedbackDisplay = document.getElementById('diktat-feedback');
                diktatDom.checkBtn = document.getElementById('diktat-check');
                diktatDom.nextBtn = document.getElementById('diktat-next');
                diktatDom.scoreDisplay = dom && dom.deutschScoreDisplay ? dom.deutschScoreDisplay : null;

                const md = deutschDiktatModule || (window.App && window.App.modules && window.App.modules['deutsch-diktat']);
                if (md) {
                    try { if (md.init) md.init(diktatDom); if (md.start) md.start('diktat', diff); }
                    catch (err) { console.error('Error starting deutsch-diktat module', err); }
                }
                return;
            }

            // unsupported mode
            const placeholder = document.getElementById('deutsch-placeholder');
            if (placeholder) placeholder.textContent = `Noch keine Übungen für ${actualMode}.`;
        }
    };
}
