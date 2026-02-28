import assert from 'assert';
import { evaluateArtikel } from '../../src/js/modules/deutsch-artikel.js';

export function testEvaluateArtikel() {
  // Correct answer
  const correct = evaluateArtikel('der', 'der');
  assert.strictEqual(correct.correct, true);
  assert.strictEqual(correct.selected, 'der');
  assert.strictEqual(correct.expected, 'der');

  // Incorrect answer
  const incorrect = evaluateArtikel('die', 'der');
  assert.strictEqual(incorrect.correct, false);
  assert.strictEqual(incorrect.selected, 'die');
  assert.strictEqual(incorrect.expected, 'der');

  // All three articles
  assert.strictEqual(evaluateArtikel('das', 'das').correct, true);
  assert.strictEqual(evaluateArtikel('die', 'die').correct, true);
  assert.strictEqual(evaluateArtikel('der', 'die').correct, false);
  assert.strictEqual(evaluateArtikel('das', 'der').correct, false);

  console.log('✓ evaluateArtikel tests passed');
}
