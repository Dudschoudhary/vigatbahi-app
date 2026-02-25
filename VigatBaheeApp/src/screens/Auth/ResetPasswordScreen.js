import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { authAPI } from '../../api/apiClient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

const ResetPasswordScreen = ({ navigation, route }) => {
    const token = route?.params?.token || '';
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleReset = async () => {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongRegex.test(password)) {
            Alert.alert('कमजोर पासवर्ड', '8+ अक्षर, एक बड़ा, एक छोटा, एक अंक और @$!%*?& में से एक चिन्ह');
            return;
        }
        if (password !== confirm) { Alert.alert('त्रुटि', 'पासवर्ड मेल नहीं खाता'); return; }
        if (!token) { Alert.alert('त्रुटि', 'रीसेट टोकन नहीं मिला'); return; }

        setLoading(true);
        try {
            await authAPI.resetPassword({ token, newPassword: password });
            setDone(true);
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'रीसेट में त्रुटि हुई');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <View style={styles.centered}>
                <Text style={{ fontSize: 60 }}>✅</Text>
                <Text style={styles.successTitle}>पासवर्ड रीसेट हो गया!</Text>
                <Text style={styles.successSub}>आप अब नए पासवर्ड से लॉगिन कर सकते हैं।</Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.btnText}>लॉगिन करें</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>नया पासवर्ड सेट करें</Text>
            <View style={styles.field}>
                <Text style={styles.label}>नया पासवर्ड *</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!show}
                        placeholder="नया पासवर्ड"
                        placeholderTextColor={COLORS.textMuted}
                    />
                    <TouchableOpacity style={styles.eye} onPress={() => setShow(!show)}>
                        <Text>{show ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>पासवर्ड कन्फर्म करें *</Text>
                <TextInput
                    style={styles.input}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!show}
                    placeholder="पासवर्ड दोबारा"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>
            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleReset} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>पासवर्ड सेट करें</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.xl },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, gap: SPACING.base },
    title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
    successTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
    successSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center' },
    field: { marginBottom: SPACING.base },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    row: { flexDirection: 'row' },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.base,
        color: COLORS.text, backgroundColor: COLORS.white,
    },
    eye: {
        borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 0,
        borderTopRightRadius: BORDER_RADIUS.md, borderBottomRightRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm, backgroundColor: COLORS.white, justifyContent: 'center',
    },
    btn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 15, alignItems: 'center' },
    btnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});

export default ResetPasswordScreen;
