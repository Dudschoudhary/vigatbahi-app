import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { authAPI } from '../../api/apiClient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            Alert.alert('त्रुटि', 'वैध ईमेल पता दर्ज करें');
            return;
        }
        setLoading(true);
        try {
            await authAPI.forgotPassword(email.trim().toLowerCase());
            setSent(true);
        } catch {
            Alert.alert('त्रुटि', 'कुछ गलत हुआ, पुनः प्रयास करें');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.iconBox}>
                <Text style={styles.icon}>🔑</Text>
            </View>
            <Text style={styles.title}>पासवर्ड भूल गए?</Text>
            <Text style={styles.subtitle}>
                अपना रजिस्टर्ड ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट लिंक भेजेंगे।
            </Text>

            {sent ? (
                <View style={styles.successBox}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successText}>
                        रीसेट लिंक आपके ईमेल पर भेज दिया गया है। कृपया अपना ईमेल चेक करें।
                    </Text>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.btnText}>लॉगिन पर जाएं</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.form}>
                    <Text style={styles.label}>ईमेल पता *</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={COLORS.textMuted}
                    />
                    <TouchableOpacity
                        style={[styles.btn, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.btnText}>रीसेट लिंक भेजें</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
                        <Text style={styles.backLinkText}>← वापस जाएं</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flex: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
    iconBox: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    },
    icon: { fontSize: 42 },
    title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
    subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
    form: { width: '100%' },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.base, color: COLORS.text, backgroundColor: COLORS.white, marginBottom: SPACING.base,
    },
    btn: {
        backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
        paddingVertical: 15, alignItems: 'center',
    },
    btnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    backLink: { alignItems: 'center', marginTop: SPACING.base },
    backLinkText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
    successBox: { width: '100%', alignItems: 'center', gap: SPACING.base },
    successIcon: { fontSize: 52 },
    successText: {
        fontSize: FONT_SIZES.base, color: COLORS.text, textAlign: 'center',
        backgroundColor: '#F0FDF4', borderRadius: 12, padding: SPACING.base, lineHeight: 22,
    },
});

export default ForgotPasswordScreen;
