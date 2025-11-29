import { Link, useLocation } from 'react-router-dom';
import { Ticket, User, Search } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    
    // Fungsi cek menu aktif
    const isActive = (path) => location.pathname === path;

    // --- LOGIKA BARU: CEGAH TUMPUKAN HISTORY ---
    const handleClick = (e, path) => {
        // Jika kita sudah berada di halaman tersebut
        if (location.pathname === path) {
            e.preventDefault(); // Batalkan navigasi (JANGAN PUSH HISTORY BARU)
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Opsional: Scroll ke paling atas aja
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Background Blur */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent h-24 pointer-events-none"></div>

            <div className="bg-white border-t border-gray-200 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative">
                <div className="flex justify-between items-end max-w-md mx-auto h-16 pb-2">
                    
                    {/* MENU KIRI: TIKET */}
                    <Link 
                        to="/my-bookings" 
                        onClick={(e) => handleClick(e, '/my-bookings')} // <--- PASANG CEGATAN DI SINI
                        className="flex flex-col items-center gap-1 w-16 group transition-transform active:scale-95 duration-200"
                    >
                        <div className={`transition-colors duration-300 ${isActive('/my-bookings') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            <Ticket size={24} strokeWidth={isActive('/my-bookings') ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-medium transition-colors ${isActive('/my-bookings') ? 'text-blue-600' : 'text-gray-400'}`}>
                            Tiket
                        </span>
                    </Link>

                    {/* MENU TENGAH: CARI */}
                    <div className="relative -top-6">
                        <Link 
                            to="/" 
                            onClick={(e) => handleClick(e, '/')} // <--- PASANG CEGATAN DI SINI
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white transform transition-transform hover:scale-110 active:scale-90 duration-200 border-4 border-gray-50">
                                <Search size={28} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 mt-1">
                                Cari
                            </span>
                        </Link>
                    </div>

                    {/* MENU KANAN: AKUN */}
                    <Link 
                        to="/profile" 
                        onClick={(e) => handleClick(e, '/profile')} // <--- PASANG CEGATAN DI SINI
                        className="flex flex-col items-center gap-1 w-16 group transition-transform active:scale-95 duration-200"
                    >
                        <div className={`transition-colors duration-300 ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-medium transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400'}`}>
                            Akun
                        </span>
                    </Link>

                </div>
            </div>
        </div>
    );
}