import React, { useState, useCallback } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { transliterateToHindi } from '../utils/transliteration';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

/**
 * HindiInput - A TextInput with toggleable Hindi transliteration
 * When transliteration is ON: English keystrokes → Devanagari
 * When transliteration is OFF: Normal English input
 */
const HindiInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    editable = true,
    required = false,
    error,
    style,
    inputStyle,
    defaultTransliterate = true,
}) => {
    const [transliterate, setTransliterate] = useState(defaultTransliterate);
    const [rawInput, setRawInput] = useState('');

    const handleChange = useCallback(
        (text) => {
            if (transliterate) {
                // Keep track of raw input, transliterate for display
                setRawInput(text);
                const hindi = transliterateToHindi(text);
                onChangeText(hindi);
            } else {
                setRawInput(text);
                onChangeText(text);
            }
        },
        [transliterate, onChangeText]
    );

    const toggleTransliterate = () => {
        setTransliterate((prev) => !prev);
        // When switching, keep the existing value as-is
        setRawInput(value || '');
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>
                        {label}
                        {required && <Text style={styles.required}> *</Text>}
                    </Text>
                    <TouchableOpacity
                        onPress={toggleTransliterate}
                        style={[styles.toggleBtn, transliterate && styles.toggleBtnActive]}>
                        <Text style={[styles.toggleText, transliterate && styles.toggleTextActive]}>
                            {transliterate ? 'हि' : 'EN'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    !editable && styles.disabledInput,
                    error && styles.errorInput,
                    inputStyle,
                ]}
                value={value}
                onChangeText={handleChange}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                editable={editable}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: SPACING.md },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    required: { color: COLORS.error },
    toggleBtn: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.border,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    toggleText: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
    toggleTextActive: { color: COLORS.white },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.base,
        color: COLORS.text,
        backgroundColor: COLORS.white,
    },
    multilineInput: { height: 90, textAlignVertical: 'top' },
    disabledInput: { backgroundColor: '#F3F4F6', color: COLORS.textMuted },
    errorInput: { borderColor: COLORS.error },
    errorText: { color: COLORS.error, fontSize: FONT_SIZES.xs, marginTop: 3 },
});

export default HindiInput;
