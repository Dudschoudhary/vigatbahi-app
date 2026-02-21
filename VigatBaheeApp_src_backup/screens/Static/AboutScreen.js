import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/theme';

const Section = ({ title, content }) => (
    <View style={styles.section}>
        {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
        <Text style={styles.para}>{content}</Text>
    </View>
);

const AboutScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
            <Text style={styles.heroIcon}>🕉️</Text>
            <Text style={styles.heroTitle}>विगत बही के बारे में</Text>
            <Text style={styles.heroSub}>About Vigat Bahee</Text>
        </View>
        <Section content="विगत बही एक डिजिटल उपहार रजिस्टर है जो भारतीय विवाह और सामाजिक समारोहों में प्राप्त उपहारों और नकद राशि को रिकॉर्ड करने में मदद करता है।" />
        <Section title="हमारा उद्देश्य" content="परंपरागत 'बही' (खाता बही) को डिजिटल रूप देना जिससे परिवार अपने समारोहों में मिले उपहारों को आसानी से ट्रैक कर सकें।" />
        <Section title="विशेषताएं" content="• हिंदी ट्रांसलिटरेशन सपोर्ट\n• 5 प्रकार की विगत (विवाह, मुकलावा, ओढावणी, माहेरा, अन्य)\n• हिंदू तिथि स्वतः गणना\n• एंट्री लॉक सुविधा\n• खोज और पृष्ठांकन\n• सुरक्षित JWT प्रमाणीकरण" />
        <Section title="संस्करण" content="Vigat Bahee v1.0.0\n© 2024 सर्वाधिकार सुरक्षित" />
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base, paddingBottom: 40 },
    hero: { alignItems: 'center', paddingVertical: SPACING.xl, backgroundColor: COLORS.white, borderRadius: 16, marginBottom: SPACING.base, elevation: 2 },
    heroIcon: { fontSize: 52 },
    heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.sm },
    heroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
    section: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.base, marginBottom: SPACING.sm, elevation: 1 },
    sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
    para: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
});

export default AboutScreen;
