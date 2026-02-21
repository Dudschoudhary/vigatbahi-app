import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 3) / 2;

const BaheeTypeCard = ({ item, count = 0, latestEvent = '', onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
            <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.subLabel}>{item.subLabel}</Text>
                <View style={styles.divider} />
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{count}</Text>
                        <Text style={styles.statLabel}>विगत</Text>
                    </View>
                </View>
                {latestEvent ? (
                    <Text style={styles.latestEvent} numberOfLines={1}>
                        📌 {latestEvent}
                    </Text>
                ) : null}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginBottom: SPACING.base,
        borderRadius: BORDER_RADIUS.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    gradient: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.base,
        minHeight: 150,
        justifyContent: 'space-between',
    },
    emoji: { fontSize: 32, marginBottom: SPACING.xs },
    label: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '800',
        color: COLORS.white,
    },
    subLabel: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: SPACING.xs,
    },
    statsRow: { flexDirection: 'row' },
    statBox: { alignItems: 'center' },
    statValue: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '900',
        color: COLORS.white,
    },
    statLabel: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)' },
    latestEvent: {
        fontSize: FONT_SIZES.xs,
        color: 'rgba(255,255,255,0.9)',
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    },
});

export default BaheeTypeCard;
