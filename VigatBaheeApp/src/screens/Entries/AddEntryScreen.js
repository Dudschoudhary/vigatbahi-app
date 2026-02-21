import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, Platform, Switch,
} from 'react-native';
import HindiInput from '../../components/HindiInput';
import { baheeDetailsAPI, baheeEntriesAPI } from '../../api/apiClient';
import { calculateTithi } from '../../utils/tithiCalculator';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES } from '../../utils/theme';

const AddEntryScreen = ({ navigation, route }) => {
    const preselectedType = route?.params?.baheeType || '';

    // === HEADER FORM STATE ===
    const [selectedType, setSelectedType] = useState(preselectedType);
    const [headerName, setHeaderName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tithi, setTithi] = useState('');
    const [headerExists, setHeaderExists] = useState(false);
    const [existingHeaders, setExistingHeaders] = useState([]);
    const [saveHeaderLoading, setSaveHeaderLoading] = useState(false);

    // === ENTRY FORM STATE ===
    const [sno, setSno] = useState('');
    const [caste, setCaste] = useState('');
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [villageName, setVillageName] = useState('');
    const [income, setIncome] = useState('');
    const [amount, setAmount] = useState('');
    const [enableAmount, setEnableAmount] = useState(true);
    const [saveEntryLoading, setSaveEntryLoading] = useState(false);

    const disableAmount = selectedType === 'odhawani' || selectedType === 'mahera';
    const isAnya = selectedType === 'anya';

    // Fetch existing headers for selected type
    useEffect(() => {
        if (!selectedType) return;
        baheeDetailsAPI.getByType(selectedType).then((res) => {
            setExistingHeaders(res.data.data || []);
        }).catch(() => { });
    }, [selectedType]);

    // Auto-calculate tithi when date changes
    useEffect(() => {
        if (date) {
            const d = new Date(date);
            if (!isNaN(d)) {
                const result = calculateTithi(d);
                setTithi(result.formatted);
            }
        }
    }, [date]);

    const handleSaveHeader = async () => {
        if (!selectedType) { Alert.alert('त्रुटि', 'विगत का प्रकार चुनें'); return; }
        if (!headerName.trim()) { Alert.alert('त्रुटि', 'विगत का नाम दर्ज करें'); return; }
        if (!date) { Alert.alert('त्रुटि', 'तिथि चुनें'); return; }

        setSaveHeaderLoading(true);
        try {
            await baheeDetailsAPI.create({ baheeType: selectedType, name: headerName, date, tithi });
            setHeaderExists(true);
            Alert.alert('सफल', `"${headerName}" विगत सहेजी गई!`);
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'विगत सहेजने में त्रुटि');
        } finally {
            setSaveHeaderLoading(false);
        }
    };

    const handleSaveEntry = async () => {
        if (!selectedType) { Alert.alert('त्रुटि', 'विगत का प्रकार चुनें'); return; }
        if (!headerName.trim()) { Alert.alert('त्रुटि', 'पहले विगत हेडर सहेजें'); return; }
        if (!name.trim()) { Alert.alert('त्रुटि', 'नाम दर्ज करें'); return; }

        const incomeVal = parseFloat(income) || 0;
        const amountVal = disableAmount || !enableAmount ? 0 : parseFloat(amount) || 0;

        setSaveEntryLoading(true);
        try {
            await baheeEntriesAPI.create({
                baheeType: selectedType,
                headerName: headerName.trim(),
                sno, caste, name: name.trim(), fatherName, villageName,
                income: incomeVal, amount: amountVal,
            });
            Alert.alert('सफल', 'प्रविष्टि सहेजी गई!', [
                { text: 'और जोड़ें', onPress: clearEntry },
                { text: 'प्रविष्टियाँ देखें', onPress: () => navigation.navigate('ViewEntries', { baheeType: selectedType, headerName }) },
            ]);
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'प्रविष्टि सहेजने में त्रुटि');
        } finally {
            setSaveEntryLoading(false);
        }
    };

    const clearEntry = () => {
        setSno(''); setCaste(''); setName(''); setFatherName('');
        setVillageName(''); setIncome(''); setAmount('');
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            {/* ─── SECTION 1: BAHEE HEADER ─── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. विगत विवरण (Event Header)</Text>

                {/* Bahee Type Picker */}
                <Text style={styles.label}>विगत का प्रकार *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                    {BAHEE_TYPES.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            style={[styles.typeChip, selectedType === t.key && styles.typeChipActive]}
                            onPress={() => setSelectedType(t.key)}>
                            <Text style={styles.typeChipEmoji}>{t.emoji}</Text>
                            <Text style={[styles.typeChipText, selectedType === t.key && styles.typeChipTextActive]}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Existing headers quick select */}
                {existingHeaders.length > 0 && (
                    <View style={styles.existingBox}>
                        <Text style={styles.existingLabel}>मौजूदा विगत:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {existingHeaders.map((h) => (
                                <TouchableOpacity
                                    key={h._id}
                                    style={[styles.existingChip, headerName === h.name && styles.existingChipActive]}
                                    onPress={() => { setHeaderName(h.name); setDate(h.date.split('T')[0]); setTithi(h.tithi || ''); setHeaderExists(true); }}>
                                    <Text style={styles.existingChipText}>{h.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <HindiInput
                    label="विगत का नाम (जैसे: राम की शादी)"
                    value={headerName}
                    onChangeText={setHeaderName}
                    placeholder="नाम दर्ज करें"
                    required
                />

                {/* Date Picker */}
                <View style={styles.field}>
                    <Text style={styles.label}>तिथि (दिनांक) *</Text>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateValue}>{date}</Text>
                    </View>
                    <Text style={styles.dateNote}>📱 अपनी डिवाइस की कीबोर्ड से YYYY-MM-DD फॉर्मेट में दर्ज करें</Text>
                    <View style={styles.dateInputRow}>
                        <HindiInput
                            value={date}
                            onChangeText={setDate}
                            placeholder="2024-01-15"
                            defaultTransliterate={false}
                            style={{ flex: 1, marginBottom: 0 }}
                            keyboardType="numbers-and-punctuation"
                        />
                    </View>
                </View>

                {tithi ? (
                    <View style={styles.tithiBox}>
                        <Text style={styles.tithiLabel}>🌙 हिंदू तिथि:</Text>
                        <Text style={styles.tithiValue}>{tithi}</Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    style={[styles.saveBtn, saveHeaderLoading && { opacity: 0.6 }]}
                    onPress={handleSaveHeader}
                    disabled={saveHeaderLoading || headerExists}>
                    {saveHeaderLoading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveBtnText}>
                            {headerExists ? '✅ विगत सहेजी गई' : '💾 विगत सहेजें'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ─── SECTION 2: GUEST ENTRY ─── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. प्रविष्टि जोड़ें (Guest Entry)</Text>

                <HindiInput label="क्रमांक (S.No.)" value={sno} onChangeText={setSno} placeholder="1, 2, 3..." defaultTransliterate={false} keyboardType="numeric" />
                <HindiInput label="जाति (Caste)" value={caste} onChangeText={setCaste} placeholder="जाति दर्ज करें" />
                <HindiInput label="नाम (Name)" value={name} onChangeText={setName} placeholder="व्यक्ति का नाम" required />
                <HindiInput label="पिता का नाम" value={fatherName} onChangeText={setFatherName} placeholder="पिता का नाम" />
                <HindiInput label="गाँव / पता" value={villageName} onChangeText={setVillageName} placeholder="गाँव या पता" />

                <View style={styles.amountRow}>
                    <View style={{ flex: 1 }}>
                        <HindiInput
                            label="आवता (Income ₹)"
                            value={income}
                            onChangeText={setIncome}
                            placeholder="0"
                            keyboardType="numeric"
                            defaultTransliterate={false}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>ऊपर नेट (Return ₹)</Text>
                            {isAnya && (
                                <Switch
                                    value={enableAmount}
                                    onValueChange={setEnableAmount}
                                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                                    thumbColor={enableAmount ? COLORS.white : '#f4f3f4'}
                                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                />
                            )}
                        </View>
                        <HindiInput
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            defaultTransliterate={false}
                            editable={!disableAmount && (isAnya ? enableAmount : true)}
                        />
                    </View>
                </View>

                {disableAmount && (
                    <Text style={styles.noteText}>
                        ℹ️ {selectedType === 'odhawani' ? 'ओढावणी' : 'माहेरा'} में ऊपर नेट लागू नहीं होता
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.saveEntryBtn, saveEntryLoading && { opacity: 0.6 }]}
                    onPress={handleSaveEntry}
                    disabled={saveEntryLoading}>
                    {saveEntryLoading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveBtnText}>💾 प्रविष्टि सहेजें</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.viewEntriesBtn}
                    onPress={() => navigation.navigate('ViewEntries', { baheeType: selectedType, headerName })}>
                    <Text style={styles.viewEntriesBtnText}>📋 प्रविष्टियाँ देखें</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    section: {
        backgroundColor: COLORS.white, margin: SPACING.base,
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.base,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary,
        marginBottom: SPACING.base, borderBottomWidth: 2, borderBottomColor: COLORS.primaryLight, paddingBottom: SPACING.xs,
    },
    label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
    typeRow: { marginBottom: SPACING.base },
    typeChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6, marginRight: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    typeChipActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
    typeChipEmoji: { fontSize: 16 },
    typeChipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
    typeChipTextActive: { color: COLORS.primary },
    existingBox: { marginBottom: SPACING.base },
    existingLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 4 },
    existingChip: {
        backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
        borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginRight: SPACING.xs,
    },
    existingChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
    existingChipText: { fontSize: FONT_SIZES.xs, color: COLORS.text },
    field: { marginBottom: SPACING.md },
    dateRow: { backgroundColor: '#F0FDF4', borderRadius: 8, padding: SPACING.sm, marginBottom: SPACING.xs },
    dateValue: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.secondary, textAlign: 'center' },
    dateNote: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.xs },
    dateInputRow: { flexDirection: 'row' },
    tithiBox: {
        backgroundColor: '#FFF7ED', borderRadius: 10, padding: SPACING.sm,
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.base,
    },
    tithiLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E' },
    tithiValue: { fontSize: FONT_SIZES.sm, color: '#92400E', flex: 1 },
    saveBtn: {
        backgroundColor: COLORS.secondary, borderRadius: BORDER_RADIUS.md,
        paddingVertical: 14, alignItems: 'center',
    },
    saveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    amountRow: { flexDirection: 'row' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    noteText: {
        fontSize: FONT_SIZES.xs, color: COLORS.warning, backgroundColor: '#FFFBEB',
        borderRadius: 6, padding: SPACING.xs, marginBottom: SPACING.sm,
    },
    saveEntryBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 14, alignItems: 'center', marginBottom: SPACING.sm },
    viewEntriesBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 12, alignItems: 'center' },
    viewEntriesBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.base, fontWeight: '700' },
});

export default AddEntryScreen;
