import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, FONTS } from '../utils/theme';

const AppFooter = () => {
    const navigation = useNavigation();
    const currentYear = new Date().getFullYear();

    return (
        <View style={styles.footer}>
            {/* Company Info */}
            <View style={styles.companySection}>
                <Text style={styles.brandName}>VIGATBAHEE</Text>
                <Text style={styles.companyDesc}>
                    डिजिटल विगत बही, शादी-विवाह से लेकर हर शुभ अवसर की।
                    आमजन के नेग-धेग की entries का सीधा समाधान, कागज़ी रजिस्टर से मुक्ति और समय की बचत के साथ।
                </Text>
            </View>

            {/* Links */}
            <View style={styles.linksRow}>
                <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                    <Text style={styles.linkText}>गोपनीयता नीति</Text>
                </TouchableOpacity>
                <Text style={styles.linkDot}>•</Text>
                <TouchableOpacity onPress={() => navigation.navigate('About')}>
                    <Text style={styles.linkText}>हमारे बारे में</Text>
                </TouchableOpacity>
                <Text style={styles.linkDot}>•</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
                    <Text style={styles.linkText}>संपर्क करें</Text>
                </TouchableOpacity>
                <Text style={styles.linkDot}>•</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HowToUse')}>
                    <Text style={styles.linkText}>उपयोग कैसे करें</Text>
                </TouchableOpacity>
            </View>

            {/* Contact Info */}
            <View style={styles.contactRow}>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:vigatbahi@gmail.com')}>
                    <Text style={styles.contactText}>📧 vigatbahi@gmail.com</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('tel:+919468650730')}>
                    <Text style={styles.contactText}>📞 +91-9468650730</Text>
                </TouchableOpacity>
            </View>

            {/* Social Links */}
            <View style={styles.socialRow}>
                <TouchableOpacity onPress={() => Linking.openURL('https://facebook.com/duda.ram.choudhary')}>
                    <Text style={styles.socialIcon}>📘</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/dudaram_choudhary_656')}>
                    <Text style={styles.socialIcon}>📸</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/@vigatbahi')}>
                    <Text style={styles.socialIcon}>▶️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://vigatbahi.me')}>
                    <Text style={styles.socialIcon}>🌐</Text>
                </TouchableOpacity>
            </View>

            {/* Copyright */}
            <View style={styles.copyrightSection}>
                <Text style={styles.copyrightText}>
                    © {currentYear} विगत बही — सर्वाधिकार सुरक्षित
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        backgroundColor: '#111827',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.xl,
        marginTop: SPACING.xl,
    },
    companySection: {
        marginBottom: SPACING.base,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    brandName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    companyDesc: {
        fontSize: FONT_SIZES.xs,
        color: '#9CA3AF',
        lineHeight: 18,
    },
    linksRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.base,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    linkText: {
        fontSize: FONT_SIZES.xs,
        color: '#D1D5DB',
    },
    linkDot: {
        fontSize: FONT_SIZES.xs,
        color: '#6B7280',
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.base,
        marginBottom: SPACING.base,
    },
    contactText: {
        fontSize: FONT_SIZES.xs,
        color: '#9CA3AF',
    },
    socialRow: {
        flexDirection: 'row',
        gap: SPACING.base,
        marginBottom: SPACING.base,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    socialIcon: {
        fontSize: 22,
    },
    copyrightSection: {
        alignItems: 'center',
    },
    copyrightText: {
        fontSize: FONT_SIZES.xs,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default AppFooter;
