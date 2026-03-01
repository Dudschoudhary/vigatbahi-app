import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, FONTS } from '../utils/theme';

// Auth Screens
import LandingScreen from '../screens/Auth/LandingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';

// App Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AddEntryScreen from '../screens/Entries/AddEntryScreen';
import ViewEntriesScreen from '../screens/Entries/ViewEntriesScreen';
import BaheeListScreen from '../screens/Entries/BaheeListScreen';
import MyEntriesScreen from '../screens/Entries/MyEntriesScreen';
import PersonalBaheeScreen from '../screens/Personal/PersonalBaheeScreen';
import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen';

// Static Screens
import AboutScreen from '../screens/Static/AboutScreen';
import PrivacyPolicyScreen from '../screens/Static/PrivacyPolicyScreen';
import HowToUseScreen from '../screens/Static/HowToUseScreen';
import ContactScreen from '../screens/Static/ContactScreen';

// Drawer Content
import DrawerContent from './DrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Auth navigator (unauthenticated flow)
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
);

// App navigator (authenticated flow) — Drawer + Stack hybrid
const AppStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: COLORS.white, elevation: 4, shadowOpacity: 0.1 },
            headerTintColor: COLORS.text,
            headerTitleStyle: { color: COLORS.error, fontFamily: FONTS.heading, fontSize: 22 },
            headerTitleAlign: 'center',
        }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BaheeList" component={BaheeListScreen} options={{ title: 'मौजूदा बही' }} />
        <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'नई विगत जोड़ें' }} />
        <Stack.Screen name="ViewEntries" component={ViewEntriesScreen} options={{ title: 'विगत देखें' }} />
        <Stack.Screen name="MyEntries" component={MyEntriesScreen} options={{ title: 'मेरी विगत' }} />
        <Stack.Screen name="PersonalBahee" component={PersonalBaheeScreen} options={{ title: 'व्यक्तिगत विगत' }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'पासवर्ड बदलें' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'हमारे बारे में' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'गोपनीयता नीति' }} />
        <Stack.Screen name="HowToUse" component={HowToUseScreen} options={{ title: 'उपयोग कैसे करें' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'संपर्क करें' }} />
    </Stack.Navigator>
);

const AppDrawer = () => (
    <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{ headerShown: false }}>
        <Drawer.Screen name="AppStack" component={AppStack} />
    </Drawer.Navigator>
);

const RootNavigator = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppDrawer /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default RootNavigator;
