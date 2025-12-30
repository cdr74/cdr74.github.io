/* math.js — 'groessen' module (unit conversion exercises) */
(function(){
    const groessenModule = (function(){
        const UNITS = {
            distance: [
                { name: 'mm', factor: 0.001 },
                { name: 'cm', factor: 0.01 },
                { name: 'dm', factor: 0.1 },
                { name: 'm', factor: 1 },
                { name: 'km', factor: 1000 }
            ],
            area: [
                { name: 'mm²', factor: 0.000001 },
                { name: 'cm²', factor: 0.0001 },
                { name: 'dm²', factor: 0.01 },
                { name: 'm²', factor: 1 }
            ],
            volume: [
                { name: 'mm³', factor: 0.000000001 },
                { name: 'cm³', factor: 0.000001 },
                { name: 'dm³', factor: 0.001 },
                { name: 'm³', factor: 1 }
            ]
        };

        let state = {
            currentScore: 0,
            currentMode: 'distance',
            currentDifficulty: 'easy',
            currentProblem: null,
            dom: null
        };

        function formatNumber(num) {
            return parseFloat(num.toPrecision(10)).toString().replace('.', ',');
        }

        function updateScore() {
            if (state.dom && state.dom.scoreDisplay) state.dom.scoreDisplay.textContent = state.currentScore;
        }

        function generateProblem() {
            const d = state.dom;
            if (d.userInput) d.userInput.value = '';
            if (d.feedbackDisplay) { d.feedbackDisplay.classList.add('hidden'); d.feedbackDisplay.className = 'feedback hidden'; }
            if (d.nextBtn) d.nextBtn.classList.add('hidden');
            if (d.checkBtn) d.checkBtn.classList.remove('hidden');
            if (d.userInput) { d.userInput.disabled = false; d.userInput.focus(); }

            const units = UNITS[state.currentMode];
            let unit1Index, unit2Index;

            if (state.currentDifficulty === 'easy') {
                unit1Index = Math.floor(Math.random() * (units.length - 1));
                unit2Index = unit1Index + 1;
                if (Math.random() > 0.5) [unit1Index, unit2Index] = [unit2Index, unit1Index];
            } else {
                unit1Index = Math.floor(Math.random() * units.length);
                do { unit2Index = Math.floor(Math.random() * units.length); } while (unit1Index === unit2Index);
            }

            const unit1 = units[unit1Index];
            const unit2 = units[unit2Index];

            let value;
            if (state.currentDifficulty === 'easy') {
                const factorDiff = unit1.factor / unit2.factor;
                if (factorDiff < 1) {
                    const multiplier = Math.round(1 / factorDiff);
                    value = Math.floor(Math.random() * 10 + 1) * multiplier;
                } else {
                    value = Math.floor(Math.random() * 20 + 1);
                }
            } else if (state.currentDifficulty === 'medium') {
                value = parseFloat((Math.random() * 100).toFixed(1));
            } else {
                value = parseFloat((Math.random() * 1000).toFixed(3));
            }

            state.currentProblem = {
                value: value,
                unitFrom: unit1,
                unitTo: unit2,
                correctAnswer: (value * unit1.factor / unit2.factor)
            };

            if (d.valueDisplay) d.valueDisplay.textContent = state.currentProblem.value;
            if (d.unitFromDisplay) d.unitFromDisplay.textContent = state.currentProblem.unitFrom.name;
            if (d.unitToDisplay) d.unitToDisplay.textContent = state.currentProblem.unitTo.name;
        }

        function checkAnswer() {
            const d = state.dom;
            const userVal = d.userInput ? parseFloat(d.userInput.value.replace(',', '.')) : NaN;
            if (isNaN(userVal)) return;
            const epsilon = 0.0001;
            const isCorrect = Math.abs(userVal - state.currentProblem.correctAnswer) < epsilon;
            if (d.feedbackDisplay) d.feedbackDisplay.classList.remove('hidden');
            if (isCorrect) {
                if (d.feedbackDisplay) { d.feedbackDisplay.textContent = "Richtig! Super gemacht! 🎉"; d.feedbackDisplay.classList.add('correct'); }
                state.currentScore += 10; updateScore();
                if (d.checkBtn) d.checkBtn.classList.add('hidden');
                if (d.nextBtn) d.nextBtn.classList.remove('hidden');
                if (d.userInput) d.userInput.disabled = true;
                if (d.nextBtn) d.nextBtn.focus();
            } else {
                if (d.feedbackDisplay) { d.feedbackDisplay.textContent = `Leider falsch. Die richtige Antwort ist ${formatNumber(state.currentProblem.correctAnswer)}.`; d.feedbackDisplay.classList.add('incorrect'); }
                if (d.checkBtn) d.checkBtn.classList.add('hidden');
                if (d.nextBtn) d.nextBtn.classList.remove('hidden');
                if (d.userInput) d.userInput.disabled = true;
                if (d.nextBtn) d.nextBtn.focus();
            }
        }

        return {
            init(dom) {
                state.dom = dom;
                if (dom.checkBtn) dom.checkBtn.addEventListener('click', checkAnswer);
                if (dom.nextBtn) dom.nextBtn.addEventListener('click', generateProblem);
                if (dom.userInput) dom.userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });
            },
            startGame(mode, difficulty) {
                state.currentMode = mode || 'distance';
                state.currentDifficulty = difficulty || 'easy';
                state.currentScore = 0; updateScore();
                if (window.App) window.App.showSection('game-area');
                generateProblem();
            }
        };
    })();

    if (window.App && window.App.registerModule) {
        window.App.registerModule('groessen', groessenModule);
    } else {
        // if App hasn't loaded yet, register when available
        const onApp = () => { window.App.registerModule('groessen', groessenModule); window.removeEventListener('app:ready', onApp); };
        window.addEventListener('app:ready', onApp);
    }

})();
