// App-wide color palette, spacing, and typography constants

export const COLORS = {
    // Brand Tailwind
    primary: '#2563EB', // blue-600
    secondary: '#16A34A', // green-600
    accent: '#DB2777', // pink-600

    // Tailwind Gradients
    blueGradient: ['#3B82F6', '#2563EB'], // from-blue-500 to-blue-600
    greenGradient: ['#22C55E', '#16A34A'], // from-green-500 to-green-600
    pinkGradient: ['#EC4899', '#DB2777'], // from-pink-500 to-pink-600
    bgGradient: ['#EFF6FF', '#FFFFFF', '#F0FDF4'], // blue-50, white, green-50

    // Tailwind Grays
    text: '#111827', // gray-900
    textLight: '#374151', // gray-700
    textMuted: '#4B5563', // gray-600
    border: '#E5E7EB', // gray-200
    background: '#F9FAFB', // gray-50
    white: '#FFFFFF',

    // Status
    success: '#22C55E', // green-500
    error: '#EF4444',   // red-500
    warning: '#F59E0B', // amber-500
};

export const BAHEE_TYPES = [
    {
        key: 'vivah',
        label: 'विवाह',
        subLabel: 'विवाह की विगत',
        emoji: '💒',
        gradient: COLORS.blueGradient,
        description: 'शादी-विवाह में प्राप्त उपहार',
    },
    {
        key: 'muklawa',
        label: 'मुकलावा',
        subLabel: 'मुकलावा की विगत',
        emoji: '🎊',
        gradient: COLORS.blueGradient,
        description: 'मुकलावा दस्तूर के रिकॉर्ड',
    },
    {
        key: 'odhawani',
        label: 'ओढावणी',
        subLabel: 'ओढावणी की विगत',
        emoji: '👘',
        gradient: COLORS.blueGradient,
        description: 'पहनावा और भेंट',
    },
    {
        key: 'mahera',
        label: 'माहेरा',
        subLabel: 'माहेरा की विगत',
        emoji: '🎁',
        gradient: COLORS.blueGradient,
        description: 'मामा पक्ष से प्राप्त नेग',
    },
    {
        key: 'anya',
        label: 'अन्य',
        subLabel: 'अन्य विगत',
        emoji: '📝',
        gradient: COLORS.blueGradient,
        description: 'अन्य समारोह रिकॉर्ड',
    },
];

export const FONT_SIZES = {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
};

export const FONTS = {
    regular: 'Hind-Regular',
    bold: 'Hind-Bold',
    heading: 'YatraOne-Regular',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
};

export const BORDER_RADIUS = {
    sm: 6,
    md: 10,
    lg: 16,
    full: 999,
};
