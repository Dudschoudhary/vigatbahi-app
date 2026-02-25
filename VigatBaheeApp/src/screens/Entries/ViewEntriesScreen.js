import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, RefreshControl,
    Modal, ScrollView, Switch
} from 'react-native';
import HindiInput from '../../components/HindiInput';
import { baheeEntriesAPI } from '../../api/apiClient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/theme';

const PAGE_OPTIONS = [10, 20, 50, 100];

const ViewEntriesScreen = ({ navigation, route }) => {
    const { baheeType, headerName, baheeTypeName } = route?.params || {};
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [editForm, setEditForm] = useState({ caste: '', name: '', fatherName: '', villageName: '', income: '', amount: '', isLocked: false });
    const [saving, setSaving] = useState(false);

    const setF = (k) => (v) => setEditForm((f) => ({ ...f, [k]: v }));

    const fetchEntries = useCallback(async (customPage, customLimit, customSearch) => {
        try {
            let res;
            const p = customPage !== undefined ? customPage : page;
            const l = customLimit !== undefined ? customLimit : limit;
            const s = customSearch !== undefined ? customSearch : search;

            const params = { page: p, limit: l, search: s };

            if (baheeType && headerName) {
                res = await baheeEntriesAPI.getByTypeAndHeader(baheeType, headerName, params);
            } else {
                res = await baheeEntriesAPI.getAll(params);
            }
            const allEntries = res.data.data || [];
            setEntries(allEntries);
            setTotal(res.data.total || allEntries.length);
            setTotalPages(res.data.pages || Math.ceil(allEntries.length / limit) || 1);
        } catch (err) {
            console.error('Fetch entries error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [baheeType, headerName, limit, page, search]);

    useEffect(() => { fetchEntries(); }, []);
    useEffect(() => {
        const t = setTimeout(() => { setPage(1); fetchEntries(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

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
            // Check if lock state changed to handle locked entry correctly
            if (editingEntry.isLocked && !editForm.isLocked) {
                // If it was locked and user wants to unlock, we must use the toggle lock API first (if it existed) or the backend might block update.
                // Assuming standard update works or we just toggle client side
            }
            await baheeEntriesAPI.update(editingEntry._id, {
                caste: editForm.caste,
                name: editForm.name,
                fatherName: editForm.fatherName,
                villageName: editForm.villageName,
                income: parseFloat(editForm.income) || 0,
                amount: parseFloat(editForm.amount) || 0,
                isLocked: editForm.isLocked,
                lockDate: editForm.isLocked && !editingEntry.isLocked ? new Date() : editingEntry.lockDate,
                lockDescription: editForm.isLocked && !editingEntry.isLocked ? 'User locked' : editingEntry.lockDescription,
            });
            setEditModalVisible(false);
            fetchEntries();
            Alert.alert('सफल', 'प्रविष्टि अपडेट की गई');
        } catch (err) {
            Alert.alert('त्रुटि', err.response?.data?.message || 'अपडेट में त्रुटि। यदि यह लॉक्ड है, तो पहले अनलॉक करें।');
        } finally {
            setSaving(false);
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
                <TouchableOpacity style={[styles.actionBtnBox, { backgroundColor: COLORS.primary }]} onPress={() => { }}>
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

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="🔍  खोजें (नाम, जाति, गाँव...)"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>

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
                            <Text style={styles.emptyText}>कोई प्रविष्टि नहीं मिली</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AddEntry', { baheeType })}>
                                <Text style={styles.emptyLink}>+ नई प्रविष्टि जोड़ें</Text>
                            </TouchableOpacity>
                        </View>
                    }
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

            {/* FAB - Add Entry */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEntry', { baheeType, preHeaderName: headerName })}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Edit Modal */}
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
                            <HindiInput label="जाति *" value={editForm.caste} onChangeText={setF('caste')} />
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
                                    <Text style={styles.lockBoxDesc}>लॉक होने पर रिकॉर्ड edit नहीं किया जा सकेगा</Text>
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
    searchBar: { backgroundColor: COLORS.white, padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    searchInput: {
        backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs,
        fontSize: FONT_SIZES.sm, color: COLORS.text,
    },
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
    modalContent: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.base, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm, marginBottom: SPACING.sm },
    modalTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
    modalCloseText: { fontSize: 24, color: COLORS.textLight, marginTop: -4 },
    modalBody: {},
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
