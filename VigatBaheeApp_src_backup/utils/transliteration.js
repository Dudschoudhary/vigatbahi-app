/**
 * Lightweight Hindi (Devanagari) transliteration engine
 * Maps English phoneme sequences → Hindi Devanagari
 * Rule: longer patterns checked first (greedy matching)
 */

const TRANSLITERATION_MAP = [
    // Vowels (longer first)
    ['aa', 'आ'], ['ee', 'ई'], ['ii', 'ई'], ['oo', 'ऊ'], ['uu', 'ऊ'],
    ['ai', 'ऐ'], ['au', 'औ'], ['ou', 'औ'], ['ae', 'ऐ'],
    ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],

    // Consonants (longer combos first)
    ['ksh', 'क्ष'], ['gya', 'ज्ञ'], ['shr', 'श्र'], ['str', 'स्त्र'],
    ['dh', 'ध'], ['bh', 'भ'], ['ch', 'च'], ['gh', 'घ'], ['jh', 'झ'],
    ['kh', 'ख'], ['ph', 'फ'], ['sh', 'श'], ['th', 'थ'], ['zh', 'ज़'],
    ['ng', 'ङ'], ['ny', 'ञ'],
    ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'], ['t', 'त'],
    ['d', 'द'], ['n', 'न'], ['p', 'प'], ['b', 'ब'], ['m', 'म'],
    ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
    ['s', 'स'], ['h', 'ह'], ['f', 'फ'], ['z', 'ज़'], ['q', 'क'],
    ['x', 'क्स'],

    // Numbers
    ['0', '०'], ['1', '१'], ['2', '२'], ['3', '३'], ['4', '४'],
    ['5', '५'], ['6', '६'], ['7', '७'], ['8', '८'], ['9', '९'],

    // Special
    [' ', ' '], ['.', '।'], [',', ','], ['-', '-'],
];

/**
 * Transliterate English text to Hindi Devanagari
 * @param {string} text - English input
 * @returns {string} - Hindi Devanagari output
 */
export const transliterateToHindi = (text) => {
    if (!text) return '';
    let result = '';
    let i = 0;
    const lower = text.toLowerCase();

    while (i < lower.length) {
        let matched = false;
        for (const [pattern, hindi] of TRANSLITERATION_MAP) {
            if (lower.startsWith(pattern, i)) {
                result += hindi;
                i += pattern.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += text[i];
            i++;
        }
    }
    return result;
};

/**
 * Common Indian name suggestions for autocomplete
 */
export const COMMON_CASTES = [
    'ब्राह्मण', 'क्षत्रिय', 'वैश्य', 'जाट', 'गुर्जर', 'राजपूत',
    'यादव', 'कुम्हार', 'लोहार', 'बनिया', 'माली', 'धोबी', 'नाई',
];
