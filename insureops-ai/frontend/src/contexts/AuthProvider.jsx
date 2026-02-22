import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authLogin, authRegister, authMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('insureops_token'));
    const [loading, setLoading] = useState(true);

    // On mount, validate existing token
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        authMe()
            .then(res => setUser(res.user))
            .catch(() => {
                localStorage.removeItem('insureops_token');
                setToken(null);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const login = useCallback(async (email, password) => {
        const res = await authLogin({ email, password });
        localStorage.setItem('insureops_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res;
    }, []);

    const signup = useCallback(async (name, email, password, role) => {
        const res = await authRegister({ name, email, password, role });
        localStorage.setItem('insureops_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return res;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('insureops_token');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
