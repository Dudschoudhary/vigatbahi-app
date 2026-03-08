import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on app launch
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('vb_token');
                const storedUser = await AsyncStorage.getItem('vb_user');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    console.log('🟢 Session restored from storage');
                }
            } catch (error) {
                console.error('Session restore error:', error);
                // Clear corrupted storage
                await AsyncStorage.multiRemove(['vb_token', 'vb_user']).catch(() => { });
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const data = response.data;

        console.log('🔍 Login response keys:', Object.keys(data || {}));

        // Handle different backend response shapes:
        // Shape 1: { token, user }
        // Shape 2: { data: { token, user } }
        // Shape 3: { token, data: { ...userData } }
        // Shape 4: { accessToken, user }
        const newToken = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
        const userData = data?.user || data?.data?.user || data?.data;

        if (!newToken) {
            console.error('🔴 Login response missing token. Full response:', JSON.stringify(data).substring(0, 500));
            throw new Error('लॉगिन सफल लेकिन टोकन नहीं मिला। कृपया पुनः प्रयास करें।');
        }

        // Ensure userData is an object (not a token string)
        const finalUser = (userData && typeof userData === 'object') ? userData : { email };

        await AsyncStorage.setItem('vb_token', newToken);
        await AsyncStorage.setItem('vb_user', JSON.stringify(finalUser));
        setToken(newToken);
        setUser(finalUser);

        console.log('🟢 Login successful for:', finalUser.fullname || finalUser.email || email);
        return data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        // Website backend doesn't return token on register
        // User must login separately after registering
        return response.data;
    };

    const logout = async () => {
        console.log('🔑 Logging out...');
        await AsyncStorage.multiRemove(['vb_token', 'vb_user']);
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        AsyncStorage.setItem('vb_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token,
                login,
                register,
                logout,
                updateUser,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
