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
                }
            } catch (error) {
                console.error('Session restore error:', error);
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token: newToken, user: userData } = response.data;
        await AsyncStorage.setItem('vb_token', newToken);
        await AsyncStorage.setItem('vb_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        const { token: newToken, user: newUser } = response.data;
        await AsyncStorage.setItem('vb_token', newToken);
        await AsyncStorage.setItem('vb_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    const logout = async () => {
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
