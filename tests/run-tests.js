import assert from 'assert';
import fs from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { normalizeType, DIFFICULTY_TYPES, filterWordpool, shuffle } from '../src/js/modules/german-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadWords() {
  const p = path.join(__dirname, '../src/data/words.json');
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function run() {
  const words = await loadWords();
  // basic sanity checks
  assert(Array.isArray(words), 'words.json should be an array');
  const filteredEasy = filterWordpool(words, 'easy');
  if (!filteredEasy.length) throw new Error('filteredEasy empty — unexpected');
  // every returned type must be allowed for easy
  const bad = filteredEasy.filter(w => !DIFFICULTY_TYPES.easy.includes(w.type));
  assert(bad.length === 0, 'Easy filter returned disallowed types: ' + JSON.stringify(bad.slice(0,3)));

  // medium and hard should also only return allowed types
  const filteredMedium = filterWordpool(words, 'medium');
  const badMed = filteredMedium.filter(w => !DIFFICULTY_TYPES.medium.includes(w.type));
  assert(badMed.length === 0, 'Medium filter returned disallowed types: ' + JSON.stringify(badMed.slice(0,3)));

  const filteredHard = filterWordpool(words, 'hard');
  const badHard = filteredHard.filter(w => !DIFFICULTY_TYPES.hard.includes(w.type));
  assert(badHard.length === 0, 'Hard filter returned disallowed types: ' + JSON.stringify(badHard.slice(0,3)));

  // shape checks: filterWordpool should return objects with word and type
  const shapeCheck = filteredEasy.every(w => w && typeof w.word === 'string' && typeof w.type === 'string');
  assert(shapeCheck, 'filterWordpool should return objects with {word,type}');

  // shuffle: preserves elements and length
  const sample = [1,2,3,4,5,6,7,8,9];
  const shuffled = shuffle(sample);
  assert(Array.isArray(shuffled), 'shuffle should return an array');
  assert(shuffled.length === sample.length, 'shuffle should preserve length');
  const sameElements = [...sample].sort().join(',') === [...shuffled].sort().join(',');
  assert(sameElements, 'shuffle should preserve elements');

  // test the browser shim attaches to global.window.GermanCore
  global.window = {};
  const shimPath = path.join(__dirname, '../src/js/modules/german-core.browser.js');
  await import(pathToFileURL(shimPath).href);
  assert(window.GermanCore && typeof window.GermanCore.normalizeType === 'function', 'browser shim should expose window.GermanCore');

  // --- math/groessen module tests -------------------------------------
  // Prepare a fake global window.App so importing math.js registers the module
  global.window = global.window || {};
  window.App = {
    modules: {},
    registerModule(name, module) { this.modules[name] = module; },
    showSection() {}
  };

  // import the browser-ready math entry which registers 'groessen'
  const mathPath = path.join(__dirname, '../math.js');
  await import(pathToFileURL(mathPath).href);
  const groessen = window.App.modules.groessen;
  assert(groessen && typeof groessen.init === 'function' && typeof groessen.startGame === 'function', 'groessen module should be registered with expected API');

  // Create a minimal DOM mock used by the module
  const dom = {
    scoreDisplay: { textContent: '' },
    valueDisplay: { textContent: '' },
    unitFromDisplay: { textContent: '' },
    unitToDisplay: { textContent: '' },
    userInput: { value: '', disabled: false, addEventListener() {}, focus() {} },
    checkBtn: { addEventListener(evt, fn) { this._click = fn; }, classList: { add() {}, remove() {} } },
    nextBtn: { addEventListener(evt, fn) { this._clickNext = fn; }, classList: { add() {}, remove() {} }, focus() {} },
    feedbackDisplay: { classList: { add() {}, remove() {} }, className: '', textContent: '' }
  };

  // Initialize module with mock DOM and start a game
  groessen.init(dom);
  groessen.startGame('distance', 'easy');

  // After startGame, the module should populate value and units
  assert(dom.valueDisplay.textContent !== '', 'valueDisplay should be populated after startGame');
  assert(dom.unitFromDisplay.textContent !== '' && dom.unitToDisplay.textContent !== '', 'unit displays should be populated');

  // compute expected answer using known factors (mirrors module logic)
  const FACTORS = { mm: 0.001, cm: 0.01, dm: 0.1, m: 1, km: 1000, 'mm²': 0.000001, 'cm²': 0.0001, 'dm²': 0.01, 'm²': 1, 'mm³': 0.000000001, 'cm³': 0.000001, 'dm³': 0.001, 'm³': 1 };
  const val = parseFloat(String(dom.valueDisplay.textContent).replace(',', '.'));
  const from = dom.unitFromDisplay.textContent;
  const to = dom.unitToDisplay.textContent;
  const expected = val * (FACTORS[from] / FACTORS[to]);

  // answer and simulate check button click
  dom.userInput.value = String(expected);
  // call stored click handler
  if (dom.checkBtn._click) dom.checkBtn._click();

  // score should have increased (easy gives 10)
  assert(String(dom.scoreDisplay.textContent) === '10', 'scoreDisplay should update to 10 after correct answer');

  // check normalizeType variations
  assert(normalizeType('NOMEN') === 'nomen');
  assert(normalizeType('AdJeKtIv') === 'adjektiv');

  console.log('✔ german-core basic tests passed');
}

run().catch(err => { console.error('Tests failed:', err); process.exit(1); });
