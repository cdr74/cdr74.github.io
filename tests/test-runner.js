import { testNormalizeType, testFilterWordpool, testShuffle } from './unit/german-core.test.js';
import { testFilterByDifficulty, testPickTextPool, testEvaluateChoice } from './unit/deutsch-lesen.test.js';
import { testAuthModule } from './unit/auth.test.js';

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
