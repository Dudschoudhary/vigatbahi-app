import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BAHEE_TYPES } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            bounces={false}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.ganeshCircle}>
                    <Text style={styles.ganeshEmoji}>🕉️</Text>
                </View>
                <Text style={styles.appName}>विगत बही</Text>
                <Text style={styles.appNameEn}>Vigat Bahee</Text>
                <Text style={styles.tagline}>
                    डिजिटल विगत बही — भारतीय विवाह एवं शुभ अवसरों का{'\n'}
                    उपहार रजिस्टर
                </Text>
            </View>

            {/* Feature Highlights */}
            <View style={styles.features}>
                {[
                    { icon: '🔍', title: 'स्मार्ट खोज', desc: 'नाम, जाति, गाँव से झटपट खोज' },
                    { icon: '🌐', title: 'कहीं से भी', desc: 'मोबाइल पर कभी भी देखें' },
                    { icon: '🔐', title: 'सुरक्षित', desc: 'आपका डेटा पूरी तरह सुरक्षित' },
                    { icon: '⚡', title: 'समय की बचत', desc: 'कागज की जगह डिजिटल रिकॉर्ड' },
                ].map((f, i) => (
                    <View key={i} style={styles.featureCard}>
                        <Text style={styles.featureIcon}>{f.icon}</Text>
                        <Text style={styles.featureTitle}>{f.title}</Text>
                        <Text style={styles.featureDesc}>{f.desc}</Text>
                    </View>
                ))}
            </View>

            {/* Ceremony Types */}
            <View style={styles.ceremonies}>
                <Text style={styles.ceremoniesTitle}>किन अवसरों के लिए?</Text>
                <View style={styles.ceremoniesRow}>
                    {BAHEE_TYPES.map((t) => (
                        <View key={t.key} style={styles.ceremonyTag}>
                            <Text style={styles.ceremonyEmoji}>{t.emoji}</Text>
                            <Text style={styles.ceremonyName}>{t.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.primaryBtnText}>✨ अभी शुरू करें</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.secondaryBtnText}>पहले से खाता है? लॉगिन करें</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.footer}>© 2024 Vigat Bahee. सर्वाधिकार सुरक्षित।</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { paddingBottom: SPACING['2xl'] },
    hero: {
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: SPACING['3xl'],
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    ganeshCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.base,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    ganeshEmoji: { fontSize: 52 },
    appName: {
        fontSize: FONT_SIZES['3xl'],
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 1,
    },
    appNameEn: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 3,
        marginBottom: SPACING.md,
    },
    tagline: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: SPACING.xl,
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.base,
        gap: SPACING.sm,
        marginTop: -SPACING.xl,
    },
    featureCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.base,
        width: (width - SPACING.base * 2 - SPACING.sm) / 2,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    featureIcon: { fontSize: 28, marginBottom: SPACING.xs },
    featureTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textLight,
        textAlign: 'center',
    },
    ceremonies: { padding: SPACING.base },
    ceremoniesTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    ceremoniesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    ceremonyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        gap: 4,
        elevation: 1,
    },
    ceremonyEmoji: { fontSize: 16 },
    ceremonyName: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
    actions: { padding: SPACING.base, gap: SPACING.sm },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 3,
    },
    primaryBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    secondaryBtn: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.base,
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: FONT_SIZES.xs,
        marginTop: SPACING.lg,
    },
});

export default LandingScreen;
