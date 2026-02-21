import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/theme';

const LoadingSpinner = ({ message = 'लोड हो रहा है...' }) => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        gap: 12,
    },
    text: { color: COLORS.textLight, fontSize: 14 },
});

export default LoadingSpinner;
