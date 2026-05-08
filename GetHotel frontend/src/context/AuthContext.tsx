"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'hotel_admin' | 'super_admin';
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<User>;
    googleLogin: (idToken: string) => Promise<User>;
    register: (userData: any) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authApi.getMe();
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (credentials: any) => {
        const res = await authApi.login(credentials);
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const googleLogin = async (idToken: string) => {
        const res = await authApi.googleLogin(idToken);
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const register = async (userData: any) => {
        const res = await authApi.register(userData);
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
