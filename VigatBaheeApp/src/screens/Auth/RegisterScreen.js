import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

// Field component defined OUTSIDE to prevent re-creation on every render
const Field = ({ label, fKey, value, onChangeText, placeholder, keyboardType = 'default', secure = false, secureToggle, showPwd, onTogglePwd, error }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label} *</Text>
        <View style={styles.inputRow}>
            <TextInput
                style={[styles.input, error && styles.inputError, secureToggle && styles.inputFlex]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                autoCapitalize="none"
                secureTextEntry={secure && !showPwd}
                placeholderTextColor={COLORS.textMuted}
            />
            {secureToggle && (
                <TouchableOpacity style={styles.eyeBtn} onPress={onTogglePwd}>
                    <Text>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [form, setForm] = useState({
        username: '', fullname: '', email: '', phone: '', password: '', confirm: '',
    });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    const validate = () => {
        const e = {};
        if (!form.username || form.username.length < 3) e.username = 'यूजरनेम कम से कम 3 अक्षर';
        else if (!/^[a-z0-9_]+$/i.test(form.username)) e.username = 'केवल अक्षर, अंक और _ उपयोग करें';
        if (!form.fullname || form.fullname.length < 3) e.fullname = 'पूरा नाम कम से कम 3 अक्षर';
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'वैध ईमेल दर्ज करें';
        if (!form.phone || !/^\d{10,15}$/.test(form.phone)) e.phone = '10-15 अंक का फोन नंबर';
        if (!form.password || form.password.length < 6) e.password = 'पासवर्ड कम से कम 6 अक्षर';
        if (form.password !== form.confirm) e.confirm = 'पासवर्ड मेल नहीं खाता';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await register({
                username: form.username.toLowerCase(),
                fullname: form.fullname,
                email: form.email.toLowerCase(),
                phone: form.phone,
                password: form.password,
            });
            Alert.alert('सफल', 'रजिस्ट्रेशन हो गया! कृपया लॉगिन करें।', [
                { text: 'लॉगिन करें', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'रजिस्ट्रेशन में त्रुटि');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.title}>नया खाता बनाएं</Text>
                <Text style={styles.subtitle}>विगत बही में रजिस्टर करें</Text>
            </View>
            <View style={styles.form}>
                <Field label="यूजरनेम" fKey="username" value={form.username} onChangeText={set('username')} placeholder="user_name123" error={errors.username} />
                <Field label="पूरा नाम" fKey="fullname" value={form.fullname} onChangeText={set('fullname')} placeholder="राम लाल शर्मा" error={errors.fullname} />
                <Field label="ईमेल" fKey="email" value={form.email} onChangeText={set('email')} placeholder="email@example.com" keyboardType="email-address" error={errors.email} />
                <Field label="फोन" fKey="phone" value={form.phone} onChangeText={set('phone')} placeholder="9876543210" keyboardType="phone-pad" error={errors.phone} />
                <Field label="पासवर्ड" fKey="password" value={form.password} onChangeText={set('password')} placeholder="••••••" secure secureToggle showPwd={showPwd} onTogglePwd={() => setShowPwd(!showPwd)} error={errors.password} />
                <Field label="पासवर्ड फिर दर्ज करें" fKey="confirm" value={form.confirm} onChangeText={set('confirm')} placeholder="••••••" secure showPwd={showPwd} error={errors.confirm} />

                <TouchableOpacity
                    style={[styles.btn, loading && { opacity: 0.6 }]}
                    onPress={handleRegister}
                    disabled={loading}>
                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>रजिस्टर करें</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLinkText}>पहले से खाता है? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>लॉगिन करें</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        padding: SPACING.xl,
        paddingTop: 55,
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    title: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.white },
    subtitle: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    form: {
        backgroundColor: COLORS.white,
        margin: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginTop: -24,
        elevation: 4,
    },
    field: { marginBottom: SPACING.base },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    inputRow: { flexDirection: 'row' },
    inputFlex: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.base,
        color: COLORS.text,
        backgroundColor: '#FAFAFA',
    },
    inputError: { borderColor: COLORS.error },
    errorText: { color: COLORS.error, fontSize: 11, marginTop: 2 },
    eyeBtn: {
        borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 0,
        borderTopRightRadius: BORDER_RADIUS.md, borderBottomRightRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm, backgroundColor: '#FAFAFA', justifyContent: 'center',
    },
    btn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    btnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    loginLink: { alignItems: 'center', marginTop: SPACING.base },
    loginLinkText: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
});

export default RegisterScreen;
