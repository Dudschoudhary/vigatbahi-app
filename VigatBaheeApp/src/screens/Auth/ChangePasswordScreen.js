import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { authAPI } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

// PwdField defined OUTSIDE to prevent keyboard dismiss on re-render
const PwdField = ({ label, value, onChangeText, show, onToggle }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.row}>
            <TextInput
                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!show}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity style={styles.eye} onPress={onToggle}>
                <Text>{show ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const ChangePasswordScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const handleChange = async () => {
        if (!form.current) { Alert.alert('त्रुटि', 'वर्तमान पासवर्ड दर्ज करें'); return; }
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!strongRegex.test(form.newPwd)) {
            Alert.alert('कमजोर पासवर्ड', '8+ अक्षर, एक बड़ा, एक छोटा, एक अंक और एक विशेष चिन्ह होना चाहिए');
            return;
        }
        if (form.newPwd !== form.confirm) { Alert.alert('त्रुटि', 'नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाता'); return; }

        setLoading(true);
        try {
            await authAPI.changePassword({ currentPassword: form.current, newPassword: form.newPwd });
            Alert.alert('सफल', 'पासवर्ड बदल दिया गया। कृपया फिर से लॉगिन करें।', [
                { text: 'ठीक है', onPress: logout },
            ]);
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'पासवर्ड बदलने में त्रुटि');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.tip}>
                <Text style={styles.tipText}>
                    🔐 नया पासवर्ड मजबूत होना चाहिए: 8+ अक्षर, एक बड़ा अक्षर, एक छोटा अक्षर, एक अंक और एक विशेष चिन्ह (@$!%*?&)
                </Text>
            </View>
            <PwdField label="वर्तमान पासवर्ड *" value={form.current} onChangeText={set('current')} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            <PwdField label="नया पासवर्ड *" value={form.newPwd} onChangeText={set('newPwd')} show={showNew} onToggle={() => setShowNew(!showNew)} />
            <PwdField label="नया पासवर्ड कन्फर्म करें *" value={form.confirm} onChangeText={set('confirm')} show={showNew} onToggle={() => setShowNew(!showNew)} />

            <TouchableOpacity
                style={[styles.btn, loading && { opacity: 0.6 }]}
                onPress={handleChange}
                disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>पासवर्ड बदलें</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.base },
    tip: {
        backgroundColor: '#EFF6FF', borderRadius: 12, padding: SPACING.base,
        borderLeftWidth: 4, borderLeftColor: COLORS.primary, marginBottom: SPACING.lg,
    },
    tipText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, lineHeight: 20 },
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
    btn: {
        backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
        paddingVertical: 15, alignItems: 'center', marginTop: SPACING.sm,
    },
    btnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
});

export default ChangePasswordScreen;
