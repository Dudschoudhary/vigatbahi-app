import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    RefreshControl, StatusBar, ScrollView,
} from 'react-native';
import { baheeDetailsAPI } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import BaheeTypeCard from '../../components/BaheeTypeCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, FONT_SIZES, SPACING, BAHEE_TYPES } from '../../utils/theme';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [allBahee, setAllBahee] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await baheeDetailsAPI.getAll();
            setAllBahee(res.data.data || []);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const unsubscribe = navigation.addListener('focus', fetchData);
        return unsubscribe;
    }, [navigation, fetchData]);

    const getCountForType = (type) => allBahee.filter((b) => b.baheeType === type).length;
    const getLatestForType = (type) => {
        const items = allBahee.filter((b) => b.baheeType === type);
        return items.length > 0 ? items[0].name : '';
    };

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>नमस्ते, 🙏</Text>
                    <Text style={styles.userName}>{user?.fullname || 'उपयोगकर्ता'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.openDrawer()}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{allBahee.length}</Text>
                    <Text style={styles.statLabel}>कुल विगत</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{BAHEE_TYPES.length}</Text>
                    <Text style={styles.statLabel}>प्रकार</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{allBahee.filter(b => b.tithi).length}</Text>
                    <Text style={styles.statLabel}>तिथि सहित</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>विगत के प्रकार</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AddEntry')}>
                        <Text style={styles.addBtn}>+ नई जोड़ें</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardsGrid}>
                    {BAHEE_TYPES.map((type) => (
                        <BaheeTypeCard
                            key={type.key}
                            item={type}
                            count={getCountForType(type.key)}
                            latestEvent={getLatestForType(type.key)}
                            onPress={() =>
                                navigation.navigate('ViewEntries', {
                                    baheeType: type.key,
                                    baheeTypeName: type.subLabel,
                                })
                            }
                        />
                    ))}
                </View>

                {/* Recent Events */}
                {allBahee.length > 0 && (
                    <View style={styles.recentSection}>
                        <Text style={styles.sectionTitle}>हाल की विगत</Text>
                        {allBahee.slice(0, 5).map((item) => (
                            <TouchableOpacity
                                key={item._id}
                                style={styles.recentCard}
                                onPress={() =>
                                    navigation.navigate('ViewEntries', {
                                        baheeType: item.baheeType,
                                        headerName: item.name,
                                        baheeTypeName: item.baheeTypeName,
                                    })
                                }>
                                <View style={styles.recentLeft}>
                                    <Text style={styles.recentEmoji}>
                                        {BAHEE_TYPES.find(t => t.key === item.baheeType)?.emoji || '📝'}
                                    </Text>
                                    <View>
                                        <Text style={styles.recentName}>{item.name}</Text>
                                        <Text style={styles.recentMeta}>{item.tithi || item.baheeTypeName}</Text>
                                    </View>
                                </View>
                                <Text style={styles.recentArrow}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
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
    header: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingTop: 50,
        paddingBottom: SPACING.lg,
    },
    greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.sm },
    userName: { color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: '800' },
    menuBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    },
    menuIcon: { color: COLORS.white, fontSize: 22 },
    statsBar: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        marginHorizontal: SPACING.base,
        marginTop: -SPACING.sm,
        borderRadius: 14,
        padding: SPACING.base,
        elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.primary },
    statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
    statDivider: { width: 1, backgroundColor: COLORS.border },
    content: { padding: SPACING.base, paddingTop: SPACING.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.sm },
    sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
    addBtn: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
    cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    recentSection: { marginTop: SPACING.sm },
    recentCard: {
        backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.base,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: SPACING.sm, elevation: 1,
    },
    recentLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
    recentEmoji: { fontSize: 22 },
    recentName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
    recentMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
    recentArrow: { fontSize: FONT_SIZES.xl, color: COLORS.textMuted },
    fab: {
        position: 'absolute', bottom: 28, right: 20,
        width: 58, height: 58, borderRadius: 29,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4,
    },
    fabText: { color: COLORS.white, fontSize: 32, fontWeight: '300', lineHeight: 38 },
});

export default DashboardScreen;
