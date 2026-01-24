import assert from 'assert';
import { filterByDifficulty, pickTextPool, evaluateChoice } from '../../src/js/modules/deutsch-lesen.js';

export function testFilterByDifficulty() {
  const texts = [
    { id: 'e1', difficulty: 'easy', title: 'Easy 1' },
    { id: 'e2', difficulty: 'easy', title: 'Easy 2' },
    { id: 'm1', difficulty: 'medium', title: 'Medium 1' },
    { id: 'h1', difficulty: 'hard', title: 'Hard 1' }
  ];
  
  const easy = filterByDifficulty(texts, 'easy');
  assert.strictEqual(easy.length, 2);
  assert.ok(easy.every(t => t.difficulty === 'easy'));
  
  const medium = filterByDifficulty(texts, 'medium');
  assert.strictEqual(medium.length, 1);
  
  const hard = filterByDifficulty(texts, 'hard');
  assert.strictEqual(hard.length, 1);
  
  // Invalid inputs
  assert.deepStrictEqual(filterByDifficulty(null, 'easy'), []);
  assert.deepStrictEqual(filterByDifficulty(undefined, 'easy'), []);
  
  console.log('✓ filterByDifficulty tests passed');
}

export function testPickTextPool() {
  const texts = [
    { id: 'e1', difficulty: 'easy' },
    { id: 'e2', difficulty: 'easy' }
  ];
  
  const pool = pickTextPool(texts, 'easy');
  assert.strictEqual(pool.length, 2);
  
  // Returns shallow copy (mutation doesn't affect original)
  pool.push({ id: 'e3', difficulty: 'easy' });
  assert.strictEqual(texts.length, 2);
  
  console.log('✓ pickTextPool tests passed');
}

export function testEvaluateChoice() {
  const question = {
    q: 'Test question?',
    choices: ['A', 'B', 'C'],
    answer: 1
  };
  
  // Correct answer
  const correct = evaluateChoice(question, 1);
  assert.strictEqual(correct.correct, true);
  assert.strictEqual(correct.selectedIndex, 1);
  assert.strictEqual(correct.correctIndex, 1);
  
  // Incorrect answer
  const incorrect = evaluateChoice(question, 0);
  assert.strictEqual(incorrect.correct, false);
  assert.strictEqual(incorrect.selectedIndex, 0);
  assert.strictEqual(incorrect.correctIndex, 1);
  
  console.log('✓ evaluateChoice tests passed');
}
