import { useAuth } from '../context/AuthContext';
import { Ship, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* Logo & Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 text-blue-600">
                            <Ship size={28} />
                            <span className="font-bold text-xl tracking-tight">FerryApp</span>
                        </Link>
                    </div>

                    {/* Menu Kanan (User Profile) */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                            <span className="text-xs text-gray-500 uppercase">{user?.role}</span>
                        </div>
                        
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={18} />
                        </div>

                        <button 
                            onClick={logout}
                            className="ml-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Keluar"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}