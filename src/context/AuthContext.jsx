import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import SplashScreen from '../components/SplashScreen';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // STATE BARU: Simpan Ports di sini
    const [ports, setPorts] = useState([]); 
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initApp = async () => {
            // 1. Timer Pura-pura (Agar Splash Screen tampil minimal 2 detik)
            const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Cek User (Auth)
            const fetchUser = async () => {
                if (token) {
                    try {
                        const response = await api.get('/user');
                        setUser(response.data);
                    } catch (error) {
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                }
            };

            // 3. CURI START: Ambil Data Pelabuhan di sini!
            const fetchPorts = async () => {
                try {
                    const response = await api.get('/ports');
                    setPorts(response.data.data);
                } catch (error) {
                    console.error("Gagal ambil pelabuhan:", error);
                    // Jangan matikan aplikasi kalau gagal, biarkan ports kosong dulu
                }
            };

            // JALANKAN SEMUA BERSAMAAN (PARALLEL)
            await Promise.all([minimumDelay, fetchUser(), fetchPorts()]);

            // SEMUA SELESAI -> BUKA APLIKASI
            setLoading(false);
        };

        initApp();
    }, [token]);

    // ... (Login & Logout functions tetap sama) ...
    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token, data } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login gagal' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) { console.error(error); } 
        finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    if (loading) {
        return <SplashScreen />;
    }

    // Pass 'ports' ke value provider agar bisa dipakai di Dashboard
    return (
        <AuthContext.Provider value={{ user, token, ports, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);