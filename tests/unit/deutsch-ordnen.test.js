import assert from 'assert';
import { shuffleWords, evaluateSentence } from '../../src/js/modules/deutsch-ordnen.js';

export function testShuffleWords() {
  const words = ['Der', 'Hund', 'ist', 'gross.'];

  // Preserves length
  const shuffled = shuffleWords(words);
  assert.strictEqual(shuffled.length, words.length);

  // Preserves elements
  const sorted = [...shuffled].sort();
  assert.deepStrictEqual(sorted, [...words].sort());

  // Does not mutate original
  assert.deepStrictEqual(words, ['Der', 'Hund', 'ist', 'gross.']);

  // Empty array
  assert.deepStrictEqual(shuffleWords([]), []);

  // Single element
  assert.deepStrictEqual(shuffleWords(['Hund']), ['Hund']);

  console.log('✓ shuffleWords tests passed');
}

export function testEvaluateSentence() {
  const correct = ['Der', 'Hund', 'ist', 'gross.'];

  // Correct order
  const res1 = evaluateSentence(['Der', 'Hund', 'ist', 'gross.'], correct);
  assert.strictEqual(res1.correct, true);
  assert.strictEqual(res1.assembled, 'Der Hund ist gross.');
  assert.strictEqual(res1.expected, 'Der Hund ist gross.');

  // Wrong order
  const res2 = evaluateSentence(['Hund', 'Der', 'ist', 'gross.'], correct);
  assert.strictEqual(res2.correct, false);
  assert.strictEqual(res2.assembled, 'Hund Der ist gross.');

  // Incomplete
  const res3 = evaluateSentence(['Der', 'Hund'], correct);
  assert.strictEqual(res3.correct, false);

  // Empty
  const res4 = evaluateSentence([], correct);
  assert.strictEqual(res4.correct, false);

  console.log('✓ evaluateSentence tests passed');
}
