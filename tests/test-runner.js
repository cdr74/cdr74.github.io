import { testNormalizeType, testFilterWordpool, testShuffle } from './unit/german-core.test.js';
import { testFilterByDifficulty, testPickTextPool, testEvaluateChoice } from './unit/deutsch-lesen.test.js';
import { testAuthModule } from './unit/auth.test.js';
import { testEvaluateArtikel } from './unit/deutsch-artikel.test.js';
import { testShuffleWords, testEvaluateSentence } from './unit/deutsch-ordnen.test.js';
import { testGetTimerDuration, testEvaluateDiktat } from './unit/deutsch-diktat.test.js';

async function runAllTests() {
  console.log('Running unit tests...\n');

  try {
    // German Core
    console.log('german-core.js:');
    testNormalizeType();
    testFilterWordpool();
    testShuffle();

    // Deutsch Lesen
    console.log('\ndeutsch-lesen.js:');
    testFilterByDifficulty();
    testPickTextPool();
    testEvaluateChoice();

    // Deutsch Artikel
    console.log('\ndeutsch-artikel.js:');
    testEvaluateArtikel();

    // Deutsch Ordnen
    console.log('\ndeutsch-ordnen.js:');
    testShuffleWords();
    testEvaluateSentence();

    // Deutsch Diktat
    console.log('\ndeutsch-diktat.js:');
    testGetTimerDuration();
    testEvaluateDiktat();

    // Auth
    console.log('\nauth.js:');
    testAuthModule();

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Tests failed:', err);
    process.exit(1);
  }
}

runAllTests();
