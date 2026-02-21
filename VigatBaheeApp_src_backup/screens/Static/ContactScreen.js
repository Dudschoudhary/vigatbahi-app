import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/theme';

const ContactScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.title}>संपर्क करें</Text>
            <Text style={styles.subtitle}>हम आपकी मदद के लिए यहाँ हैं</Text>
        </View>
        {[
            { icon: '📧', label: 'ईमेल', value: 'support@vigatbahee.com', action: () => Linking.openURL('mailto:support@vigatbahee.com') },
            { icon: '🌐', label: 'वेबसाइट', value: 'www.vigatbahee.com', action: () => Linking.openURL('https://www.vigatbahee.com') },
        ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.contactCard} onPress={item.action}>
                <Text style={styles.contactIcon}>{item.icon}</Text>
                <View>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                </View>
            </TouchableOpacity>
        ))}
        <View style={styles.msgBox}>
            <Text style={styles.msgTitle}>फीडबैक दें</Text>
            <Text style={styles.msgText}>
                आपके सुझाव और प्रतिक्रिया हमारे लिए अत्यंत महत्वपूर्ण हैं। support@vigatbahee.com पर ईमेल करें।
            </Text>
        </View>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base, paddingBottom: 40 },
    hero: { alignItems: 'center', marginBottom: SPACING.lg },
    icon: { fontSize: 52 },
    title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
    subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
    contactCard: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.base,
        backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.base,
        marginBottom: SPACING.sm, elevation: 1,
    },
    contactIcon: { fontSize: 28 },
    contactLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
    contactValue: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.primary },
    msgBox: {
        backgroundColor: '#EFF6FF', borderRadius: 12, padding: SPACING.base,
        borderLeftWidth: 4, borderLeftColor: COLORS.primary, marginTop: SPACING.sm,
    },
    msgTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
    msgText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
});

export default ContactScreen;
