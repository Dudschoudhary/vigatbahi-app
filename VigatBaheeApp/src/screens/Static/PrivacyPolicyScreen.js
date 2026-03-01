import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../utils/theme';

const sections = [
    {
        t: 'जानकारी संग्रह',
        c: 'हम केवल वह जानकारी एकत्र करते हैं जो आप स्वेच्छा से प्रदान करते हैं, जैसे: नाम, ईमेल पता, फ़ोन नंबर, और विगत बही का डेटा (प्रविष्टियाँ, नाम, राशि आदि)। हम आपकी सहमति के बिना कोई भी व्यक्तिगत जानकारी एकत्र नहीं करते।',
    },
    {
        t: 'डेटा का उपयोग',
        c: 'आपका डेटा केवल विगत बही सेवा प्रदान करने के लिए उपयोग किया जाता है। इसमें आपकी बहियों का प्रबंधन, प्रविष्टियों का रखरखाव और आपके खाते की सुरक्षा शामिल है। हम आपका डेटा किसी तीसरे पक्ष को न बेचते हैं और न ही साझा करते हैं।',
    },
    {
        t: 'डेटा सुरक्षा',
        c: 'आपके पासवर्ड को bcrypt एन्क्रिप्शन से सुरक्षित किया जाता है। सभी डेटा ट्रांसफर HTTPS प्रोटोकॉल से सुरक्षित है। हम MongoDB Atlas के सुरक्षित क्लाउड डेटाबेस पर आपका डेटा संग्रहीत करते हैं।',
    },
    {
        t: 'तृतीय पक्ष सेवाएं',
        c: 'हम Google AdSense और Google Analytics जैसी तृतीय पक्ष सेवाओं का उपयोग करते हैं जो अपनी गोपनीयता नीतियों के तहत काम करती हैं। ये सेवाएं उपयोग संबंधी गुमनाम जानकारी एकत्र कर सकती हैं।',
    },
    {
        t: 'कुकीज और स्थानीय डेटा',
        c: 'हमारा ऐप आपके लॉगिन टोकन और सत्र जानकारी को सुरक्षित रूप से आपके डिवाइस पर संग्रहीत करता है। यह केवल आपकी सुविधा के लिए है ताकि आपको बार-बार लॉगिन न करना पड़े।',
    },
    {
        t: 'आपके अधिकार',
        c: 'आप किसी भी समय अपना पूरा डेटा मांग सकते हैं या उसे हटवा सकते हैं। खाता बंद करने के लिए या डेटा हटाने के लिए हमसे संपर्क करें।',
    },
    {
        t: 'नीति में परिवर्तन',
        c: 'हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। किसी भी महत्वपूर्ण परिवर्तन की सूचना आपको ईमेल द्वारा दी जाएगी।',
    },
    {
        t: 'संपर्क करें',
        c: 'गोपनीयता संबंधी किसी भी प्रश्न के लिए हमसे संपर्क करें:\nईमेल: dudsoffice656@gmail.com\nवेबसाइट: vigatbahi.me',
    },
];

const PrivacyPolicyScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>गोपनीयता नीति</Text>
        <Text style={styles.updated}>अंतिम अपडेट: फरवरी 2026</Text>
        <Text style={styles.intro}>
            विगत बही में आपका स्वागत है। यह गोपनीयता नीति बताती है कि हम आपकी जानकारी कैसे एकत्र करते हैं, उपयोग करते हैं और सुरक्षित रखते हैं।
        </Text>
        {sections.map((item, i) => (
            <View key={i} style={styles.section}>
                <Text style={styles.sectionTitle}>{i + 1}. {item.t}</Text>
                <Text style={styles.para}>{item.c}</Text>
            </View>
        ))}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base, paddingBottom: 40 },
    title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
    updated: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
    intro: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 22, marginBottom: SPACING.base, paddingBottom: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    section: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.base, marginBottom: SPACING.sm, elevation: 1 },
    sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
    para: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 24 },
});

export default PrivacyPolicyScreen;

