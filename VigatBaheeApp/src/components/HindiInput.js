import React, { useState, useCallback, useRef } from 'react';
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
 *
 * The component keeps a parallel English "raw" buffer so the
 * transliteration engine always works on the complete English input.
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
    // Raw English buffer maintained alongside the Hindi value
    const rawRef = useRef('');

    const handleChange = useCallback(
        (text) => {
            if (transliterate) {
                // Detect if user deleted characters by comparing lengths.
                // If the new text is shorter than the previous value, the user
                // pressed backspace. In that case we trim the raw buffer
                // proportionally and re-transliterate.
                const prevHindi = value || '';
                if (text.length < prevHindi.length) {
                    // Backspace detected on Hindi value.
                    // We can't perfectly reverse-map Hindi→English, so just
                    // use the new text as-is (it's already in Hindi from the
                    // TextInput value). The raw buffer gets cleared for safety.
                    rawRef.current = '';
                    onChangeText(text);
                    return;
                }

                // The user typed new characters. The TextInput value was the
                // previous Hindi string, so the new characters are appended as
                // raw English. Extract them.
                const addedPart = text.slice(prevHindi.length);

                // If the added part contains Devanagari, it was pasted — pass through
                if (/[\u0900-\u097F]/.test(addedPart)) {
                    rawRef.current = '';
                    onChangeText(text);
                    return;
                }

                // Append to raw buffer and transliterate the entire raw buffer
                rawRef.current += addedPart;
                const hindi = transliterateToHindi(rawRef.current);
                onChangeText(hindi);
            } else {
                rawRef.current = text;
                onChangeText(text);
            }
        },
        [transliterate, onChangeText, value]
    );

    const toggleTransliterate = () => {
        setTransliterate((prev) => {
            if (!prev) {
                // Switching to Hindi mode — reset raw buffer
                rawRef.current = '';
            } else {
                // Switching to English mode — raw buffer = current value
                rawRef.current = value || '';
            }
            return !prev;
        });
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
