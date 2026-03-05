/**
 * Hindi (Devanagari) transliteration engine — v2
 * Proper maatraa (vowel sign), halant (virama), and conjunct support.
 *
 * Rules:
 *   - Vowels at word start / after another vowel → standalone form (अ, आ, इ …)
 *   - Vowels after a consonant → maatraa form (ा, ि, ी …)
 *   - Two consonants in a row → first gets halant (्) to form conjunct
 *   - Consonant at end of word → inherent 'a' is assumed (no halant)
 *   - 'a' after consonant → silent (inherent), 'aa' → ा
 */

// ── Standalone vowels ────────────────────────────────────────────────────────
const VOWELS = [
    ['aa', 'आ'], ['ee', 'ई'], ['ii', 'ई'], ['oo', 'ऊ'], ['uu', 'ऊ'],
    ['ai', 'ऐ'], ['au', 'औ'], ['ou', 'औ'], ['ae', 'ऐ'],
    ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],
];

// ── Vowel → maatraa map (used after consonant) ──────────────────────────────
const MAATRAA = {
    'aa': 'ा', 'ee': 'ी', 'ii': 'ी', 'oo': 'ू', 'uu': 'ू',
    'ai': 'ै', 'au': 'ौ', 'ou': 'ौ', 'ae': 'ै',
    'a': '',   // inherent — no maatraa needed
    'i': 'ि', 'u': 'ु', 'e': 'े', 'o': 'ो',
};

// ── Consonant patterns (longer first for greedy match) ───────────────────────
const CONSONANTS = [
    ['ksh', 'क्ष'], ['gya', null], // gya handled specially — ज्ञ + inherent a
    ['shr', 'श्र'],
    ['shh', 'ष'],
    ['dh', 'ध'], ['bh', 'भ'], ['ch', 'च'], ['gh', 'घ'], ['jh', 'झ'],
    ['kh', 'ख'], ['ph', 'फ'], ['sh', 'श'], ['th', 'थ'], ['zh', 'ज़'],
    ['ng', 'ङ'], ['ny', 'ञ'], ['tr', 'त्र'], ['dr', 'द्र'],
    ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'], ['t', 'त'],
    ['d', 'द'], ['n', 'न'], ['p', 'प'], ['b', 'ब'], ['m', 'म'],
    ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
    ['s', 'स'], ['h', 'ह'], ['f', 'फ'], ['z', 'ज़'], ['q', 'क'],
    ['x', 'क्स'],
];

// Sets for quick lookup
const VOWEL_KEYS = VOWELS.map(v => v[0]);
const CONSONANT_MAP = {};
CONSONANTS.forEach(([k, v]) => { CONSONANT_MAP[k] = v; });

const HALANT = '्';

// ── Special characters ───────────────────────────────────────────────────────
const SPECIAL = {
    '.': '।', ',': ',', '-': '-', '?': '?', '!': '!',
    '(': '(', ')': ')', '/': '/', ':': ':', ';': ';', "'": "'", '"': '"',
};

// ── Number mapping ───────────────────────────────────────────────────────────
const NUMBERS = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

/**
 * Try to match a vowel pattern at position `i` in `lower`.
 * Returns [vowelKey, length] or null.
 */
function matchVowel(lower, i) {
    // Try longer patterns first
    for (const [key] of VOWELS) {
        if (lower.startsWith(key, i)) {
            return [key, key.length];
        }
    }
    return null;
}

/**
 * Try to match a consonant pattern at position `i` in `lower`.
 * Returns [devanagari, length] or null.
 */
function matchConsonant(lower, i) {
    for (const [key, val] of CONSONANTS) {
        if (lower.startsWith(key, i)) {
            // Special case: 'gya' → ज्ञ (treat as consonant)
            if (key === 'gya') {
                return ['ज्ञ', 3];
            }
            return [val, key.length];
        }
    }
    return null;
}

/**
 * Transliterate English text to Hindi Devanagari.
 *
 * State machine:
 *   pendingConsonant = null   → no consonant waiting
 *   pendingConsonant = "क"   → last emitted was consonant, awaiting vowel/next
 *
 * @param {string} text - English/Romanized input
 * @returns {string} - Hindi Devanagari output
 */
export const transliterateToHindi = (text) => {
    if (!text) return '';
    let result = '';
    let i = 0;
    const lower = text.toLowerCase();
    let pendingConsonant = null; // Devanagari consonant waiting for vowel

    while (i < lower.length) {
        const ch = lower[i];

        // ── Numbers ─────────────────────────────────────────────────────
        if (NUMBERS[ch] !== undefined) {
            if (pendingConsonant) {
                result += pendingConsonant; // flush consonant with inherent 'a'
                pendingConsonant = null;
            }
            result += NUMBERS[ch];
            i++;
            continue;
        }

        // ── Space / special ─────────────────────────────────────────────
        if (ch === ' ' || SPECIAL[ch] !== undefined) {
            if (pendingConsonant) {
                result += pendingConsonant; // flush with inherent 'a'
                pendingConsonant = null;
            }
            result += ch === ' ' ? ' ' : (SPECIAL[ch] || ch);
            i++;
            continue;
        }

        // ── Try vowel match ─────────────────────────────────────────────
        const vowelMatch = matchVowel(lower, i);
        if (vowelMatch) {
            const [vowelKey, len] = vowelMatch;
            if (pendingConsonant) {
                // Consonant + vowel → consonant + maatraa
                result += pendingConsonant + (MAATRAA[vowelKey] || '');
                pendingConsonant = null;
            } else {
                // Standalone vowel (word start or after another vowel)
                const standaloneEntry = VOWELS.find(v => v[0] === vowelKey);
                result += standaloneEntry ? standaloneEntry[1] : '';
            }
            i += len;
            continue;
        }

        // ── Try consonant match ─────────────────────────────────────────
        const consonantMatch = matchConsonant(lower, i);
        if (consonantMatch) {
            const [devanagari, len] = consonantMatch;
            if (pendingConsonant) {
                // Consonant + consonant → first consonant + halant
                result += pendingConsonant + HALANT;
            }
            pendingConsonant = devanagari;
            i += len;
            continue;
        }

        // ── Unrecognized character — pass through ───────────────────────
        if (pendingConsonant) {
            result += pendingConsonant;
            pendingConsonant = null;
        }
        result += text[i];
        i++;
    }

    // Flush trailing consonant (inherent 'a')
    if (pendingConsonant) {
        result += pendingConsonant;
    }

    return result;
};

/**
 * Common Indian caste/community names for autocomplete
 */
export const COMMON_CASTES = [
    'ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'जाट', 'गुर्जर', 'राजपूत',
    'यादव', 'कुम्हार', 'लोहार', 'बनिया', 'माली', 'धोबी', 'नाई',
];
