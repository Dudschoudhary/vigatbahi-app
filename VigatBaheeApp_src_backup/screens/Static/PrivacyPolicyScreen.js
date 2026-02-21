import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/theme';

const PrivacyPolicyScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>गोपनीयता नीति</Text>
        <Text style={styles.updated}>अंतिम अपडेट: जनवरी 2024</Text>
        {[
            { t: 'जानकारी संग्रह', c: 'हम केवल वह जानकारी एकत्र करते हैं जो आप स्वेच्छा से प्रदान करते हैं जैसे नाम, ईमेल, और विगत डेटा।' },
            { t: 'डेटा उपयोग', c: 'आपका डेटा केवल Vigat Bahee सेवा प्रदान करने के लिए उपयोग किया जाता है। हम आपका डेटा किसी तीसरे पक्ष को नहीं बेचते।' },
            { t: 'डेटा सुरक्षा', c: 'हम आपके पासवर्ड को bcrypt से एन्क्रिप्ट करते हैं। सभी डेटा ट्रांसफर HTTPS से सुरक्षित है।' },
            { t: 'आपके अधिकार', c: 'आप अपना पूरा डेटा मांग सकते हैं या हटवा सकते हैं। संपर्क करें: support@vigatbahee.com' },
        ].map((item, i) => (
            <View key={i} style={styles.section}>
                <Text style={styles.sectionTitle}>{item.t}</Text>
                <Text style={styles.para}>{item.c}</Text>
            </View>
        ))}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base, paddingBottom: 40 },
    title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
    updated: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.base },
    section: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.base, marginBottom: SPACING.sm, elevation: 1 },
    sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
    para: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
});

export default PrivacyPolicyScreen;
