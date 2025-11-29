import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.success) {
            // LOGIKA PENTING: CEK "TITIPAN" URL
            // Kalau user dilempar dari Dashboard (mau booking), kembalikan dia ke sana.
            // Kalau login biasa, masuk ke Profile atau Home.
            const destination = location.state?.from || '/profile';
            const scheduleData = location.state?.schedules;

            // Jika ada data jadwal yang dibawa, kirim balik ke booking
            if (destination === '/booking' && scheduleData) {
                navigate('/booking', { state: { schedules: scheduleData } });
            } else {
                navigate(destination);
            }
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Masuk Akun</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="nama@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input 
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Masuk <ArrowRight size={20} /></>}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                Belum punya akun? <a href="/register" className="text-blue-600 font-medium hover:underline">Daftar</a>
            </div>
        </div>
    );
}