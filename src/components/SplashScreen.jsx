import { Ship } from 'lucide-react';

export default function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-[9999]">
            {/* Logo Animasi */}
            <div className="bg-white p-6 rounded-full shadow-2xl animate-bounce">
                <Ship size={64} className="text-blue-600" />
            </div>
            
            {/* Teks Brand */}
            <h1 className="text-white text-3xl font-bold mt-6 tracking-widest animate-pulse">
                FERRY APP
            </h1>
            
            <p className="text-blue-200 text-sm mt-2">Siapkan perjalananmu...</p>
            
            {/* Spinner Kecil */}
            <div className="mt-8">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
        </div>
    );
}