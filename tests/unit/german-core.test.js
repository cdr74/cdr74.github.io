import assert from 'assert';
import { normalizeType, filterWordpool, shuffle, DIFFICULTY_TYPES } from '../../src/js/modules/german-core.js';

export function testNormalizeType() {
  // Nomen
  assert.strictEqual(normalizeType('nomen'), 'nomen');
  assert.strictEqual(normalizeType('NOMEN'), 'nomen');
  assert.strictEqual(normalizeType('noun'), 'nomen');
  
  // Verb
  assert.strictEqual(normalizeType('verb'), 'verb');
  assert.strictEqual(normalizeType('VERB'), 'verb');
  
  // Adjektiv
  assert.strictEqual(normalizeType('adjektiv'), 'adjektiv');
  assert.strictEqual(normalizeType('adjective'), 'adjektiv');
  
  // Adverb
  assert.strictEqual(normalizeType('adverb'), 'adverb');
  assert.strictEqual(normalizeType('adverbien'), 'adverb');
  assert.strictEqual(normalizeType('umstandswort'), 'adverb');
  
  // Edge cases
  assert.strictEqual(normalizeType(null), '');
  assert.strictEqual(normalizeType(undefined), '');
  assert.strictEqual(normalizeType('unknown'), 'unknown');
  
  console.log('✓ normalizeType tests passed');
}

export function testFilterWordpool() {
  const testPool = [
    ['Haus', 'nomen'],
    ['der', 'artikel'],
    ['laufen', 'verb'],
    ['schnell', 'adjektiv'],
    ['heute', 'adverb'],
    ['und', 'konjunktion'],
    ['ich', 'pronomen'],
    ['auf', 'praeposition']
  ];
  
  // Easy difficulty
  const easy = filterWordpool(testPool, 'easy');
  assert.ok(easy.length > 0);
  easy.forEach(w => {
    assert.ok(DIFFICULTY_TYPES.easy.includes(w.type), 
      `Type ${w.type} should be in easy difficulty`);
  });
  
  // Medium difficulty
  const medium = filterWordpool(testPool, 'medium');
  assert.ok(medium.length >= easy.length);
  
  // Hard difficulty
  const hard = filterWordpool(testPool, 'hard');
  assert.strictEqual(hard.length, testPool.length);
  
  // Invalid input
  assert.deepStrictEqual(filterWordpool(null, 'easy'), []);
  assert.deepStrictEqual(filterWordpool(undefined, 'easy'), []);
  assert.deepStrictEqual(filterWordpool([], 'easy'), []);
  
  console.log('✓ filterWordpool tests passed');
}

export function testShuffle() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Preserves length
  const shuffled = shuffle(arr);
  assert.strictEqual(shuffled.length, arr.length);
  
  // Preserves elements
  const sorted = [...shuffled].sort((a, b) => a - b);
  assert.deepStrictEqual(sorted, arr);
  
  // Does not mutate original
  assert.deepStrictEqual(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  
  // Actually shuffles (run 10 times, at least one should differ)
  let differsAtLeastOnce = false;
  for (let i = 0; i < 10; i++) {
    const s = shuffle(arr);
    if (JSON.stringify(s) !== JSON.stringify(arr)) {
      differsAtLeastOnce = true;
      break;
    }
  }
  assert.ok(differsAtLeastOnce, 'Shuffle should change order');
  
  // Empty array
  assert.deepStrictEqual(shuffle([]), []);
  
  // Single element
  assert.deepStrictEqual(shuffle([1]), [1]);
  
  console.log('✓ shuffle tests passed');
}
