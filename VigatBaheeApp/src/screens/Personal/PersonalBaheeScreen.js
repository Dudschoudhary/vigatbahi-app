import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { personalBaheeAPI } from '../../api/apiClient';
import HindiInput from '../../components/HindiInput';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES } from '../../utils/theme';

const PersonalBaheeScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);

    // Form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ baheeType: 'vivah', headerName: '', name: '', caste: '', fatherName: '', villageName: '', income: '', amount: '' });
    const [saving, setSaving] = useState(false);

    const setF = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const fetchEntries = useCallback(async (customSearch) => {
        try {
            const s = customSearch !== undefined ? customSearch : search;
            const res = await personalBaheeAPI.getAll({ search: s });
            const allData = res.data.data || [];
            setEntries(allData);
            setTotal(res.data.total || allData.length);
        } catch { } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search]);

    useEffect(() => { fetchEntries(); }, []);
    useEffect(() => {
        const t = setTimeout(() => fetchEntries(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const handleSave = async () => {
        if (!form.headerName.trim() || !form.name.trim()) {
            Alert.alert('त्रुटि', 'विगत नाम और व्यक्ति का नाम जरूरी है');
            return;
        }
        setSaving(true);
        try {
            await personalBaheeAPI.create({
                ...form,
                baheeTypeName: BAHEE_TYPES.find(t => t.key === form.baheeType)?.subLabel || form.baheeType,
                income: parseFloat(form.income) || 0,
                amount: parseFloat(form.amount) || 0,
            });
            setShowForm(false);
            setForm({ baheeType: 'vivah', headerName: '', name: '', caste: '', fatherName: '', villageName: '', income: '', amount: '' });
            fetchEntries();
            Alert.alert('सफल', 'व्यक्तिगत विगत सहेजी गई');
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'सहेजने में त्रुटि');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert('हटाएं', 'क्या आप वाकई हटाना चाहते हैं?', [
            { text: 'रद्द', style: 'cancel' },
            {
                text: 'हटाएं', style: 'destructive',
                onPress: async () => {
                    await personalBaheeAPI.delete(id).catch(() => { });
                    fetchEntries();
                },
            },
        ]);
    };

    const renderEntry = ({ item, index }) => (
        <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
            <View style={styles.rowLeft}>
                <Text style={styles.rowEmoji}>{BAHEE_TYPES.find(t => t.key === item.baheeType)?.emoji || '📝'}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.headerName} • {item.caste || ''}</Text>
                    {item.villageName ? <Text style={styles.rowSub}>📍{item.villageName}</Text> : null}
                </View>
                <View style={styles.rowAmounts}>
                    <Text style={styles.amountText}>₹{item.income || 0}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                        <Text style={{ fontSize: 18, padding: 4 }}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>व्यक्तिगत विगत</Text>
                <TouchableOpacity onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addBtn}>{showForm ? '✕' : '+'}</Text>
                </TouchableOpacity>
            </View>

            {/* Add Form */}
            {showForm && (
                <View style={styles.formBox}>
                    <Text style={styles.formTitle}>नई व्यक्तिगत विगत</Text>
                    {/* Type Selector */}
                    <View style={styles.typeRow}>
                        {BAHEE_TYPES.map(t => (
                            <TouchableOpacity
                                key={t.key}
                                style={[styles.typeChip, form.baheeType === t.key && styles.typeChipActive]}
                                onPress={() => setF('baheeType')(t.key)}>
                                <Text style={styles.typeChipText}>{t.emoji} {t.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <HindiInput label="विगत का नाम *" value={form.headerName} onChangeText={setF('headerName')} placeholder="किसकी शादी/समारोह" />
                    <HindiInput label="नाम *" value={form.name} onChangeText={setF('name')} placeholder="व्यक्ति का नाम" />
                    <HindiInput label="जाति" value={form.caste} onChangeText={setF('caste')} placeholder="जाति" />
                    <HindiInput label="पिता का नाम" value={form.fatherName} onChangeText={setF('fatherName')} placeholder="पिता का नाम" />
                    <HindiInput label="गाँव/पता" value={form.villageName} onChangeText={setF('villageName')} placeholder="गाँव या पता" />
                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                        <View style={{ flex: 1 }}>
                            <HindiInput label="आवता ₹" value={form.income} onChangeText={setF('income')} keyboardType="numeric" defaultTransliterate={false} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <HindiInput label="नेट ₹" value={form.amount} onChangeText={setF('amount')} keyboardType="numeric" defaultTransliterate={false} />
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                        {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>💾 सहेजें</Text>}
                    </TouchableOpacity>
                </View>
            )}

            {/* Search */}
            <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="🔍 खोजें..."
                placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.countText}>कुल: {total} प्रविष्टियाँ</Text>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 48 }}>👤</Text>
                            <Text style={styles.emptyText}>कोई व्यक्तिगत विगत नहीं</Text>
                            <TouchableOpacity onPress={() => setShowForm(true)}>
                                <Text style={styles.emptyLink}>+ पहली विगत जोड़ें</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 50, paddingBottom: SPACING.base,
    },
    menuIcon: { color: COLORS.white, fontSize: 22 },
    headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },
    addBtn: { color: COLORS.white, fontSize: 28, fontWeight: '300' },
    formBox: {
        backgroundColor: COLORS.white, margin: SPACING.sm, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base, elevation: 3,
    },
    formTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.sm },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
    typeChip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingHorizontal: 8, paddingVertical: 3 },
    typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    typeChipText: { fontSize: FONT_SIZES.xs, color: COLORS.text },
    saveBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 13, alignItems: 'center' },
    saveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    searchInput: {
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, marginHorizontal: SPACING.sm,
        marginTop: SPACING.sm, paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs,
        fontSize: FONT_SIZES.sm, color: COLORS.text, elevation: 1,
    },
    countText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, margin: SPACING.sm },
    row: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    rowAlt: { backgroundColor: '#F9FAFB' },
    rowLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
    rowEmoji: { fontSize: 22 },
    rowName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
    rowSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
    rowAmounts: { alignItems: 'flex-end' },
    amountText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
    empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.base },
    emptyText: { fontSize: FONT_SIZES.base, color: COLORS.textLight },
    emptyLink: { color: COLORS.primary, fontWeight: '700' },
});

export default PersonalBaheeScreen;
