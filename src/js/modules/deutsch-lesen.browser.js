/* deutsch-lesen.browser.js — browser shim + auto-register for non-ESM consumers */
(function(){
  if (window.DeutschLesen) return;

  function filterByDifficulty(texts = [], difficulty = 'easy') {
    const allowed = String(difficulty || 'easy').toLowerCase();
    return (Array.isArray(texts) ? texts : []).filter(t => String(t.difficulty || 'easy').toLowerCase() === allowed);
  }

  function pickTextPool(texts = [], difficulty = 'easy') {
    const pool = filterByDifficulty(texts, difficulty);
    return pool.slice();
  }

  function evaluateChoice(question = {}, selectedIndex) {
    const correct = Number.isFinite(+question.answer) ? +question.answer : question.answer;
    return { correct: selectedIndex === correct, selectedIndex, correctIndex: correct };
  }

  function createModule() {
    let dom = null;
    let state = { texts: [], pool: [], index: 0, score: 0 };
    let currentTimer = null;
    const DURATION = { easy: 30000, medium: 20000, hard: 10000 };

    async function loadTexts() {
      if (Array.isArray(state.texts) && state.texts.length) return state.texts;
      const v = Date.now();
      const res = await fetch('src/data/texts.json?v=' + v);
      if (!res.ok) throw new Error('Failed to load texts.json');
      state.texts = await res.json();
      return state.texts;
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

        if (dom.nextBtn) dom.nextBtn.classList.add('hidden');
        if (currentTimer) { clearTimeout(currentTimer); currentTimer = null; }
        const dur = DURATION[String(difficulty) || 'easy'] || DURATION.easy;
        currentTimer = setTimeout(() => {
          p.classList.add('covered');
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
        if (t) renderText(t);
      }
    };
  }

  window.DeutschLesen = { filterByDifficulty, pickTextPool, evaluateChoice, createModule };

  // auto-register with App if present
  const register = () => {
    if (window.App && window.App.registerModule) {
      try { window.App.registerModule('deutsch-lesen', createModule()); } catch (e) { /* ignore */ }
    }
  };

  if (window.App && window.App.registerModule) register(); else {
    const onApp = () => { register(); window.removeEventListener('app:ready', onApp); };
    window.addEventListener('app:ready', onApp);
  }

})();
