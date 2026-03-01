/* deutsch-diktat.js — pure helpers + module factory for dictation exercises */
import { filterByDifficulty, shuffle } from './german-core.js';

const TIMER_DURATIONS = {
    word:     { easy: 5000, medium: 4000, hard: 3000 },
    sentence: { easy: 8000, medium: 6000, hard: 4000 }
};

export function getTimerDuration(type, difficulty) {
    const t = TIMER_DURATIONS[type] || TIMER_DURATIONS.word;
    return t[difficulty] || t.easy;
}

export function evaluateDiktat(input, expected) {
    const trimmed = (input || '').trim();
    return { correct: trimmed === expected, input: trimmed, expected };
}

export function createModule(options = {}) {
    const { statsTracker } = options;
    let dom = null;
    let state = { items: [], pool: [], index: 0, score: 0, total: 10, currentDifficulty: 'easy', questionStartTime: null };
    let currentTimer = null;

    async function loadItems() {
        if (Array.isArray(state.items) && state.items.length) return state.items;
        if (typeof fetch === 'function') {
            const v = Date.now();
            const res = await fetch('src/data/diktate.json?v=' + v, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
            if (!res.ok) throw new Error('Failed to load diktate.json');
            state.items = await res.json();
            return state.items;
        }
        throw new Error('No fetch available to load diktate data');
    }

    function showQuestion() {
        if (!dom) return;
        if (currentTimer) { clearTimeout(currentTimer); currentTimer = null; }

        if (state.index >= state.pool.length || state.index >= state.total) {
            if (dom.container) dom.container.innerHTML = `<h3>Fertig!</h3><p>Dein Ergebnis: ${state.score} Punkte</p><p><button id="diktat-finish-back" class="btn small">Zurück</button></p>`;
            const back = document.getElementById('diktat-finish-back');
            if (back) back.addEventListener('click', () => { if (window.App) window.App.showSection('start-menu'); });
            return;
        }

        const item = state.pool[state.index];
        const duration = getTimerDuration(item.type, state.currentDifficulty);

        // show text
        if (dom.textDisplay) { dom.textDisplay.textContent = item.text; dom.textDisplay.classList.remove('hidden'); }
        if (dom.inputArea) { dom.inputArea.classList.add('hidden'); dom.inputArea.value = ''; }
        if (dom.checkBtn) dom.checkBtn.classList.add('hidden');
        if (dom.nextBtn) dom.nextBtn.classList.add('hidden');
        if (dom.feedbackDisplay) { dom.feedbackDisplay.className = 'feedback hidden'; dom.feedbackDisplay.textContent = ''; }

        // timer bar animation
        if (dom.timerBar) {
            dom.timerBar.classList.remove('hidden');
            dom.timerBar.style.transition = 'none';
            dom.timerBar.style.width = '100%';
            // force reflow
            void dom.timerBar.offsetWidth;
            dom.timerBar.style.transition = `width ${duration}ms linear`;
            dom.timerBar.style.width = '0%';
        }

        // after duration, hide text and show input
        currentTimer = setTimeout(() => {
            if (dom.textDisplay) dom.textDisplay.classList.add('hidden');
            if (dom.inputArea) { dom.inputArea.classList.remove('hidden'); dom.inputArea.focus(); }
            if (dom.checkBtn) dom.checkBtn.classList.remove('hidden');
            if (dom.timerBar) dom.timerBar.classList.add('hidden');
            state.questionStartTime = Date.now(); // start timing from when input appears
            currentTimer = null;
        }, duration);
    }

    function checkAnswer() {
        if (!dom || !dom.inputArea) return;
        const elapsed = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        const item = state.pool[state.index];
        const res = evaluateDiktat(dom.inputArea.value, item.text);

        if (dom.feedbackDisplay) {
            dom.feedbackDisplay.classList.remove('hidden');
            dom.feedbackDisplay.textContent = res.correct ? 'Richtig! 🎉' : `Falsch — richtig ist: ${res.expected}`;
            dom.feedbackDisplay.className = res.correct ? 'feedback correct' : 'feedback incorrect';
        }
        if (res.correct) {
            state.score += 10;
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch-diktat', 10).catch(err => console.error('Stats tracking failed:', err));
            }
        } else {
            if (statsTracker && statsTracker.trackGameCompletion) {
                statsTracker.trackGameCompletion('deutsch-diktat', 0).catch(err => console.error('Stats tracking failed:', err));
            }
        }
        if (elapsed > 0 && statsTracker && statsTracker.saveResponseTime) {
            statsTracker.saveResponseTime('deutsch-diktat', elapsed);
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
            state.score = 0; state.index = 0;
            state.currentDifficulty = difficulty || 'easy';
            if (dom && dom.scoreDisplay) dom.scoreDisplay.textContent = '0';
            await loadItems();
            const filtered = filterByDifficulty(state.items, difficulty);
            state.pool = shuffle(filtered).slice(0, state.total);
            showQuestion();
        },
        _test: { getTimerDuration, evaluateDiktat }
    };
}

export default createModule;
