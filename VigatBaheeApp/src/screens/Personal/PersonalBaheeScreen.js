import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl, Modal, ScrollView, Switch,
} from 'react-native';
import { personalBaheeAPI } from '../../api/apiClient';
import HindiInput from '../../components/HindiInput';
import CustomDropdown from '../../components/CustomDropdown';
import AppFooter from '../../components/AppFooter';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES, FONTS } from '../../utils/theme';

const PersonalBaheeScreen = ({ navigation }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState('');

    // Add Form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ baheeType: 'vivah', headerName: '', name: '', caste: '', fatherName: '', villageName: '', income: '', amount: '' });
    const [saving, setSaving] = useState(false);

    // View Modal
    const [viewModal, setViewModal] = useState(false);
    const [viewingEntry, setViewingEntry] = useState(null);

    // Edit Modal
    const [editModal, setEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editForm, setEditForm] = useState({ caste: '', name: '', fatherName: '', villageName: '', income: '', amount: '', isLocked: false });
    const [editSaving, setEditSaving] = useState(false);

    const setF = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
    const setEF = (k) => (v) => setEditForm((f) => ({ ...f, [k]: v }));

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

    // Filtered entries
    const filteredEntries = filterType
        ? entries.filter(e => e.baheeType === filterType)
        : entries;

    // Search filter applied on top of type filter
    const displayEntries = search.trim()
        ? filteredEntries.filter(e => {
            const q = search.trim().toLowerCase();
            return (
                (e.name || '').toLowerCase().includes(q) ||
                (e.caste || '').toLowerCase().includes(q) ||
                (e.fatherName || '').toLowerCase().includes(q) ||
                (e.villageName || '').toLowerCase().includes(q) ||
                (e.headerName || '').toLowerCase().includes(q)
            );
        })
        : filteredEntries;

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

    const handleViewOpen = (item) => {
        setViewingEntry(item);
        setViewModal(true);
    };

    const handleEditOpen = (item) => {
        setEditingEntry(item);
        setEditForm({
            caste: item.caste || '', name: item.name || '', fatherName: item.fatherName || '',
            villageName: item.villageName || '', income: item.income?.toString() || '0',
            amount: item.amount?.toString() || '0', isLocked: item.isLocked || false,
        });
        setEditModal(true);
    };

    const handleEditSave = async () => {
        if (!editForm.name.trim()) {
            Alert.alert('त्रुटि', 'नाम अनिवार्य है');
            return;
        }
        setEditSaving(true);
        try {
            await personalBaheeAPI.update(editingEntry._id, {
                caste: editForm.caste,
                name: editForm.name,
                fatherName: editForm.fatherName,
                villageName: editForm.villageName,
                income: parseFloat(editForm.income) || 0,
                amount: parseFloat(editForm.amount) || 0,
                isLocked: editForm.isLocked,
            });
            setEditModal(false);
            fetchEntries();
            Alert.alert('सफल', 'प्रविष्टि अपडेट की गई');
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'अपडेट में त्रुटि');
        } finally {
            setEditSaving(false);
        }
    };

    const renderEntry = ({ item, index }) => {
        const typeInfo = BAHEE_TYPES.find(t => t.key === item.baheeType) || { emoji: '📝', label: item.baheeType };
        return (
            <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
                <View style={styles.rowMain}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.rowEmoji}>{typeInfo.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowName}>{item.name}</Text>
                            <Text style={styles.rowSub}>{item.headerName} • {item.caste || ''}</Text>
                            {item.fatherName ? <Text style={styles.rowSub}>पिता: {item.fatherName}</Text> : null}
                            {item.villageName ? <Text style={styles.rowSub}>📍 {item.villageName}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.rowAmounts}>
                        <View style={styles.amountBox}>
                            <Text style={styles.amountLabel}>आवता</Text>
                            <Text style={styles.amountValue}>₹{item.income || 0}</Text>
                        </View>
                        {item.amount > 0 ? (
                            <View style={styles.amountBox}>
                                <Text style={styles.amountLabel}>नेट</Text>
                                <Text style={[styles.amountValue, { color: COLORS.secondary }]}>₹{item.amount}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <View style={styles.rowActions}>
                    {item.isLocked && <Text style={{ fontSize: 14 }}>🔒</Text>}
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0284C7' }]} onPress={() => handleViewOpen(item)}>
                        <Text style={styles.actionBtnText}>👁️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={() => handleEditOpen(item)}>
                        <Text style={styles.actionBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error }]} onPress={() => handleDelete(item._id)}>
                        <Text style={styles.actionBtnText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const dropdownOptions = [
        { label: 'सभी प्रकार', value: '' },
        ...BAHEE_TYPES.map(t => ({ label: `${t.emoji} ${t.label}`, value: t.key })),
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
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
                <ScrollView style={styles.formBox} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    <Text style={styles.formTitle}>➕ नई व्यक्तिगत विगत</Text>
                    <CustomDropdown
                        label="बही प्रकार"
                        value={form.baheeType}
                        onValueChange={setF('baheeType')}
                        options={BAHEE_TYPES.map(t => ({ label: `${t.emoji} ${t.label}`, value: t.key }))}
                    />
                    <HindiInput label="विगत का नाम *" value={form.headerName} onChangeText={setF('headerName')} placeholder="किसकी शादी/समारोह" required />
                    <HindiInput label="नाम *" value={form.name} onChangeText={setF('name')} placeholder="व्यक्ति का नाम" required />
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
                </ScrollView>
            )}

            {/* Filter Dropdown */}
            <View style={styles.filterRow}>
                <CustomDropdown
                    label="प्रकार फ़िल्टर"
                    value={filterType}
                    onValueChange={setFilterType}
                    placeholder="सभी प्रकार"
                    options={dropdownOptions}
                />
            </View>

            {/* Hindi Search */}
            <View style={styles.searchBar}>
                <HindiInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="खोजें (नाम, जाति, गाँव...)"
                    style={{ marginBottom: 0 }}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Text style={styles.countText}>कुल: {displayEntries.length} प्रविष्टियाँ</Text>
                {filterType ? (
                    <TouchableOpacity onPress={() => setFilterType('')}>
                        <Text style={styles.clearFilter}>✕ फ़िल्टर हटाएं</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.4 }]}>#</Text>
                <Text style={[styles.th, { flex: 2 }]}>नाम / विवरण</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>राशि</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>क्रिया</Text>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={displayEntries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 48 }}>👤</Text>
                            <Text style={styles.emptyText}>
                                {search ? 'कोई रिकॉर्ड नहीं मिला' : 'कोई व्यक्तिगत विगत नहीं'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowForm(true)}>
                                <Text style={styles.emptyLink}>+ पहली विगत जोड़ें</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    ListFooterComponent={displayEntries.length > 0 ? <AppFooter /> : null}
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setShowForm(!showForm)}>
                <Text style={styles.fabText}>{showForm ? '✕' : '+'}</Text>
            </TouchableOpacity>

            {/* ─── VIEW MODAL ─── */}
            <Modal visible={viewModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>प्रविष्टि विवरण</Text>
                            <TouchableOpacity onPress={() => setViewModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {viewingEntry && (
                            <ScrollView>
                                {[
                                    { label: 'विगत', value: viewingEntry.headerName },
                                    { label: 'प्रकार', value: BAHEE_TYPES.find(t => t.key === viewingEntry.baheeType)?.label || viewingEntry.baheeType },
                                    { label: 'नाम', value: viewingEntry.name },
                                    { label: 'जाति', value: viewingEntry.caste },
                                    { label: 'पिता का नाम', value: viewingEntry.fatherName },
                                    { label: 'गाँव / पता', value: viewingEntry.villageName },
                                    { label: 'आवता (₹)', value: viewingEntry.income?.toString() || '0' },
                                    { label: 'ऊपर नेट (₹)', value: viewingEntry.amount?.toString() || '0' },
                                    { label: 'स्थिति', value: viewingEntry.isLocked ? '🔒 लॉक' : '🔓 खुला' },
                                ].map((row, i) => row.value ? (
                                    <View key={i} style={styles.viewRow}>
                                        <Text style={styles.viewLabel}>{row.label}</Text>
                                        <Text style={styles.viewValue}>{row.value}</Text>
                                    </View>
                                ) : null)}
                            </ScrollView>
                        )}
                        <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => setViewModal(false)}>
                            <Text style={styles.modalBtnPrimaryText}>बंद करें</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ─── EDIT MODAL ─── */}
            <Modal visible={editModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>रिकॉर्ड संपादित करें</Text>
                            <TouchableOpacity onPress={() => setEditModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                            <HindiInput label="जाति" value={editForm.caste} onChangeText={setEF('caste')} />
                            <HindiInput label="नाम *" value={editForm.name} onChangeText={setEF('name')} required />
                            <HindiInput label="पिता का नाम" value={editForm.fatherName} onChangeText={setEF('fatherName')} />
                            <HindiInput label="गाँव का नाम" value={editForm.villageName} onChangeText={setEF('villageName')} />
                            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                                <View style={{ flex: 1 }}>
                                    <HindiInput label="आवता" value={editForm.income} onChangeText={setEF('income')} keyboardType="numeric" defaultTransliterate={false} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <HindiInput label="ऊपर नेट" value={editForm.amount} onChangeText={setEF('amount')} keyboardType="numeric" defaultTransliterate={false} />
                                </View>
                            </View>
                            <View style={styles.lockBox}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.lockBoxTitle}>रिकॉर्ड लॉक</Text>
                                    <Text style={styles.lockBoxDesc}>लॉक होने पर रिकॉर्ड संपादित नहीं होगा</Text>
                                </View>
                                <Switch
                                    value={editForm.isLocked}
                                    onValueChange={setEF('isLocked')}
                                    trackColor={{ false: COLORS.border, true: COLORS.success }}
                                />
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditModal(false)}>
                                <Text style={styles.modalBtnCancelText}>रद्द करें</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleEditSave} disabled={editSaving}>
                                {editSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnPrimaryText}>सेव करें</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        padding: SPACING.base, elevation: 3, maxHeight: 380, borderWidth: 2, borderColor: COLORS.primary,
    },
    formTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.sm },
    saveBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 13, alignItems: 'center', marginTop: SPACING.sm },
    saveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    filterRow: { paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    searchBar: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.sm, paddingTop: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, backgroundColor: COLORS.white,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    countText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
    clearFilter: { fontSize: FONT_SIZES.xs, color: COLORS.error, fontWeight: '600' },
    tableHeader: {
        flexDirection: 'row', backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    },
    th: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
    row: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    rowAlt: { backgroundColor: '#F9FAFB' },
    rowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    rowLeft: { flexDirection: 'row', flex: 2, gap: SPACING.sm },
    rowEmoji: { fontSize: 22, marginTop: 2 },
    rowName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
    rowSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 1 },
    rowAmounts: { alignItems: 'flex-end' },
    amountBox: { alignItems: 'flex-end' },
    amountLabel: { fontSize: 9, color: COLORS.textMuted },
    amountValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
    rowActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
    actionBtn: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 6 },
    actionBtnText: { fontSize: 14, color: COLORS.white },
    empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.base },
    emptyText: { fontSize: FONT_SIZES.base, color: COLORS.textLight },
    emptyLink: { color: COLORS.primary, fontWeight: '700' },
    fab: {
        position: 'absolute', bottom: 20, right: 16,
        width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center', elevation: 5,
    },
    fabText: { color: COLORS.white, fontSize: 28, lineHeight: 34 },
    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.base },
    modalContent: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.base, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm, marginBottom: SPACING.sm },
    modalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
    modalClose: { fontSize: 24, color: COLORS.textLight, marginTop: -4 },
    modalBody: {},
    viewRow: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    viewLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '600' },
    viewValue: { flex: 2, fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '700' },
    lockBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm, marginBottom: SPACING.xl },
    lockBoxTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.error },
    lockBoxDesc: { fontSize: 11, color: COLORS.primary },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
    modalBtnCancel: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
    modalBtnCancelText: { color: COLORS.text, fontWeight: '600' },
    modalBtnPrimary: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    modalBtnPrimaryText: { color: COLORS.white, fontWeight: '700' },
});

export default PersonalBaheeScreen;
