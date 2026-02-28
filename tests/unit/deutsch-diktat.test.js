import assert from 'assert';
import { getTimerDuration, evaluateDiktat } from '../../src/js/modules/deutsch-diktat.js';

export function testGetTimerDuration() {
  // Word durations
  assert.strictEqual(getTimerDuration('word', 'easy'), 5000);
  assert.strictEqual(getTimerDuration('word', 'medium'), 4000);
  assert.strictEqual(getTimerDuration('word', 'hard'), 3000);

  // Sentence durations
  assert.strictEqual(getTimerDuration('sentence', 'easy'), 8000);
  assert.strictEqual(getTimerDuration('sentence', 'medium'), 6000);
  assert.strictEqual(getTimerDuration('sentence', 'hard'), 4000);

  // Unknown type falls back to word
  assert.strictEqual(getTimerDuration('unknown', 'easy'), 5000);

  // Unknown difficulty falls back to easy
  assert.strictEqual(getTimerDuration('word', 'extreme'), 5000);

  console.log('✓ getTimerDuration tests passed');
}

export function testEvaluateDiktat() {
  // Exact match
  const res1 = evaluateDiktat('Hund', 'Hund');
  assert.strictEqual(res1.correct, true);
  assert.strictEqual(res1.input, 'Hund');
  assert.strictEqual(res1.expected, 'Hund');

  // Wrong input
  const res2 = evaluateDiktat('hund', 'Hund');
  assert.strictEqual(res2.correct, false, 'Case-sensitive comparison');

  // Trimming whitespace
  const res3 = evaluateDiktat('  Hund  ', 'Hund');
  assert.strictEqual(res3.correct, true, 'Should trim whitespace');

  // Sentence
  const res4 = evaluateDiktat('Die Katze schläft.', 'Die Katze schläft.');
  assert.strictEqual(res4.correct, true);

  // Sentence wrong
  const res5 = evaluateDiktat('Die Katze schlaft.', 'Die Katze schläft.');
  assert.strictEqual(res5.correct, false);

  // Empty input
  const res6 = evaluateDiktat('', 'Hund');
  assert.strictEqual(res6.correct, false);

  // Null input
  const res7 = evaluateDiktat(null, 'Hund');
  assert.strictEqual(res7.correct, false);

  console.log('✓ evaluateDiktat tests passed');
}
