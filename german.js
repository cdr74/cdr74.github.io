/* german.js — 'deutsch' module (scaffold for exercises) */
(function(){
    const deutschModule = (function(){
        let dom = null;
        return {
            init(_dom) { dom = _dom; },
            start(mode, difficulty) {
                if (window.App) window.App.showSection('deutsch-area');
                if (dom && dom.deutschScoreDisplay) dom.deutschScoreDisplay.textContent = '0';
                const title = document.getElementById('deutsch-title');
                const placeholder = document.getElementById('deutsch-placeholder');
                if (title) title.textContent = `Deutsch — ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
                if (placeholder) placeholder.textContent = `Übungstyp: ${mode}, Schwierigkeit: ${difficulty}. Aufgaben folgen...`;
                // Future: load/generate exercises based on mode+difficulty
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
