import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, BAHEE_TYPES, FONTS } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    return (
        <LinearGradient colors={COLORS.bgGradient} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Main Hero Card */}
                <View style={styles.heroCard}>
                    {/* Ganesh Block */}
                    <View style={styles.ganeshContainer}>
                        <Image source={require('../../assets/ganesh_colored.png')} style={styles.ganeshImage} />
                    </View>

                    {/* Titles */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.appName}>विगत बही में आपका स्वागत है।</Text>
                        <Text style={styles.appNameEn}>Welcome to Vigat Bahi - Digital Gift Registry</Text>
                        <Text style={styles.taglineHi}>
                            डिजिटल विगत बही — शादी-विवाह और सभी सामाजिक कार्यक्रमों के रिकॉर्ड को आधुनिक, सुरक्षित और सहज रूप में रखें। कभी भी, कहीं से भी जानकारी देखें।
                        </Text>
                        <Text style={styles.taglineEn}>
                            The modern digital solution for managing wedding gifts, monetary contributions (Neg-Dheg), and guest records for all your special occasions. Access your records anytime, anywhere.
                        </Text>
                    </View>
                </View>

                {/* Info Block */}
                <View style={[styles.heroCard, { backgroundColor: '#EFF6FF', marginTop: SPACING.md }]}>
                    <Text style={styles.infoTitle}>What is Vigat Bahi?</Text>
                    <Text style={styles.infoDesc}>
                        <Text style={{ fontWeight: '700' }}>Vigat Bahi</Text> (विगत बही) is a traditional Indian gift registry system that has been used for generations to record gifts and monetary contributions received during weddings and other social ceremonies.
                    </Text>
                    <Text style={styles.infoDesc}>
                        Whether you're hosting a wedding, engagement ceremony, housewarming, or any other social function, Vigat Bahi helps you keep track of all contributions in a secure, searchable, and accessible format.
                    </Text>
                </View>

                {/* Features Section */}
                <View style={styles.featuresSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionBadge}>विगत बही के बारे में – About Vigat Bahi</Text>
                    </View>
                    <Text style={styles.featurePara}>
                        विगत बही में आप अपने सभी सामाजिक कार्यक्रमों की एंट्री ऑनलाइन रख सकते हैं। अब किसी शादी या कार्यक्रम में जाने से पहले डायरी देखने की ज़रूरत नहीं।
                    </Text>

                    <View style={styles.featuresGrid}>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureTitle}>🔎 Smart Search</Text>
                            <Text style={styles.featureDesc}>नाम से तुरंत खोजें (Smart Search)।</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureTitle}>📱 Access Anywhere</Text>
                            <Text style={styles.featureDesc}>कहीं से भी, मोबाइल पर कभी भी देखें।</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureTitle}>🔐 Lock & Security</Text>
                            <Text style={styles.featureDesc}>एंट्री लॉक करें। डेटा पूरी तरह सुरक्षित।</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureTitle}>⏰ Save Time</Text>
                            <Text style={styles.featureDesc}>कागज की जगह डिजिटल रिकॉर्ड, समय बचाएं।</Text>
                        </View>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaContainer}>
                    <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
                    <Text style={styles.ctaDesc}>Create your free account and start managing your event records digitally!</Text>

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.primaryBtnText}>Create Free Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.outlineBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.outlineBtnText}>Login Instead</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.footer}>© 2024 Vigat Bahee. सर्वाधिकार सुरक्षित।</Text>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: SPACING.base },
    heroCard: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    ganeshContainer: { alignItems: 'center', marginBottom: SPACING.md },
    ganeshImage: { width: 140, height: 180, resizeMode: 'contain' },
    titleContainer: { alignItems: 'flex-start' },
    appName: { fontSize: FONT_SIZES['2xl'], fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.xs },
    appNameEn: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.primary, marginBottom: SPACING.sm },
    taglineHi: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.textLight, marginBottom: SPACING.sm, lineHeight: 24 },
    taglineEn: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textMuted, lineHeight: 22 },
    infoTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: '#1E40AF', marginBottom: SPACING.sm },
    infoDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: SPACING.sm, lineHeight: 22 },
    featuresSection: { marginTop: SPACING.xl, paddingHorizontal: SPACING.sm },
    sectionHeader: { marginBottom: SPACING.md },
    sectionBadge: { backgroundColor: '#B91C1C', color: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, alignSelf: 'flex-start' },
    featurePara: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    featureCard: { width: '48%', backgroundColor: COLORS.background, padding: SPACING.base, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.base },
    featureTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
    featureDesc: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 18 },
    ctaContainer: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center' },
    ctaTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.white, marginBottom: SPACING.xs },
    ctaDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: '#EFF6FF', textAlign: 'center', marginBottom: SPACING.lg },
    primaryBtn: { width: '100%', backgroundColor: COLORS.white, paddingVertical: 14, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginBottom: SPACING.sm },
    primaryBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
    outlineBtn: { width: '100%', backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.white, paddingVertical: 14, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
    outlineBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
    footer: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: FONT_SIZES.xs,
        marginTop: SPACING.lg,
    },
});

export default LandingScreen;
