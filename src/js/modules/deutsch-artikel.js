/* deutsch-artikel.js — pure helpers + module factory for article exercises (der/die/das) */
import { filterByDifficulty, shuffle } from './german-core.js';

export function evaluateArtikel(selected, correct) {
    return { correct: selected === correct, selected, expected: correct };
}

export function createModule(options = {}) {
    const { statsTracker } = options;
    let dom = null;
    let state = { items: [], pool: [], index: 0, score: 0, total: 10 };

    async function loadItems() {
        if (Array.isArray(state.items) && state.items.length) return state.items;
        if (typeof fetch === 'function') {
            const v = Date.now();
            const res = await fetch('src/data/artikel.json?v=' + v, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            if (!res.ok) throw new Error('Failed to load artikel.json');
            state.items = await res.json();
            return state.items;
        }
        throw new Error('No fetch available to load artikel data');
    }

    function showQuestion() {
        if (!dom) return;
        if (state.index >= state.pool.length || state.index >= state.total) {
            // finished
            if (dom.container) dom.container.innerHTML = `<h3>Fertig!</h3><p>Dein Ergebnis: ${state.score} Punkte</p><p><button id="artikel-finish-back" class="btn small">Zurück</button></p>`;
            const back = document.getElementById('artikel-finish-back');
            if (back) back.addEventListener('click', () => { if (window.App) window.App.showSection('start-menu'); });
            return;
        }
        const item = state.pool[state.index];
        if (dom.wordDisplay) dom.wordDisplay.textContent = item.noun;
        if (dom.feedbackDisplay) { dom.feedbackDisplay.className = 'feedback hidden'; dom.feedbackDisplay.textContent = ''; }
        if (dom.nextBtn) dom.nextBtn.classList.add('hidden');
        // enable buttons
        if (dom.buttons) dom.buttons.forEach(b => { b.disabled = false; b.classList.remove('artikel-correct', 'artikel-wrong'); });
    }

    function handleChoice(selected) {
        if (!dom) return;
        const item = state.pool[state.index];
        const res = evaluateArtikel(selected, item.article);

        // highlight buttons
        if (dom.buttons) dom.buttons.forEach(b => {
            b.disabled = true;
            if (b.dataset.artikel === item.article) b.classList.add('artikel-correct');
            if (b.dataset.artikel === selected && !res.correct) b.classList.add('artikel-wrong');
        });

        if (dom.feedbackDisplay) {
            dom.feedbackDisplay.classList.remove('hidden');
            dom.feedbackDisplay.textContent = res.correct ? 'Richtig! 🎉' : `Falsch — richtig ist: ${item.article} ${item.noun}`;
            dom.feedbackDisplay.className = res.correct ? 'feedback correct' : 'feedback incorrect';
        }
        if (res.correct) {
            state.score += 10;
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch', 10).catch(err => console.error('Stats tracking failed:', err));
            }
        }
        if (dom.scoreDisplay) dom.scoreDisplay.textContent = String(state.score);
        if (dom.nextBtn) dom.nextBtn.classList.remove('hidden');
    }

    return {
        init(_dom) {
            dom = _dom || {};
            if (dom.nextBtn) dom.nextBtn.addEventListener('click', () => { state.index++; showQuestion(); });
            if (dom.buttons) dom.buttons.forEach(b => b.addEventListener('click', () => handleChoice(b.dataset.artikel)));
        },
        async start(mode, difficulty) {
            state.score = 0; state.index = 0;
            if (dom && dom.scoreDisplay) dom.scoreDisplay.textContent = '0';
            await loadItems();
            const filtered = filterByDifficulty(state.items, difficulty);
            state.pool = shuffle(filtered).slice(0, state.total);
            showQuestion();
        },
        _test: { evaluateArtikel }
    };
}

export default createModule;
