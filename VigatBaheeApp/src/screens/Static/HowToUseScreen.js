import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/theme';

const steps = [
    { no: '1', title: 'रजिस्टर करें', desc: 'ऐप खोलें → "अभी शुरू करें" → फॉर्म भरें → रजिस्टर करें' },
    { no: '2', title: 'विगत का प्रकार चुनें', desc: '"नई विगत जोड़ें" पर जाएं और विवाह/मुकलावा/ओढावणी/माहेरा/अन्य में से एक चुनें' },
    { no: '3', title: 'विगत हेडर भरें', desc: 'समारोह का नाम (जैसे "राम की शादी"), तिथि दर्ज करें। हिंदू तिथि स्वतः गणना होगी।' },
    { no: '4', title: 'प्रविष्टियाँ जोड़ें', desc: 'हर मेहमान की जाति, नाम, पिता का नाम, गाँव, आवता और ऊपर नेट भरें। हिंदी टाइपिंग के लिए "हि" बटन दबाएं।' },
    { no: '5', title: 'खोज और देखें', desc: '"विगत देखें" में जाकर खोजें, पृष्ठांकन करें, एंट्री लॉक करें या हटाएं।' },
];

const HowToUseScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
            <Text style={styles.heroIcon}>📖</Text>
            <Text style={styles.title}>उपयोग कैसे करें</Text>
        </View>
        {steps.map((step) => (
            <View key={step.no} style={styles.step}>
                <View style={styles.stepNo}><Text style={styles.stepNoText}>{step.no}</Text></View>
                <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
            </View>
        ))}
        <View style={styles.tip}>
            <Text style={styles.tipTitle}>💡 टिप: हिंदी ट्रांसलिटरेशन</Text>
            <Text style={styles.tipText}>
                "हि" बटन ON करने के बाद अंग्रेजी में टाइप करें, जैसे "ram" टाइप करने पर "राम" लिखा जाएगा।
            </Text>
        </View>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base, paddingBottom: 40 },
    hero: { alignItems: 'center', marginBottom: SPACING.lg },
    heroIcon: { fontSize: 48 },
    title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
    step: {
        flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12,
        padding: SPACING.base, marginBottom: SPACING.sm, gap: SPACING.sm, elevation: 1,
    },
    stepNo: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    stepNoText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.sm },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
    stepDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20 },
    tip: {
        backgroundColor: '#FFF7ED', borderRadius: 12, padding: SPACING.base,
        borderLeftWidth: 4, borderLeftColor: COLORS.warning,
    },
    tipTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#92400E', marginBottom: SPACING.xs },
    tipText: { fontSize: FONT_SIZES.sm, color: '#92400E', lineHeight: 20 },
});

export default HowToUseScreen;
