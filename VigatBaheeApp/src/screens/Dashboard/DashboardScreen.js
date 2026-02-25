import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    RefreshControl, StatusBar, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { baheeDetailsAPI } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES, FONTS } from '../../utils/theme';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [allBahee, setAllBahee] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await baheeDetailsAPI.getAll();
            // Website backend returns User with populated baheeDetails_ids
            const userData = res.data.data;
            const baheeList = userData?.baheeDetails_ids || userData || [];
            setAllBahee(Array.isArray(baheeList) ? baheeList : []);
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
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>

                <View style={styles.dashboardCard}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.dashboardTitle}>🙏 विगत बही Dashboard</Text>
                        <Text style={styles.dashboardSubtitle}>
                            अपनी बही का प्रबंधन करें - नई बही बनाएं, मौजूदा देखें या entries प्रबंधित करें
                        </Text>
                        {allBahee.length > 0 && (
                            <Text style={styles.totalCountText}>
                                कुल बही विवरण: <Text style={{ fontWeight: '700' }}>{allBahee.length}</Text>
                            </Text>
                        )}
                    </View>

                    {/* Quick Action Cards */}
                    <View style={styles.actionsGrid}>
                        {/* 1. Existing Bahee (Using current Dashboard scroll) */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => { }} style={{ width: '100%', marginBottom: SPACING.md }}>
                            <LinearGradient colors={COLORS.blueGradient} style={styles.actionGradientCard}>
                                <Text style={styles.actionEmoji}>📚</Text>
                                <Text style={styles.actionTitle}>मौजूदा बही देखें</Text>
                                <Text style={styles.actionDesc}>सभी सहेजी गई बहियों को देखें</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* 2. My Entries */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('MyEntries')} style={{ width: '100%', marginBottom: SPACING.md }}>
                            <LinearGradient colors={COLORS.greenGradient} style={styles.actionGradientCard}>
                                <Text style={styles.actionEmoji}>📝</Text>
                                <Text style={styles.actionTitle}>आपकी Entries</Text>
                                <Text style={styles.actionDesc}>अपनी डाली गई entries देखें</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* 3. New Bahee */}
                        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AddEntry')} style={{ width: '100%', marginBottom: SPACING.md }}>
                            <LinearGradient colors={COLORS.pinkGradient} style={styles.actionGradientCard}>
                                <Text style={styles.actionEmoji}>➕</Text>
                                <Text style={styles.actionTitle}>नई बही बनाएं</Text>
                                <Text style={styles.actionDesc}>नई विगत बही जोड़ें</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Summary Section */}
                    {allBahee.length > 0 ? (
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryTitle}>बही विवरण सारांश</Text>
                            <View style={styles.summaryGrid}>
                                {BAHEE_TYPES.map(type => (
                                    <View key={type.key} style={styles.summaryBox}>
                                        <Text style={styles.summaryCount}>{getCountForType(type.key)}</Text>
                                        <Text style={styles.summaryLabel}>{type.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>🙏 विगत बही में आपका हार्दिक स्वागत एवं अभिनंदन है।</Text>
                            <Text style={styles.emptyDesc}>
                                अभी कोई बही विवरण उपलब्ध नहीं है। नई एंट्री जोड़ने के लिए <Text style={{ color: COLORS.error, fontWeight: '700' }}>"नई बही बनाएं"</Text> पर क्लिक करें।
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingTop: 50,
        paddingBottom: SPACING.base,
        backgroundColor: COLORS.background,
    },
    greeting: { color: COLORS.textLight, fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular },
    userName: { color: COLORS.text, fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
    menuBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    },
    menuIcon: { color: COLORS.text, fontSize: 20 },
    content: { padding: SPACING.base, paddingBottom: 40 },
    dashboardCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.base,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    },
    welcomeSection: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.sm },
    dashboardTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.heading, color: '#1E40AF', marginBottom: SPACING.xs },
    dashboardSubtitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.sm, marginBottom: SPACING.md },
    totalCountText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.heading, color: '#1E40AF' },
    actionsGrid: { marginBottom: SPACING.lg },
    actionGradientCard: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'flex-start',
    },
    actionEmoji: { fontSize: 32, marginBottom: SPACING.xs },
    actionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 2 },
    actionDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: 'rgba(255,255,255,0.9)' },
    summaryContainer: { backgroundColor: '#EFF6FF', borderRadius: BORDER_RADIUS.lg, padding: SPACING.base },
    summaryTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: '#1E40AF', textAlign: 'center', marginBottom: SPACING.base },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.xs },
    summaryBox: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        width: '31%',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },
    summaryCount: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.primary },
    summaryLabel: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.heading, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },
    emptyContainer: { alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginTop: SPACING.md },
    emptyTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.heading, color: '#1D4ED8', textAlign: 'center', marginBottom: SPACING.sm },
    emptyDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});

export default DashboardScreen;
