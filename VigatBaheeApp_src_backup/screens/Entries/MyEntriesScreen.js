import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES } from '../../utils/theme';

const MyEntriesScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>मेरी विगत</Text>
                <View style={{ width: 36 }} />
            </View>

            <Text style={styles.subtitle}>विगत का प्रकार चुनें</Text>

            <FlatList
                data={BAHEE_TYPES}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate('ViewEntries', {
                                baheeType: item.key,
                                baheeTypeName: item.subLabel,
                            })
                        }
                        activeOpacity={0.85}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.emoji}>{item.emoji}</Text>
                            <View>
                                <Text style={styles.cardTitle}>{item.subLabel}</Text>
                                <Text style={styles.cardDesc}>{item.description}</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                )}
            />
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
        paddingBottom: SPACING.base,
    },
    menuIcon: { color: COLORS.white, fontSize: 22 },
    headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: '800' },
    subtitle: {
        fontSize: FONT_SIZES.sm, color: COLORS.textLight,
        padding: SPACING.base, paddingBottom: 0,
    },
    list: { padding: SPACING.base, gap: SPACING.sm },
    card: {
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.base, flex: 1 },
    emoji: { fontSize: 36 },
    cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
    cardDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
    arrow: { fontSize: FONT_SIZES.xl, color: COLORS.textMuted },
});

export default MyEntriesScreen;
