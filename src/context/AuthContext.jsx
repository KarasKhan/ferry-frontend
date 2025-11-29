import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import SplashScreen from '../components/SplashScreen'; // Pastikan import ini ada

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Cek apakah user sudah login saat aplikasi dibuka pertama kali
    useEffect(() => {
        const initAuth = async () => {
            // 1. Buat Timer "Pura-pura" (Misal 2000ms = 2 detik)
            // Ubah angka 2000 ini sesuai selera (1500 - 2500 itu ideal)
            const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Proses Cek User (Asli)
            const checkUser = async () => {
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

            // 3. Tunggu KEDUANYA selesai
            // (Mana yang paling lama, itu yang ditunggu)
            await Promise.all([minimumDelay, checkUser()]);

            // 4. Baru matikan loading
            setLoading(false);
        };

        initAuth();
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

    // --- BAGIAN BARU (PENCEGAT) ---
    // Jika masih loading, TAMPILKAN SPLASH SCREEN DULU
    // Jangan render Provider/Halaman Utama sampai loading false.
    if (loading) {
        return <SplashScreen />;
    }
    // -----------------------------

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook biar gampang dipanggil
export const useAuth = () => useContext(AuthContext);