import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl, SectionList,
} from 'react-native';
import { baheeDetailsAPI } from '../../api/apiClient';
import AppFooter from '../../components/AppFooter';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES, FONTS } from '../../utils/theme';

const BaheeListScreen = ({ navigation }) => {
    const [baheeList, setBaheeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBaheeId, setSelectedBaheeId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await baheeDetailsAPI.getAll();
            // DEBUG: Log the raw response
            console.log('🔍 BaheeList API response status:', res.status);
            console.log('🔍 BaheeList API response.data:', JSON.stringify(res.data).substring(0, 500));
            console.log('🔍 BaheeList API response.data keys:', Object.keys(res.data || {}));

            const data = res.data.data || res.data || [];
            console.log('🔍 BaheeList parsed data:', JSON.stringify(data).substring(0, 300));
            console.log('🔍 BaheeList isArray:', Array.isArray(data), 'length:', data?.length);
            setBaheeList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('BaheeList fetch error:', err?.message, err?.response?.status, err?.response?.data);
            Alert.alert('त्रुटि', `डेटा लोड नहीं हो सका: ${err?.response?.status || 'NETWORK'} - ${err?.response?.data?.message || err?.message}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const unsub = navigation.addListener('focus', fetchData);
        return unsub;
    }, [navigation, fetchData]);

    const handleDelete = (id, name) => {
        Alert.alert('विगत हटाएं', `"${name}" को हटाना चाहते हैं?`, [
            { text: 'रद्द करें', style: 'cancel' },
            {
                text: 'हटाएं', style: 'destructive',
                onPress: async () => {
                    try {
                        await baheeDetailsAPI.delete(id);
                        fetchData();
                    } catch { Alert.alert('त्रुटि', 'हटाने में त्रुटि'); }
                },
            },
        ]);
    };

    const getTypeInfo = (key) => BAHEE_TYPES.find(t => t.key === key) || { label: key, emoji: '📖' };

    // Group bahi by category
    const getSections = () => {
        const grouped = {};
        BAHEE_TYPES.forEach(type => {
            grouped[type.key] = { type, items: [] };
        });
        baheeList.forEach(item => {
            if (grouped[item.baheeType]) {
                grouped[item.baheeType].items.push(item);
            } else {
                // Unknown type — put in anya
                if (grouped['anya']) {
                    grouped['anya'].items.push(item);
                }
            }
        });
        return Object.values(grouped)
            .filter(g => g.items.length > 0)
            .map(g => ({
                title: g.type.label,
                emoji: g.type.emoji,
                key: g.type.key,
                count: g.items.length,
                data: g.items,
            }));
    };

    const sections = getSections();

    const renderItem = ({ item }) => {
        const typeInfo = getTypeInfo(item.baheeType);
        const isSelected = selectedBaheeId === item._id;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    setSelectedBaheeId(item._id);
                    navigation.navigate('ViewEntries', {
                        baheeType: item.baheeType,
                        headerName: item.name,
                        baheeTypeName: typeInfo.label,
                    });
                }}
                style={[styles.card, isSelected && styles.cardSelected]}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.cardEmoji}>{isSelected ? '✅' : '🕉️'}</Text>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardType}>{typeInfo.label}</Text>
                        {item.date ? (
                            <Text style={styles.cardDate}>📅 {item.date?.split('T')[0]}</Text>
                        ) : null}
                        {item.tithi ? (
                            <Text style={styles.cardTithi}>🌙 {item.tithi}</Text>
                        ) : null}
                    </View>
                </View>
                <View style={styles.cardActions}>
                    {/* View — navigate to entries */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#0284C7' }]}
                        onPress={() => {
                            setSelectedBaheeId(item._id);
                            navigation.navigate('ViewEntries', {
                                baheeType: item.baheeType,
                                headerName: item.name,
                                baheeTypeName: typeInfo.label,
                            });
                        }}>
                        <Text style={styles.actionBtnText}>👁️ देखें</Text>
                    </TouchableOpacity>

                    {/* Add entry */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
                        onPress={() => navigation.navigate('AddEntry', {
                            baheeType: item.baheeType,
                            preHeaderName: item.name,
                        })}>
                        <Text style={styles.actionBtnText}>➕ जोड़ें</Text>
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
                        onPress={() => handleDelete(item._id, item.name)}>
                        <Text style={styles.actionBtnText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{section.count} बही</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.loadingText}>लोड हो रहा है...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Total Count Header */}
            <View style={styles.totalHeader}>
                <Text style={styles.totalText}>📚 कुल बही: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{baheeList.length}</Text></Text>
            </View>

            {sections.length > 0 ? (
                <SectionList
                    sections={sections}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    stickySectionHeadersEnabled={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                    ListFooterComponent={<AppFooter />}
                />
            ) : (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>कोई विगत नहीं मिली</Text>
                    <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => navigation.navigate('AddEntry')}>
                        <Text style={styles.emptyBtnText}>+ नई विगत बनाएं</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEntry')}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    list: { padding: SPACING.sm, paddingBottom: 80 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
    loadingText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
    totalHeader: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    totalText: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.heading,
        color: COLORS.text,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    sectionEmoji: { fontSize: 22 },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontFamily: FONTS.bold,
        color: '#1E40AF',
    },
    sectionBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
    },
    sectionBadgeText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
    },
    card: {
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base, marginBottom: SPACING.sm,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 3,
        borderWidth: 2, borderColor: 'transparent',
    },
    cardSelected: {
        borderColor: COLORS.secondary,
        backgroundColor: '#F0FDF4',
    },
    cardHeader: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
    cardEmoji: { fontSize: 24, marginTop: 2 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: FONT_SIZES.base, fontFamily: FONTS.bold, color: COLORS.text },
    cardType: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontFamily: FONTS.regular, marginTop: 2 },
    cardDate: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    cardTithi: { fontSize: FONT_SIZES.xs, color: '#92400E', marginTop: 2 },
    cardActions: { flexDirection: 'row', gap: SPACING.xs, justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: SPACING.sm },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.sm },
    actionBtnText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold },
    empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.base },
    emptyIcon: { fontSize: 56 },
    emptyText: { fontSize: FONT_SIZES.base, color: COLORS.textLight },
    emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
    emptyBtnText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm },
    fab: {
        position: 'absolute', bottom: 20, right: 16,
        width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center', elevation: 5,
    },
    fabText: { color: COLORS.white, fontSize: 28, lineHeight: 34 },
});

export default BaheeListScreen;
