import assert from 'assert';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { normalizeType, DIFFICULTY_TYPES, filterWordpool } from '../src/js/modules/german-core.js';

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

  // check normalizeType variations
  assert(normalizeType('NOMEN') === 'nomen');
  assert(normalizeType('AdJeKtIv') === 'adjektiv');

  console.log('✔ german-core basic tests passed');
}

run().catch(err => { console.error('Tests failed:', err); process.exit(1); });
