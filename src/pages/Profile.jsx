import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Phone, Mail, Shield, ArrowLeft } from 'lucide-react';
import LoginForm from '../components/LoginForm'; // <--- Import Komponen Baru

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- LOGIKA UTAMA: JIKA BELUM LOGIN, TAMPILKAN FORM LOGIN ---
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24 pt-10 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Akun Saya</h1>
                    <p className="text-gray-500">Silakan masuk untuk mengelola tiket</p>
                </div>
                <LoginForm /> {/* Panggil Form Login di sini */}
            </div>
        );
    }

    // --- JIKA SUDAH LOGIN, TAMPILKAN PROFIL ---
    return (
        <div className="min-h-screen bg-gray-50 pb-24"> 
            {/* Header Sticky */}
            <div className="sticky top-0 z-20 bg-white pt-6 pb-4 px-4 -mx-0 mb-0 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="bg-gray-50 p-2 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 active:scale-95 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
                        <p className="text-xs text-gray-500">Kelola profil dan pengaturan</p>
                    </div>
                </div>
            </div>

            {/* Content User */}
            <div className="max-w-md mx-auto px-4 mt-6">
                {/* Kartu User */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{user.name}</h2>
                        <p className="text-blue-100 text-sm">{user.role.toUpperCase()}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Informasi Kontak</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Mail size={18} /></div>
                            <div><p className="text-xs text-gray-500">Email</p><p className="font-semibold text-gray-800">{user.email}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Phone size={18} /></div>
                            <div><p className="text-xs text-gray-500">No. HP</p><p className="font-semibold text-gray-800">{user.phone || '-'}</p></div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50">
                        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-600 bg-white border border-red-100 hover:bg-red-50 py-3 rounded-xl font-bold transition-all">
                            <LogOut size={18} /> Keluar Aplikasi
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-8 mb-4">FerryApp v1.0.0</p>
            </div>
        </div>
    );
}