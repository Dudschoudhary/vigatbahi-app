import React, { useCallback, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
} from 'react-native';
import { transliterateToHindi } from '../utils/transliteration';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

/**
 * HindiInput - A TextInput with always-on Hindi transliteration.
 * English keystrokes are automatically converted to Devanagari.
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
}) => {
    // Raw English buffer maintained alongside the Hindi value
    const rawRef = useRef('');

    const handleChange = useCallback(
        (text) => {
            const prevHindi = value || '';

            // Backspace / deletion detected
            if (text.length < prevHindi.length) {
                rawRef.current = '';
                onChangeText(text);
                return;
            }

            // Extract newly typed characters
            const addedPart = text.slice(prevHindi.length);

            // If pasted Devanagari text, pass through
            if (/[\u0900-\u097F]/.test(addedPart)) {
                rawRef.current = '';
                onChangeText(text);
                return;
            }

            // Append to raw buffer and transliterate
            rawRef.current += addedPart;
            const hindi = transliterateToHindi(rawRef.current);
            onChangeText(hindi);
        },
        [onChangeText, value]
    );

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
