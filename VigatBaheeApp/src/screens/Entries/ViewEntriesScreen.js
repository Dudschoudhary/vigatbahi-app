import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
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

    const fetchEntries = useCallback(async (pg = page, lim = limit, q = search) => {
        try {
            let res;
            if (baheeType && headerName) {
                res = await baheeEntriesAPI.getByTypeAndHeader(baheeType, headerName, { page: pg, limit: lim, search: q });
            } else if (baheeType) {
                res = await baheeEntriesAPI.getAll({ baheeType, page: pg, limit: lim, search: q });
            } else {
                res = await baheeEntriesAPI.getAll({ page: pg, limit: lim, search: q });
            }
            setEntries(res.data.data || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            console.error('Fetch entries error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [baheeType, headerName, page, limit, search]);

    useEffect(() => { fetchEntries(); }, []);
    useEffect(() => {
        const t = setTimeout(() => fetchEntries(1, limit, search), 400);
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

    const handleLock = async (entry) => {
        try {
            await baheeEntriesAPI.toggleLock(entry._id, { lockDescription: 'User locked' });
            fetchEntries();
        } catch { Alert.alert('त्रुटि', 'लॉक में त्रुटि'); }
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
                {item.isLocked ? (
                    <View style={styles.lockedTag}>
                        <Text style={styles.lockedText}>🔒 लॉक्ड</Text>
                    </View>
                ) : null}
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLock(item)}>
                    <Text style={styles.actionBtnText}>{item.isLocked ? '🔓' : '🔒'}</Text>
                </TouchableOpacity>
                {!item.isLocked && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                        <Text style={styles.actionBtnText}>🗑️</Text>
                    </TouchableOpacity>
                )}
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
    lockedTag: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
    lockedText: { fontSize: 10, color: COLORS.error },
    actionBtn: { padding: 4 },
    actionBtnText: { fontSize: 16 },
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
});

export default ViewEntriesScreen;
