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

        // central combined word pool (same pool used for all difficulty levels)
        const WORDPOOL_ALL = [
            // articles
            ['der','artikel'], ['die','artikel'], ['das','artikel'], ['dem','artikel'], ['den','artikel'], ['ein','artikel'], ['eine','artikel'], ['einem','artikel'], ['einen','artikel'], ['dessen','artikel'], ['welcher','artikel'],
            // nouns
            ['Haus','nomen'], ['Baum','nomen'], ['Tisch','nomen'], ['Auto','nomen'], ['Buch','nomen'], ['Katze','nomen'], ['Lehrer','nomen'], ['Schule','nomen'], ['Fenster','nomen'], ['Stadt','nomen'], ['Freund','nomen'], ['Gedanke','nomen'], ['Erfahrung','nomen'], ['Bewegung','nomen'],
            // pronouns
            ['ich','pronomen'], ['du','pronomen'], ['er','pronomen'], ['sie','pronomen'], ['wir','pronomen'], ['mich','pronomen'], ['dich','pronomen'], ['uns','pronomen'], ['euch','pronomen'], ['jemand','pronomen'], ['niemand','pronomen'],
            // verbs
            ['laufen','verb'], ['schreiben','verb'], ['springen','verb'], ['essen','verb'], ['trinken','verb'], ['lernen','verb'], ['lesen','verb'], ['spielen','verb'], ['arbeiten','verb'], ['erforschen','verb'], ['analysieren','verb'], ['beschreiben','verb'],
            // adjectives
            ['klein','adjektiv'], ['schnell','adjektiv'], ['laut','adjektiv'], ['ruhig','adjektiv'], ['schön','adjektiv'], ['kleiner','adjektiv'], ['langsam','adjektiv'], ['interessant','adjektiv'], ['hell','adjektiv'], ['kompliziert','adjektiv'], ['auffällig','adjektiv'], ['verdächtig','adjektiv'],
            // adverbs
            ['heute','adverb'], ['gestern','adverb'], ['morgen','adverb'], ['manchmal','adverb'], ['bald','adverb'], ['sofort','adverb'], ['soeben','adverb'], ['gelegentlich','adverb'], ['zufällig','adverb'],
            // conjunctions
            ['und','konjunktion'], ['aber','konjunktion'], ['oder','konjunktion'], ['weil','konjunktion'], ['denn','konjunktion'], ['jedoch','konjunktion'], ['obwohl','konjunktion'], ['während','konjunktion'], ['sodass','konjunktion'],
            // prepositions
            ['auf','praeposition'], ['mit','praeposition'], ['in','praeposition'], ['unter','praeposition'], ['neben','praeposition'], ['zwischen','praeposition'], ['trotz','praeposition'], ['wegen','praeposition']
        ];

        // difficulty -> allowed word types
        const DIFFICULTY_TYPES = {
            easy: ['nomen','artikel','verb','adjektiv'],
            medium: ['nomen','artikel','verb','adjektiv','pronomen','praeposition'],
            hard: ['nomen','artikel','verb','adjektiv','pronomen','praeposition','adverb','konjunktion']
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
            if (t === 'artikel' || t === 'artikelwort' || t === 'det') return 'artikel';
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
            const allowed = DIFFICULTY_TYPES[state.difficulty] || DIFFICULTY_TYPES.easy;
            // filter master pool by allowed types
            let arr = WORDPOOL_ALL.filter(item => allowed.includes(normalizeType(item[1])) ).slice();
            // shuffle
            for (let i = arr.length -1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
            state.questions = arr.map(item => ({ word: item[0], type: normalizeType(item[1]) }));
            state.index = 0; state.score = 0;
            updateScore();
        }

        function updateScore() {
            if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = String(state.score);
        }

        function showQuestion() {
            // skip any questions that do not match current difficulty allowed types
            const allowed = DIFFICULTY_TYPES[state.difficulty] || DIFFICULTY_TYPES.easy;
            while (state.index < state.questions.length && !allowed.includes(state.questions[state.index].type)) {
                state.index++;
            }
            if (state.index >= state.questions.length) {
                // finished
                const container = document.getElementById('deutsch-content');
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
