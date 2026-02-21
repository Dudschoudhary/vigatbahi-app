/**
 * Hindu Calendar (Panchang) Tithi Calculator
 * Calculates the lunar date (tithi) from a given Gregorian date
 * using sun-moon angular difference.
 */

const MASA_NAMES = [
    'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
    'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन',
];

const TITHI_NAMES_SHUKLA = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
];

const TITHI_NAMES_KRISHNA = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या',
];

const toRadians = (deg) => (deg * Math.PI) / 180;

// Simplified Sun longitude calculation (degrees)
const getSunLongitude = (jd) => {
    const n = jd - 2451545.0;
    const L = (280.46646 + 0.9856474 * n) % 360;
    const g = toRadians((357.52911 + 0.98560028 * n) % 360);
    const C = 1.914602 * Math.sin(g) + 0.019993 * Math.sin(2 * g);
    return (L + C + 360) % 360;
};

// Simplified Moon longitude calculation (degrees)
const getMoonLongitude = (jd) => {
    const n = jd - 2451545.0;
    const L = (218.316 + 13.176396 * n) % 360;
    const M = toRadians((134.963 + 13.064993 * n) % 360);
    const F = toRadians((93.272 + 13.229350 * n) % 360);
    const lon = L + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * F - M);
    return (lon + 360) % 360;
};

// Convert Gregorian date to Julian Day Number
const toJulianDay = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const A = Math.floor((14 - m) / 12);
    const Y = y + 4800 - A;
    const M = m + 12 * A - 3;
    return d + Math.floor((153 * M + 2) / 5) + 365 * Y +
        Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
};

// Get approximate Hindu month from sun longitude
const getHinduMonth = (sunLon) => {
    const monthIndex = Math.floor(((sunLon + 23.85) % 360) / 30); // approximate
    return MASA_NAMES[Math.min(monthIndex, 11)];
};

/**
 * Calculate Tithi from a date
 * @param {Date} date
 * @returns {{ masa: string, paksha: string, tithi: string, formatted: string }}
 */
export const calculateTithi = (date) => {
    try {
        const jd = toJulianDay(date);
        const sunLon = getSunLongitude(jd);
        const moonLon = getMoonLongitude(jd);

        let diff = (moonLon - sunLon + 360) % 360;
        const tithiIndex = Math.floor(diff / 12); // 0-29

        const paksha = tithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';
        const localIndex = tithiIndex % 15;

        let tithiName;
        if (tithiIndex < 15) {
            tithiName = TITHI_NAMES_SHUKLA[localIndex];
        } else {
            tithiName = TITHI_NAMES_KRISHNA[localIndex];
        }

        const masa = getHinduMonth(sunLon);

        return {
            masa,
            paksha,
            tithi: tithiName,
            formatted: `${masa} मास, ${paksha} ${tithiName}`,
        };
    } catch (error) {
        return {
            masa: '',
            paksha: '',
            tithi: '',
            formatted: '',
        };
    }
};
