// State
let currentScore = 0;
let currentMode = 'distance';
let currentDifficulty = 'easy';
let currentProblem = null;

// DOM Elements
const settingsSection = document.getElementById('settings');
const gameAreaSection = document.getElementById('game-area');
const startMenuSection = document.getElementById('start-menu');
const deutschSection = document.getElementById('deutsch');
const modeSelect = document.getElementById('mode');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const btnGroessen = document.getElementById('btn-groessen');
const btnDeutsch = document.getElementById('btn-deutsch');
const deutschBackBtn = document.getElementById('deutsch-back');
const scoreDisplay = document.getElementById('score');
const valueDisplay = document.getElementById('value-display');
const unitFromDisplay = document.getElementById('unit-from');
const unitToDisplay = document.getElementById('unit-to');
const userInput = document.getElementById('user-input');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const feedbackDisplay = document.getElementById('feedback');

// Unit Definitions
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

// Event Listeners
startBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', showStartMenu);
if (btnGroessen) btnGroessen.addEventListener('click', showGroessenSettings);
if (btnDeutsch) btnDeutsch.addEventListener('click', showDeutsch);
if (deutschBackBtn) deutschBackBtn.addEventListener('click', showStartMenu);
checkBtn.addEventListener('click', checkAnswer);
nextBtn.addEventListener('click', nextProblem);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

function startGame() {
    currentMode = modeSelect.value;
    currentDifficulty = difficultySelect.value;
    currentScore = 0;
    updateScore();

    // Hide menus and show game area
    if (startMenuSection) startMenuSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    gameAreaSection.classList.remove('hidden');

    generateProblem();
}

function showSettings() {
    gameAreaSection.classList.add('hidden');
    settingsSection.classList.remove('hidden');
}

function showStartMenu() {
    // Show the start menu and hide other sections
    if (startMenuSection) startMenuSection.classList.remove('hidden');
    if (settingsSection) settingsSection.classList.add('hidden');
    if (gameAreaSection) gameAreaSection.classList.add('hidden');
    if (deutschSection) deutschSection.classList.add('hidden');
}

function showGroessenSettings() {
    if (startMenuSection) startMenuSection.classList.add('hidden');
    if (deutschSection) deutschSection.classList.add('hidden');
    settingsSection.classList.remove('hidden');
    gameAreaSection.classList.add('hidden');
}

function showDeutsch() {
    if (startMenuSection) startMenuSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    gameAreaSection.classList.add('hidden');
    if (deutschSection) deutschSection.classList.remove('hidden');
}

function updateScore() {
    scoreDisplay.textContent = currentScore;
}

function generateProblem() {
    // Reset UI
    userInput.value = '';
    feedbackDisplay.classList.add('hidden');
    feedbackDisplay.className = 'feedback hidden';
    nextBtn.classList.add('hidden');
    checkBtn.classList.remove('hidden');
    userInput.disabled = false;
    userInput.focus();

    const units = UNITS[currentMode];
    let unit1Index, unit2Index;

    // Select units based on difficulty
    if (currentDifficulty === 'easy') {
        // Adjacent units
        unit1Index = Math.floor(Math.random() * (units.length - 1));
        unit2Index = unit1Index + 1;
        // Randomly swap direction
        if (Math.random() > 0.5) [unit1Index, unit2Index] = [unit2Index, unit1Index];
    } else {
        // Any units
        unit1Index = Math.floor(Math.random() * units.length);
        do {
            unit2Index = Math.floor(Math.random() * units.length);
        } while (unit1Index === unit2Index);
    }

    const unit1 = units[unit1Index];
    const unit2 = units[unit2Index];

    // Generate value
    let value;
    if (currentDifficulty === 'easy') {
        // Ensure integer result for easy mode
        // If converting smaller to larger (e.g. mm to cm), start with multiple of 10
        // If converting larger to smaller (e.g. cm to mm), start with any small integer

        const factorDiff = unit1.factor / unit2.factor;

        if (factorDiff < 1) {
            // unit1 is smaller than unit2 (e.g. mm -> cm). factorDiff is 0.1
            // We need value * factorDiff to be integer. 
            // So value must be multiple of 1/factorDiff.
            const multiplier = Math.round(1 / factorDiff);
            value = Math.floor(Math.random() * 10 + 1) * multiplier;
        } else {
            // unit1 is larger than unit2 (e.g. cm -> mm). factorDiff is 10.
            // Any integer value works.
            value = Math.floor(Math.random() * 20 + 1);
        }
    } else if (currentDifficulty === 'medium') {
        // Simple decimals allowed (e.g. 0.5, 1.5)
        value = (Math.random() * 100).toFixed(1);
        // Remove trailing .0
        value = parseFloat(value);
    } else {
        // Harder decimals
        value = (Math.random() * 1000).toFixed(3);
        value = parseFloat(value);
    }

    currentProblem = {
        value: value,
        unitFrom: unit1,
        unitTo: unit2,
        correctAnswer: (value * unit1.factor / unit2.factor)
    };

    // Display
    valueDisplay.textContent = currentProblem.value;
    unitFromDisplay.textContent = currentProblem.unitFrom.name;
    unitToDisplay.textContent = currentProblem.unitTo.name;
}

function checkAnswer() {
    const userVal = parseFloat(userInput.value.replace(',', '.')); // Allow comma as decimal separator

    if (isNaN(userVal)) return;

    // Calculate tolerance for floating point comparison
    const epsilon = 0.0001;
    const isCorrect = Math.abs(userVal - currentProblem.correctAnswer) < epsilon;

    feedbackDisplay.classList.remove('hidden');

    if (isCorrect) {
        feedbackDisplay.textContent = "Richtig! Super gemacht! 🎉";
        feedbackDisplay.classList.add('correct');
        currentScore += 10;
        updateScore();
        checkBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        userInput.disabled = true;
        nextBtn.focus();
    } else {
        feedbackDisplay.textContent = `Leider falsch. Die richtige Antwort ist ${formatNumber(currentProblem.correctAnswer)}.`;
        feedbackDisplay.classList.add('incorrect');
        checkBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        userInput.disabled = true;
        nextBtn.focus();
    }
}

function nextProblem() {
    generateProblem();
}

function formatNumber(num) {
    // Helper to format number nicely (remove unnecessary trailing zeros, handle float precision issues)
    return parseFloat(num.toPrecision(10)).toString().replace('.', ',');
}
