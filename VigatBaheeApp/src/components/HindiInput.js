import React, { useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
} from 'react-native';
import { transliterateToHindi } from '../utils/transliteration';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

/**
 * HindiInput – Smart TextInput with optional transliteration.
 *
 * Modes:
 *   defaultTransliterate=true  → English keystrokes are converted to Devanagari in real-time.
 *   defaultTransliterate=false → Plain pass-through (used for numbers, dates, etc.)
 *
 * Key insight: We track a raw English buffer (`rawRef`) that maps 1:1 to the current
 * Devanagari output. On every change:
 *   - If the user DELETED (text shorter) → clear rawRef, pass Hindi string as-is.
 *   - If new chars are Devanagari (native Hindi keyboard) → clear rawRef, pass through.
 *   - Otherwise → append new Latin chars to rawRef and transliterate the whole buffer.
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
    const rawRef = useRef('');

    const handleChange = (text) => {
        // ── No transliteration mode (numbers, dates) ──────────────────
        if (!defaultTransliterate) {
            onChangeText(text);
            return;
        }

        const prev = value || '';

        // ── Deletion: user pressed backspace ──────────────────────────
        if (text.length < prev.length) {
            // Reset raw buffer completely on deletion
            rawRef.current = '';
            onChangeText(text);
            return;
        }

        // ── Get the newly added characters ────────────────────────────
        // Use the prev Hindi value as baseline to find new additions
        const newChars = text.slice(prev.length);

        // ── Native Hindi keyboard: Devanagari chars come in directly ──
        if (/[\u0900-\u097F]/.test(newChars)) {
            rawRef.current = '';   // reset – can't reverse-map Devanagari to raw
            onChangeText(text);
            return;
        }

        // ── No new characters (IME preview/composition) ───────────────
        if (newChars.length === 0) {
            onChangeText(text);
            return;
        }

        // ── English keystrokes → transliterate full raw buffer ────────
        rawRef.current += newChars;
        const hindi = transliterateToHindi(rawRef.current);
        onChangeText(hindi);
    };

    // Reset raw buffer when parent clears the value (form reset)
    if (!value && rawRef.current) {
        rawRef.current = '';
    }

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
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
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    required: { color: COLORS.error },
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
