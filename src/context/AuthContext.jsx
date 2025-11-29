import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Cek apakah user sudah login saat aplikasi dibuka pertama kali
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            if (token) {
                try {
                    // Cek ke validitas token ke server
                    const response = await api.get('/user');
                    setUser(response.data);
                } catch (error) {
                    // Jika token kadaluwarsa/salah, hapus
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, [token]);

    // Fungsi Login
    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            
            // Simpan token & user
            const { token, data } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(data);
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login gagal' 
            };
        }
    };

    // Fungsi Logout
    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook biar gampang dipanggil
export const useAuth = () => useContext(AuthContext);