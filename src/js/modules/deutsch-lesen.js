/* deutsch-lesen.js — pure helpers + module factory for reading comprehension exercises */
export function filterByDifficulty(texts = [], difficulty = 'easy') {
  const allowed = String(difficulty || 'easy').toLowerCase();
  return (Array.isArray(texts) ? texts : []).filter(t => String(t.difficulty || 'easy').toLowerCase() === allowed);
}

export function pickTextPool(texts = [], difficulty = 'easy') {
  const pool = filterByDifficulty(texts, difficulty);
  return pool.slice(); // return shallow copy
}

export function evaluateChoice(question = {}, selectedIndex) {
  const correct = Number.isFinite(+question.answer) ? +question.answer : question.answer;
  return { correct: selectedIndex === correct, selectedIndex, correctIndex: correct };
}

export function createModule(options = {}) {
  let dom = null;
  let state = { texts: [], pool: [], index: 0, score: 0 };
  let currentTimer = null;
  const DURATION = { easy: 30000, medium: 20000, hard: 10000 };

  async function loadTexts() {
    if (Array.isArray(state.texts) && state.texts.length) return state.texts;
    if (typeof fetch === 'function') {
      const v = Date.now();
      const res = await fetch('src/data/texts.json?v=' + v);
      if (!res.ok) throw new Error('Failed to load texts.json');
      state.texts = await res.json();
      return state.texts;
    }
    throw new Error('No fetch available to load texts');
  }

  function renderText(t, difficulty = 'easy') {
    if (!dom) return;
    const container = dom.readingContent || null;
    if (container) {
      container.innerHTML = '';
      const h = document.createElement('h3'); h.textContent = t.title || '';
      const p = document.createElement('p'); p.textContent = t.text || '';
      container.appendChild(h); container.appendChild(p);

      // prepare question element but keep it hidden until text is covered
      const q = t.questions && t.questions[0];
      const qEl = document.createElement('div'); qEl.className = 'mc-question';
      if (q) {
        const qText = document.createElement('p'); qText.textContent = q.q;
        qEl.appendChild(qText);
        const opts = document.createElement('div'); opts.className = 'mc-options';
        (q.choices || []).forEach((c, i) => {
          const btn = document.createElement('button'); btn.className = 'btn option'; btn.textContent = c;
          btn.dataset.index = i; btn.addEventListener('click', () => handleChoice(q, i));
          opts.appendChild(btn);
        });
        qEl.appendChild(opts);
      }
      container.appendChild(qEl);

      // hide next button until after answer
      if (dom.nextBtn) dom.nextBtn.classList.add('hidden');

      // clear any previous timer
      if (currentTimer) { clearTimeout(currentTimer); currentTimer = null; }
      const dur = DURATION[String(difficulty) || 'easy'] || DURATION.easy;
      // after duration, cover the text and reveal the question
      currentTimer = setTimeout(() => {
        p.classList.add('covered');
        // optionally hide text content for screenreaders
        p.setAttribute('aria-hidden', 'true');
        currentTimer = null;
      }, dur);
    }
  }

  function handleChoice(question, idx) {
    if (!dom) return;
    const res = evaluateChoice(question, idx);
    if (dom.feedbackDisplay) {
      dom.feedbackDisplay.classList.remove('hidden');
      dom.feedbackDisplay.textContent = res.correct ? 'Richtig! 🎉' : `Leider falsch. Die richtige Antwort ist: ${question.choices[question.answer]}`;
      dom.feedbackDisplay.className = res.correct ? 'feedback correct' : 'feedback incorrect';
    }
    if (res.correct) state.score += 10;
    if (dom.scoreDisplay) dom.scoreDisplay.textContent = String(state.score);
    if (dom.nextBtn) dom.nextBtn.classList.remove('hidden');
  }

  return {
    init(_dom) {
      dom = _dom || {};
      if (dom.nextBtn) dom.nextBtn.addEventListener('click', async () => {
        state.index = (state.index + 1) % (state.pool.length || 1);
        const t = state.pool[state.index];
        if (t) renderText(t);
      });
    },
    async start(mode = 'reading', difficulty = 'easy') {
      state.score = 0; if (dom && dom.scoreDisplay) dom.scoreDisplay.textContent = String(state.score);
      await loadTexts();
      state.pool = pickTextPool(state.texts, difficulty);
      state.index = 0;
      const t = state.pool[0];
      if (t) renderText(t, difficulty);
    },
    // expose internal helpers for testing
    _test: { filterByDifficulty, pickTextPool, evaluateChoice }
  };
}

export default createModule;
