

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'hotel_admin' | 'super_admin';
    photoURL?: string;
    hotel?: any[];
    partnerRequestStatus?: 'pending' | 'approved' | 'rejected' | null;
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
            // Check for impersonation token in URL query parameter
            const params = new URLSearchParams(window.location.search);
            const impToken = params.get('impersonateToken');
            if (impToken) {
                sessionStorage.setItem('token', impToken);
                localStorage.setItem('token', impToken);
                // Clean URL to keep it pretty and avoid leakage
                params.delete('impersonateToken');
                const newSearch = params.toString();
                const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
                window.history.replaceState(null, '', newPath);
            }

            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (token) {
                // Safeguard: If we are reloading the user from a token, we are not "just logging in"
                // This prevents the login success popup from appearing on every refresh
                // unless we actually just came from the login page.
                // However, we only clear it if it's been there for a while or on second mount.
                try {
                    const res = await authApi.getMe();
                    setUser(res.data);
                } catch (err: any) {
                    console.error("Failed to load user profile:", err);
                    if (err.status === 401 || err.status === 403) {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        localStorage.removeItem('just_logged_in');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (credentials: any) => {
        const res = await authApi.login(credentials);
        sessionStorage.removeItem('token');
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const googleLogin = async (idToken: string) => {
        const res = await authApi.googleLogin(idToken);
        sessionStorage.removeItem('token');
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const register = async (userData: any) => {
        const res = await authApi.register(userData);
        sessionStorage.removeItem('token');
        localStorage.setItem('token', res.token);
        localStorage.setItem('just_logged_in', 'true');
        const userRes = await authApi.getMe();
        setUser(userRes.data);
        return userRes.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
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



