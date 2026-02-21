import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES, SPACING, BAHEE_TYPES } from '../utils/theme';

const DrawerContent = (props) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('लॉगआउट', 'क्या आप लॉगआउट करना चाहते हैं?', [
            { text: 'नहीं', style: 'cancel' },
            { text: 'हाँ', onPress: logout, style: 'destructive' },
        ]);
    };

    const navigate = (screen) => {
        props.navigation.closeDrawer();
        props.navigation.navigate('AppStack', { screen });
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullname?.charAt(0)?.toUpperCase() || 'V'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.fullname || 'उपयोगकर्ता'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>

            {/* Main Menu */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>मुख्य मेनू</Text>
                <DrawerItem icon="🏠" label="डैशबोर्ड" onPress={() => navigate('Dashboard')} />
                <DrawerItem icon="📋" label="मेरी विगत" onPress={() => navigate('MyEntries')} />
                <DrawerItem icon="➕" label="नई विगत जोड़ें" onPress={() => navigate('AddEntry')} />
                <DrawerItem icon="👤" label="व्यक्तिगत विगत" onPress={() => navigate('PersonalBahee')} />
            </View>

            {/* Bahee Types */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>विगत के प्रकार</Text>
                {BAHEE_TYPES.map((type) => (
                    <DrawerItem
                        key={type.key}
                        icon={type.emoji}
                        label={type.subLabel}
                        onPress={() => {
                            props.navigation.closeDrawer();
                            props.navigation.navigate('AppStack', {
                                screen: 'ViewEntries',
                                params: { baheeType: type.key },
                            });
                        }}
                    />
                ))}
            </View>

            {/* Account */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>खाता</Text>
                <DrawerItem icon="🔑" label="पासवर्ड बदलें" onPress={() => navigate('ChangePassword')} />
                <DrawerItem icon="ℹ️" label="हमारे बारे में" onPress={() => navigate('About')} />
                <DrawerItem icon="📖" label="उपयोग कैसे करें" onPress={() => navigate('HowToUse')} />
                <DrawerItem icon="📞" label="संपर्क करें" onPress={() => navigate('Contact')} />
                <DrawerItem icon="🔒" label="गोपनीयता नीति" onPress={() => navigate('PrivacyPolicy')} />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 लॉगआउट</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
};

const DrawerItem = ({ icon, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
        <Text style={styles.drawerIcon}>{icon}</Text>
        <Text style={styles.drawerLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: COLORS.white },
    header: {
        backgroundColor: COLORS.primary,
        padding: SPACING.xl,
        paddingTop: SPACING['2xl'],
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    avatarText: {
        fontSize: FONT_SIZES['2xl'],
        fontWeight: '900',
        color: COLORS.primary,
    },
    userName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.white,
        marginTop: SPACING.xs,
    },
    userEmail: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    section: { paddingHorizontal: SPACING.base, marginTop: SPACING.md },
    sectionTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingVertical: SPACING.xs,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: SPACING.xs,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xs,
        borderRadius: 8,
        gap: SPACING.sm,
    },
    drawerIcon: { fontSize: 20, width: 28 },
    drawerLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
    logoutBtn: {
        margin: SPACING.base,
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
        padding: SPACING.base,
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    logoutText: { color: COLORS.error, fontWeight: '700', fontSize: FONT_SIZES.base },
});

export default DrawerContent;
