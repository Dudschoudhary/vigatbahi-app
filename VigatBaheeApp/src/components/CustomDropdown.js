import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

/**
 * CustomDropdown — A simple dropdown picker replacement 
 * that doesn't require @react-native-picker/picker package.
 */
const CustomDropdown = ({ label, value, options, onValueChange, placeholder = 'चुनें...' }) => {
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(o => o.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={styles.dropdownBtn}
                activeOpacity={0.7}
                onPress={() => setVisible(true)}
            >
                <Text style={[styles.dropdownText, !selectedOption && styles.placeholderText]} numberOfLines={1}>
                    {displayText}
                </Text>
                <Text style={styles.arrow}>▼</Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label || 'विकल्प चुनें'}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.option, value === item.value && styles.optionSelected]}
                                    onPress={() => {
                                        onValueChange(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[styles.optionText, value === item.value && styles.optionTextSelected]}>
                                        {item.label}
                                    </Text>
                                    {value === item.value && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: SPACING.sm },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    dropdownBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    dropdownText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1 },
    placeholderText: { color: COLORS.textMuted },
    arrow: { fontSize: 10, color: COLORS.textMuted, marginLeft: SPACING.xs },
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
        maxHeight: '60%', overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    modalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
    closeBtn: { fontSize: 20, color: COLORS.textLight },
    option: {
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    optionSelected: { backgroundColor: '#EFF6FF' },
    optionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
    optionTextSelected: { color: COLORS.primary, fontWeight: '700' },
    checkmark: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '700' },
});

export default CustomDropdown;
