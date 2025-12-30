/* german.js — 'deutsch' module (scaffold for exercises) */
(function(){
    const deutschModule = (function(){
        let dom = null;
        let state = {
            score: 0,
            index: 0,
            questions: []
        };

        const WORDPOOL = {
            easy: [
                ['Haus','nomen'], ['ich','pronomen'], ['laufen','verb'], ['klein','adjektiv'],
                ['Baum','nomen'], ['du','pronomen'], ['schreiben','verb'], ['schnell','adjektiv'],
                ['heute','adverb'], ['und','konjunktion'], ['auf','praeposition']
            ],
            medium: [
                ['Tisch','nomen'], ['sie','pronomen'], ['springen','verb'], ['laut','adjektiv'],
                ['Auto','nomen'], ['wir','pronomen'], ['denken','verb'], ['ruhig','adjektiv'],
                ['gestern','adverb'], ['aber','konjunktion'], ['mit','praeposition']
            ],
            hard: [
                ['Gedanke','nomen'], ['jemand','pronomen'], ['erforschen','verb'], ['kompliziert','adjektiv'],
                ['soeben','adverb'], ['obwohl','konjunktion'], ['während','praeposition']
            ]
        };

        function normalizeType(t) {
            // unify to match labels
            if (!t) return '';
            t = t.toLowerCase();
            if (t === 'nomen' || t === 'noun') return 'nomen';
            if (t === 'pronomen' || t === 'pronoun') return 'pronomen';
            if (t === 'verb') return 'verb';
            if (t === 'adjektiv' || t === 'adjective') return 'adjektiv';
            if (t === 'adverb' || t === 'adverbien' || t === 'umstandswort') return 'adverb';
            if (t === 'konjunktion' || t === 'konjunktionen' || t === 'konj') return 'konjunktion';
            if (t === 'praeposition' || t === 'präposition' || t === 'praepositionen') return 'praeposition';
            return t;
        }

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
                        </div>
                        <div id="grammar-feedback" class="feedback hidden"></div>
                        <div style="margin-top:0.8rem;"><button id="grammar-next" class="btn secondary hidden">Nächste</button></div>
                    </div>
                </div>
            `;
        }

        function loadQuestions(difficulty) {
            const pool = WORDPOOL[difficulty] || WORDPOOL.easy;
            // shuffle and map to objects
            const arr = pool.slice();
            for (let i = arr.length -1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
            state.questions = arr.map(item => ({ word: item[0], type: normalizeType(item[1]) }));
            state.index = 0; state.score = 0;
            updateScore();
        }

        function updateScore() {
            if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = String(state.score);
        }

        function showQuestion() {
            const q = state.questions[state.index];
            const wordEl = document.getElementById('grammar-word');
            const feedback = document.getElementById('grammar-feedback');
            const nextBtn = document.getElementById('grammar-next');
            if (wordEl) wordEl.textContent = q ? q.word : '';
            if (feedback) { feedback.className = 'feedback hidden'; feedback.textContent = ''; }
            if (nextBtn) nextBtn.classList.add('hidden');
            // enable options
            document.querySelectorAll('#grammar-options .option').forEach(b => { b.disabled = false; b.classList.remove('disabled'); });
        }

        function handleOptionClick(e) {
            const btn = e.currentTarget;
            const selected = normalizeType(btn.getAttribute('data-type'));
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
                // only implement grammar exercise for now
                if (window.App) window.App.showSection('deutsch-area');
                if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = '0';
                renderSkeleton();
                if (mode !== 'grammar') {
                    const placeholder = document.getElementById('deutsch-placeholder');
                    if (placeholder) placeholder.textContent = `Noch keine Übungen für ${mode}.`; 
                    return;
                }
                // load questions
                const diff = (difficulty === 'medium' || difficulty === 'hard') ? difficulty : 'easy';
                loadQuestions(diff);
                // wire option buttons and next
                document.querySelectorAll('#grammar-options .option').forEach(b => b.addEventListener('click', handleOptionClick));
                const nextBtn = document.getElementById('grammar-next');
                if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
                showQuestion();
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
