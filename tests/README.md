Tests
-----

Run the lightweight tests with Node (requires Node >= 14). No dependencies.

```bash
npm test
```

The runner (`tests/test-runner.js`) imports and executes all unit test suites:

- `german-core.test.js` — normalizeType, filterWordpool, shuffle
- `deutsch-lesen.test.js` — filterByDifficulty, pickTextPool, evaluateChoice
- `deutsch-artikel.test.js` — evaluateArtikel
- `deutsch-ordnen.test.js` — shuffleWords, evaluateSentence
- `deutsch-diktat.test.js` — getTimerDuration, evaluateDiktat
- `auth.test.js` — createUser, login, stats tracking, deletion (requires API backend)
