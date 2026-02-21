// App-wide color palette, spacing, and typography constants

export const COLORS = {
    primary: '#3B82F6',       // Blue
    primaryDark: '#1D4ED8',
    primaryLight: '#93C5FD',
    secondary: '#10B981',     // Green
    secondaryDark: '#065F46',
    accent: '#EF4444',        // Red — for Hindi headings
    warning: '#F59E0B',
    background: '#F9FAFB',
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    textLight: '#6B7280',
    textMuted: '#9CA3AF',
    white: '#FFFFFF',
    black: '#000000',
    success: '#10B981',
    error: '#EF4444',

    // Bahee type gradients (start, end)
    vivah: ['#667EEA', '#764BA2'],
    muklawa: ['#F093FB', '#F5576C'],
    odhawani: ['#4FACFE', '#00F2FE'],
    mahera: ['#43E97B', '#38F9D7'],
    anya: ['#FA709A', '#FEE140'],
};

export const BAHEE_TYPES = [
    {
        key: 'vivah',
        label: 'विवाह',
        subLabel: 'विवाह की विगत',
        emoji: '💒',
        gradient: COLORS.vivah,
        description: 'शादी-विवाह में प्राप्त उपहार',
    },
    {
        key: 'muklawa',
        label: 'मुकलावा',
        subLabel: 'मुकलावा की विगत',
        emoji: '🎊',
        gradient: COLORS.muklawa,
        description: 'मुकलावे में प्राप्त उपहार',
    },
    {
        key: 'odhawani',
        label: 'ओढावणी',
        subLabel: 'ओढावणी की विगत',
        emoji: '👘',
        gradient: COLORS.odhawani,
        description: 'कपड़े/साड़ी भेंट की विगत',
    },
    {
        key: 'mahera',
        label: 'माहेरा',
        subLabel: 'माहेरा की विगत',
        emoji: '🎁',
        gradient: COLORS.mahera,
        description: 'माहेरे में दिए गए उपहार',
    },
    {
        key: 'anya',
        label: 'अन्य',
        subLabel: 'अन्य विगत',
        emoji: '📝',
        gradient: COLORS.anya,
        description: 'अन्य अवसरों की विगत',
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
