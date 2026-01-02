/* german-core.js - pure helpers for german exercises (testable) */
export const DIFFICULTY_TYPES = {
    easy: ['nomen','artikel','verb','adjektiv'],
    medium: ['nomen','artikel','verb','adjektiv','pronomen','praeposition'],
    hard: ['nomen','artikel','verb','adjektiv','pronomen','praeposition','adverb','konjunktion']
};

export function normalizeType(t) {
    if (!t) return '';
    t = String(t).toLowerCase();
    if (t === 'nomen' || t === 'noun') return 'nomen';
    if (t === 'pronomen' || t === 'pronoun') return 'pronomen';
    if (t === 'verb') return 'verb';
    if (t === 'adjektiv' || t === 'adjective') return 'adjektiv';
    if (t === 'adverb' || t === 'adverbien' || t === 'umstandswort') return 'adverb';
    if (t === 'konjunktion' || t === 'konjunktionen' || t === 'konj') return 'konjunktion';
    if (t === 'praeposition' || t === 'präposition' || t === 'praepositionen') return 'praeposition';
    if (t === 'artikel' || t === 'artikelwort' || t === 'det') return 'artikel';
    return t;
}

/**
 * Filter a wordpool (array of [word, type]) by difficulty and return normalized objects
 * @param {Array} wordpool
 * @param {string} difficulty
 * @returns {Array<{word:string,type:string}>}
 */
export function filterWordpool(wordpool, difficulty = 'easy') {
    const allowed = DIFFICULTY_TYPES[difficulty] || DIFFICULTY_TYPES.easy;
    return (Array.isArray(wordpool) ? wordpool : [])
        .filter(item => allowed.includes(normalizeType(item[1])))
        .map(item => ({ word: item[0], type: normalizeType(item[1]) }));
}

export function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
