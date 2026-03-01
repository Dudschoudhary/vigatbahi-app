import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, RefreshControl,
    Modal, ScrollView, Switch
} from 'react-native';
import HindiInput from '../../components/HindiInput';
import CustomDropdown from '../../components/CustomDropdown';
import AppFooter from '../../components/AppFooter';
import { baheeEntriesAPI, baheeDetailsAPI } from '../../api/apiClient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES, FONTS } from '../../utils/theme';

const PAGE_OPTIONS = [10, 20, 50, 100];

const ViewEntriesScreen = ({ navigation, route }) => {
    const { baheeType: initialBaheeType, headerName, baheeTypeName } = route?.params || {};
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Bahi type dropdown
    const [selectedBaheeType, setSelectedBaheeType] = useState(initialBaheeType || '');

    // Edit modal state
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editForm, setEditForm] = useState({ caste: '', name: '', fatherName: '', villageName: '', income: '', amount: '', isLocked: false });
    const [saving, setSaving] = useState(false);

    // View modal state
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewingEntry, setViewingEntry] = useState(null);

    // Inline add entry form
    const [addFormVisible, setAddFormVisible] = useState(false);
    const [addForm, setAddForm] = useState({ caste: '', name: '', fatherName: '', villageName: '', income: '', amount: '' });
    const [addSaving, setAddSaving] = useState(false);

    const setF = (k) => (v) => setEditForm((f) => ({ ...f, [k]: v }));
    const setAF = (k) => (v) => setAddForm((f) => ({ ...f, [k]: v }));

    // Set the nav header title to the bahee name
    useLayoutEffect(() => {
        if (headerName) {
            navigation.setOptions({ title: headerName });
        }
    }, [navigation, headerName]);

    const fetchEntries = useCallback(async (customPage, customLimit, customSearch) => {
        try {
            const p = customPage !== undefined ? customPage : page;
            const l = customLimit !== undefined ? customLimit : limit;
            const s = customSearch !== undefined ? customSearch : search;

            const params = { page: p, limit: l, search: s };

            let res;
            const bt = selectedBaheeType || initialBaheeType;
            if (bt && headerName) {
                res = await baheeEntriesAPI.getByTypeAndHeader(bt, headerName, params);
            } else if (bt) {
                res = await baheeEntriesAPI.getAll({ ...params, baheeType: bt });
            } else {
                res = await baheeEntriesAPI.getAll(params);
            }
            const allEntries = res.data.data || [];
            setEntries(allEntries);
            setTotal(res.data.total || allEntries.length);
            setTotalPages(res.data.pages || Math.ceil(allEntries.length / (l || 10)) || 1);
        } catch (err) {
            console.error('Fetch entries error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [initialBaheeType, selectedBaheeType, headerName, limit, page, search]);

    useEffect(() => { fetchEntries(); }, []);

    // Search debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setPage(1);
            fetchEntries(1, limit, search);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // Reload when bahi type changes
    useEffect(() => {
        setPage(1);
        setLoading(true);
        fetchEntries(1, limit, search);
    }, [selectedBaheeType]);

    const handleDelete = (id) => {
        Alert.alert('प्रविष्टि हटाएं', 'क्या आप वाकई इस प्रविष्टि को हटाना चाहते हैं?', [
            { text: 'रद्द करें', style: 'cancel' },
            {
                text: 'हटाएं', style: 'destructive',
                onPress: async () => {
                    try {
                        await baheeEntriesAPI.delete(id);
                        fetchEntries();
                    } catch { Alert.alert('त्रुटि', 'हटाने में त्रुटि'); }
                },
            },
        ]);
    };

    const handleEditOpen = (item) => {
        setEditingEntry(item);
        setEditForm({
            caste: item.caste || '', name: item.name || '', fatherName: item.fatherName || '',
            villageName: item.villageName || '', income: item.income?.toString() || '0',
            amount: item.amount?.toString() || '0', isLocked: item.isLocked || false
        });
        setEditModalVisible(true);
    };

    const handleEditSave = async () => {
        if (!editForm.name.trim()) {
            Alert.alert('त्रुटि', 'नाम अनिवार्य है');
            return;
        }
        setSaving(true);
        try {
            await baheeEntriesAPI.update(editingEntry._id, {
                caste: editForm.caste,
                name: editForm.name,
                fatherName: editForm.fatherName,
                villageName: editForm.villageName,
                income: parseFloat(editForm.income) || 0,
                amount: parseFloat(editForm.amount) || 0,
                isLocked: editForm.isLocked,
                lockDate: editForm.isLocked && !editingEntry.isLocked ? new Date() : editingEntry.lockDate,
                lockDescription: editForm.isLocked && !editingEntry.isLocked ? 'उपयोगकर्ता ने लॉक किया' : editingEntry.lockDescription,
            });
            setEditModalVisible(false);
            fetchEntries();
            Alert.alert('सफल', 'प्रविष्टि अपडेट की गई');
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'अपडेट में त्रुटि। यदि यह लॉक है, तो पहले अनलॉक करें।');
        } finally {
            setSaving(false);
        }
    };

    // Inline add entry
    const handleAddEntry = async () => {
        if (!addForm.name.trim()) {
            Alert.alert('त्रुटि', 'नाम अनिवार्य है');
            return;
        }
        const bt = selectedBaheeType || initialBaheeType;
        if (!bt || !headerName) {
            Alert.alert('त्रुटि', 'बही का प्रकार और नाम आवश्यक है');
            return;
        }
        setAddSaving(true);
        try {
            const typeInfo = BAHEE_TYPES.find(t => t.key === bt);
            await baheeEntriesAPI.create({
                baheeType: bt,
                baheeTypeName: typeInfo?.subLabel || bt,
                headerName: headerName.trim(),
                caste: addForm.caste,
                name: addForm.name.trim(),
                fatherName: addForm.fatherName,
                villageName: addForm.villageName,
                income: parseFloat(addForm.income) || 0,
                amount: parseFloat(addForm.amount) || 0,
            });
            setAddForm({ caste: '', name: '', fatherName: '', villageName: '', income: '', amount: '' });
            setAddFormVisible(false);
            fetchEntries();
            Alert.alert('सफल', 'प्रविष्टि सहेजी गई!');
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'प्रविष्टि सहेजने में त्रुटि');
        } finally {
            setAddSaving(false);
        }
    };

    const renderEntry = ({ item, index }) => (
        <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
            <View style={styles.rowMain}>
                <View style={styles.rowLeft}>
                    <Text style={styles.sno}>{item.sno || index + 1}</Text>
                    <View style={styles.rowInfo}>
                        <Text style={styles.entryName}>{item.name}</Text>
                        {item.caste ? <Text style={styles.entrySub}>{item.caste}</Text> : null}
                        {item.fatherName ? <Text style={styles.entrySub}>पिता: {item.fatherName}</Text> : null}
                        {item.villageName ? <Text style={styles.entrySub}>📍 {item.villageName}</Text> : null}
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
                {item.isLocked && (
                    <Text style={{ fontSize: 14, marginRight: 4 }}>🔒</Text>
                )}
                <TouchableOpacity
                    style={[styles.actionBtnBox, { backgroundColor: '#0284C7' }]}
                    onPress={() => { setViewingEntry(item); setViewModalVisible(true); }}>
                    <Text style={styles.actionBtnEmoji}>👁️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtnBox, { backgroundColor: COLORS.primary }]} onPress={() => handleEditOpen(item)}>
                    <Text style={styles.actionBtnEmoji}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtnBox, { backgroundColor: COLORS.error }]} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.actionBtnEmoji}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderListFooter = () => <AppFooter />;

    return (
        <View style={styles.container}>
            {/* Hindi Search Bar */}
            <View style={styles.searchBar}>
                <HindiInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="खोजें (नाम, जाति, गाँव...)"
                    style={{ marginBottom: 0 }}
                />
            </View>

            {/* Bahi Type Dropdown */}
            {!headerName && (
                <View style={styles.pickerContainer}>
                    <CustomDropdown
                        label="बही प्रकार"
                        value={selectedBaheeType}
                        onValueChange={(val) => setSelectedBaheeType(val)}
                        placeholder="सभी बही"
                        options={[
                            { label: 'सभी बही', value: '' },
                            ...BAHEE_TYPES.map(t => ({ label: `${t.emoji} ${t.label}`, value: t.key })),
                        ]}
                    />
                </View>
            )}

            {/* Bahee name info strip */}
            {headerName ? (
                <View style={styles.baheeStrip}>
                    <Text style={styles.baheeStripType}>{baheeTypeName || selectedBaheeType || initialBaheeType}</Text>
                    <Text style={styles.baheeStripName}>📖 {headerName}</Text>
                </View>
            ) : null}

            {/* Stats + Page size */}
            <View style={styles.filterRow}>
                <Text style={styles.totalText}>कुल: {total} प्रविष्टियाँ</Text>
                <View style={styles.limitPicker}>
                    {PAGE_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.limitBtn, limit === opt && styles.limitBtnActive]}
                            onPress={() => { setLimit(opt); fetchEntries(1, opt, search); }}>
                            <Text style={[styles.limitBtnText, limit === opt && styles.limitBtnTextActive]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Inline Add Entry Form */}
            {addFormVisible && headerName && (
                <View style={styles.addFormContainer}>
                    <View style={styles.addFormHeader}>
                        <Text style={styles.addFormTitle}>➕ नई प्रविष्टि जोड़ें</Text>
                        <TouchableOpacity onPress={() => setAddFormVisible(false)}>
                            <Text style={styles.addFormClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
                        <HindiInput label="जाति" value={addForm.caste} onChangeText={setAF('caste')} placeholder="जाति दर्ज करें" />
                        <HindiInput label="नाम *" value={addForm.name} onChangeText={setAF('name')} placeholder="व्यक्ति का नाम" required />
                        <HindiInput label="पिता का नाम" value={addForm.fatherName} onChangeText={setAF('fatherName')} placeholder="पिता का नाम" />
                        <HindiInput label="गाँव / पता" value={addForm.villageName} onChangeText={setAF('villageName')} placeholder="गाँव या पता" />
                        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                            <View style={{ flex: 1 }}>
                                <HindiInput label="आवता ₹" value={addForm.income} onChangeText={setAF('income')} placeholder="0" keyboardType="numeric" defaultTransliterate={false} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <HindiInput label="ऊपर नेट ₹" value={addForm.amount} onChangeText={setAF('amount')} placeholder="0" keyboardType="numeric" defaultTransliterate={false} />
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.addFormSaveBtn, addSaving && { opacity: 0.6 }]} onPress={handleAddEntry} disabled={addSaving}>
                            {addSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.addFormSaveBtnText}>💾 प्रविष्टि सहेजें</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
                <Text style={[styles.th, { flex: 2 }]}>नाम / जाति</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>आवता</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>क्रिया</Text>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} size="large" />
            ) : (
                <FlatList
                    data={entries}
                    renderItem={renderEntry}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyText}>
                                {search ? 'कोई रिकॉर्ड नहीं मिला' : 'कोई प्रविष्टि नहीं मिली'}
                            </Text>
                            {headerName && (
                                <TouchableOpacity onPress={() => setAddFormVisible(true)}>
                                    <Text style={styles.emptyLink}>+ नई प्रविष्टि जोड़ें</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    ListFooterComponent={entries.length > 0 ? renderListFooter : null}
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                        disabled={page === 1}
                        onPress={() => { setPage(page - 1); fetchEntries(page - 1); }}>
                        <Text style={styles.pageBtnText}>‹ पिछला</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                    <TouchableOpacity
                        style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                        disabled={page === totalPages}
                        onPress={() => { setPage(page + 1); fetchEntries(page + 1); }}>
                        <Text style={styles.pageBtnText}>अगला ›</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* FAB - Add Entry (opens inline form) */}
            {headerName && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setAddFormVisible(!addFormVisible)}>
                    <Text style={styles.fabText}>{addFormVisible ? '✕' : '+'}</Text>
                </TouchableOpacity>
            )}

            {/* ─── VIEW MODAL ─── */}
            <Modal visible={viewModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>प्रविष्टि विवरण</Text>
                            <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {viewingEntry && (
                            <ScrollView>
                                {[
                                    { label: 'नाम', value: viewingEntry.name },
                                    { label: 'जाति', value: viewingEntry.caste },
                                    { label: 'पिता का नाम', value: viewingEntry.fatherName },
                                    { label: 'गाँव / पता', value: viewingEntry.villageName },
                                    { label: 'आवता (₹)', value: viewingEntry.income?.toString() || '0' },
                                    { label: 'ऊपर नेट (₹)', value: viewingEntry.amount?.toString() || '0' },
                                    { label: 'स्थिति', value: viewingEntry.isLocked ? '🔒 लॉक किया गया' : '🔓 खुला' },
                                ].map((row, i) => row.value ? (
                                    <View key={i} style={styles.viewRow}>
                                        <Text style={styles.viewLabel}>{row.label}</Text>
                                        <Text style={styles.viewValue}>{row.value}</Text>
                                    </View>
                                ) : null)}
                            </ScrollView>
                        )}
                        <TouchableOpacity style={styles.modalBtnSave} onPress={() => setViewModalVisible(false)}>
                            <Text style={styles.modalBtnSaveText}>बंद करें</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ─── EDIT MODAL ─── */}
            <Modal visible={editModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>रिकॉर्ड संपादित करें</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <HindiInput label="जाति" value={editForm.caste} onChangeText={setF('caste')} />
                            <HindiInput label="नाम *" value={editForm.name} onChangeText={setF('name')} required />
                            <HindiInput label="पिता का नाम" value={editForm.fatherName} onChangeText={setF('fatherName')} />
                            <HindiInput label="गाँव का नाम" value={editForm.villageName} onChangeText={setF('villageName')} />
                            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                                <View style={{ flex: 1 }}>
                                    <HindiInput label="आवता" value={editForm.income} onChangeText={setF('income')} keyboardType="numeric" defaultTransliterate={false} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <HindiInput label="ऊपर नेट" value={editForm.amount} onChangeText={setF('amount')} keyboardType="numeric" defaultTransliterate={false} />
                                </View>
                            </View>

                            <View style={styles.lockBox}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.lockBoxTitle}>रिकॉर्ड लॉक</Text>
                                    <Text style={styles.lockBoxDesc}>लॉक होने पर रिकॉर्ड संपादित नहीं होगा</Text>
                                </View>
                                <Switch
                                    value={editForm.isLocked}
                                    onValueChange={setF('isLocked')}
                                    trackColor={{ false: COLORS.border, true: COLORS.success }}
                                />
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditModalVisible(false)}>
                                <Text style={styles.modalBtnCancelText}>रद्द करें</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={handleEditSave} disabled={saving}>
                                {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnSaveText}>सेव करें</Text>}
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
    searchBar: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    pickerContainer: {
        paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm, backgroundColor: COLORS.white,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    baheeStrip: {
        backgroundColor: '#EFF6FF', paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs,
        borderBottomWidth: 1, borderBottomColor: '#BFDBFE', flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    },
    baheeStripType: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontFamily: FONTS.bold, backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
    baheeStripName: { fontSize: FONT_SIZES.sm, color: '#1E40AF', fontFamily: FONTS.bold, flex: 1 },
    filterRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    totalText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
    limitPicker: { flexDirection: 'row', gap: 3 },
    limitBtn: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    limitBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    limitBtnText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },
    limitBtnTextActive: { color: COLORS.white },
    // Add Form
    addFormContainer: {
        backgroundColor: COLORS.white, margin: SPACING.sm, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base, elevation: 4, borderWidth: 2, borderColor: COLORS.primary,
    },
    addFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm },
    addFormTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary },
    addFormClose: { fontSize: 22, color: COLORS.textLight },
    addFormSaveBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 12, alignItems: 'center', marginTop: SPACING.sm },
    addFormSaveBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
    // Table
    tableHeader: {
        flexDirection: 'row', backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
    },
    th: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
    row: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    rowAlt: { backgroundColor: '#F9FAFB' },
    rowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    rowLeft: { flexDirection: 'row', flex: 2, gap: SPACING.sm },
    sno: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, width: 22, marginTop: 2 },
    rowInfo: { flex: 1 },
    entryName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
    entrySub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 1 },
    rowAmounts: { alignItems: 'flex-end' },
    amountBox: { alignItems: 'flex-end' },
    amountLabel: { fontSize: 9, color: COLORS.textMuted },
    amountValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
    rowActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
    actionBtnBox: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
    actionBtnEmoji: { fontSize: 14, color: COLORS.white },
    empty: { alignItems: 'center', paddingTop: 60, gap: SPACING.base },
    emptyIcon: { fontSize: 48 },
    emptyText: { fontSize: FONT_SIZES.base, color: COLORS.textLight },
    emptyLink: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
    pagination: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: SPACING.sm, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    pageBtn: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs, backgroundColor: COLORS.primary, borderRadius: 8 },
    pageBtnDisabled: { backgroundColor: COLORS.border },
    pageBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
    pageInfo: { fontSize: FONT_SIZES.sm, color: COLORS.text },
    fab: {
        position: 'absolute', bottom: 70, right: 16,
        width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center', elevation: 5,
    },
    fabText: { color: COLORS.white, fontSize: 28, lineHeight: 34 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.base },
    modalContent: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.base, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm, marginBottom: SPACING.sm },
    modalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
    modalCloseText: { fontSize: 24, color: COLORS.textLight, marginTop: -4 },
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
    modalBtnSave: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    modalBtnSaveText: { color: COLORS.white, fontWeight: '700' },
});

export default ViewEntriesScreen;
