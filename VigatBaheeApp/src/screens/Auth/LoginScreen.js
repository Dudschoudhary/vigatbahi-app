import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'ईमेल जरूरी है';
        else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'वैध ईमेल दर्ज करें';
        if (!password) newErrors.password = 'पासवर्ड जरूरी है';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (err) {
            const msg = err.response?.data?.message || 'लॉगिन में त्रुटि हुई';
            Alert.alert('त्रुटि', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>विगत बही</Text>
                <Text style={styles.headerSubtitle}>लॉगिन करें</Text>
            </View>

            <View style={styles.form}>
                {/* Email */}
                <View style={styles.field}>
                    <Text style={styles.label}>ईमेल *</Text>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={COLORS.textMuted}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password */}
                <View style={styles.field}>
                    <Text style={styles.label}>पासवर्ड *</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="पासवर्ड"
                            secureTextEntry={!showPassword}
                            placeholderTextColor={COLORS.textMuted}
                        />
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity
                    style={styles.forgotLink}
                    onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotText}>पासवर्ड भूल गए?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.disabledBtn]}
                    onPress={handleLogin}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.loginBtnText}>लॉगिन करें</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.registerRow}>
                    <Text style={styles.registerText}>खाता नहीं है? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>रजिस्टर करें</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        padding: SPACING.xl,
        paddingTop: 60,
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },
    headerTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.white },
    headerSubtitle: { fontSize: FONT_SIZES.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    form: {
        backgroundColor: COLORS.white,
        margin: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        marginTop: -SPACING.xl,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    field: { marginBottom: SPACING.base },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    input: {
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
    errorText: { color: COLORS.error, fontSize: 11, marginTop: 3 },
    passwordRow: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
    eyeBtn: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderLeftWidth: 0,
        borderTopRightRadius: BORDER_RADIUS.md,
        borderBottomRightRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
    },
    eyeIcon: { fontSize: 18 },
    forgotLink: { alignSelf: 'flex-end', marginBottom: SPACING.base },
    forgotText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
    loginBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 15,
        alignItems: 'center',
        elevation: 2,
    },
    disabledBtn: { opacity: 0.6 },
    loginBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
    registerText: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
    registerLink: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
});

export default LoginScreen;
