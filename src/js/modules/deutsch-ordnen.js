/* deutsch-ordnen.js — pure helpers + module factory for word ordering exercises */
import { filterByDifficulty, shuffle } from './german-core.js';

export function shuffleWords(words) {
    return shuffle(words.slice());
}

export function evaluateSentence(assembled, correct) {
    const assembledStr = assembled.join(' ');
    const correctStr = correct.join(' ');
    return { correct: assembledStr === correctStr, assembled: assembledStr, expected: correctStr };
}

export function createModule(options = {}) {
    const { statsTracker } = options;
    let dom = null;
    let state = { items: [], pool: [], index: 0, score: 0, total: 10, assembled: [], shuffled: [], questionStartTime: null };

    async function loadItems() {
        if (Array.isArray(state.items) && state.items.length) return state.items;
        if (typeof fetch === 'function') {
            const v = Date.now();
            const res = await fetch('src/data/saetze.json?v=' + v, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            if (!res.ok) throw new Error('Failed to load saetze.json');
            state.items = await res.json();
            return state.items;
        }
        throw new Error('No fetch available to load saetze data');
    }

    function renderTiles() {
        if (!dom) return;
        // render pool tiles
        if (dom.poolArea) {
            dom.poolArea.innerHTML = '';
            state.shuffled.forEach((word, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn tile-word';
                btn.textContent = word;
                btn.dataset.poolIndex = i;
                btn.addEventListener('click', () => moveToTarget(i));
                dom.poolArea.appendChild(btn);
            });
        }
        // render target tiles
        if (dom.targetArea) {
            dom.targetArea.innerHTML = '';
            state.assembled.forEach((word, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn tile-word tile-placed';
                btn.textContent = word;
                btn.dataset.targetIndex = i;
                btn.addEventListener('click', () => moveToPool(i));
                dom.targetArea.appendChild(btn);
            });
            if (state.assembled.length === 0) {
                dom.targetArea.innerHTML = '<span class="target-hint">Tippe die Wörter in der richtigen Reihenfolge an</span>';
            }
        }
    }

    function moveToTarget(poolIndex) {
        const word = state.shuffled[poolIndex];
        if (word === null) return; // already moved
        state.assembled.push(word);
        state.shuffled[poolIndex] = null;
        renderTiles();
    }

    function moveToPool(targetIndex) {
        const word = state.assembled[targetIndex];
        // find first null slot or push to end of shuffled
        const emptySlot = state.shuffled.indexOf(null);
        if (emptySlot !== -1) { state.shuffled[emptySlot] = word; }
        else { state.shuffled.push(word); }
        state.assembled.splice(targetIndex, 1);
        renderTiles();
    }

    function showQuestion() {
        if (!dom) return;
        if (state.index >= state.pool.length || state.index >= state.total) {
            if (dom.container) dom.container.innerHTML = `<h3>Fertig!</h3><p>Dein Ergebnis: ${state.score} Punkte</p><p><button id="ordnen-finish-back" class="btn small">Zurück</button></p>`;
            const back = document.getElementById('ordnen-finish-back');
            if (back) back.addEventListener('click', () => { if (window.App) window.App.showSection('start-menu'); });
            return;
        }
        const item = state.pool[state.index];
        state.shuffled = shuffleWords(item.words);
        state.assembled = [];
        if (dom.feedbackDisplay) { dom.feedbackDisplay.className = 'feedback hidden'; dom.feedbackDisplay.textContent = ''; }
        if (dom.checkBtn) dom.checkBtn.classList.remove('hidden');
        if (dom.nextBtn) dom.nextBtn.classList.add('hidden');
        state.questionStartTime = Date.now();
        renderTiles();
    }

    function checkAnswer() {
        if (!dom) return;
        const elapsed = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        const item = state.pool[state.index];
        const res = evaluateSentence(state.assembled, item.words);

        if (dom.feedbackDisplay) {
            dom.feedbackDisplay.classList.remove('hidden');
            dom.feedbackDisplay.textContent = res.correct ? 'Richtig!' : `Falsch — richtig ist: ${res.expected}`;
            dom.feedbackDisplay.className = res.correct ? 'feedback correct' : 'feedback incorrect';
        }
        if (res.correct) {
            state.score += 10;
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch-ordnen', 10).catch(err => console.error('Stats tracking failed:', err));
            }
        } else {
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch-ordnen', 0).catch(err => console.error('Stats tracking failed:', err));
            }
        }
        if (elapsed > 0 && statsTracker && statsTracker.saveResponseTime) {
            statsTracker.saveResponseTime('deutsch-ordnen', elapsed);
        }
        if (dom.scoreDisplay) dom.scoreDisplay.textContent = String(state.score);
        if (dom.checkBtn) dom.checkBtn.classList.add('hidden');
        if (dom.nextBtn) dom.nextBtn.classList.remove('hidden');
    }

    return {
        init(_dom) {
            dom = _dom || {};
            if (dom.checkBtn) dom.checkBtn.addEventListener('click', checkAnswer);
            if (dom.nextBtn) dom.nextBtn.addEventListener('click', () => { state.index++; showQuestion(); });
        },
        async start(mode, difficulty) {
            state.score = 0; state.index = 0; state.assembled = []; state.shuffled = [];
            if (dom && dom.scoreDisplay) dom.scoreDisplay.textContent = '0';
            await loadItems();
            const filtered = filterByDifficulty(state.items, difficulty);
            state.pool = shuffle(filtered).slice(0, state.total);
            showQuestion();
        },
        _test: { shuffleWords, evaluateSentence }
    };
}

export default createModule;
