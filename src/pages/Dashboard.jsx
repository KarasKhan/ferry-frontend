import { useState, useEffect, useRef } from 'react'; // <--- Tambah useRef
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // (Ini boleh dihapus jika sudah pakai layout, tapi dibiarkan aman)
import api from '../services/api';
import { MapPin, Calendar, Search, Ship, ArrowRight, ArrowLeftRight } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // REF untuk Auto Scroll
    const resultsRef = useRef(null); 

    const [ports, setPorts] = useState([]);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    
    const [schedules, setSchedules] = useState({ departures: [], returns: [] });
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedDeparture, setSelectedDeparture] = useState(null);
    const [selectedReturn, setSelectedReturn] = useState(null);

    // State baru untuk loading pelabuhan
    const [loadingPorts, setLoadingPorts] = useState(true); 

    useEffect(() => {
            setLoadingPorts(true); // Mulai loading
            api.get('/ports')
                .then(res => {
                    setPorts(res.data.data);
                })
                .catch(err => console.error(err))
                .finally(() => {
                    // Beri sedikit jeda biar transisinya enak dilihat (opsional)
                    setTimeout(() => setLoadingPorts(false), 500);
                });
        }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setSelectedDeparture(null);
        setSelectedReturn(null);

        try {
            const params = {
                origin_port_id: origin,
                destination_port_id: destination,
                date: date
            };
            if (isRoundTrip && returnDate) params.return_date = returnDate;

            const response = await api.get('/schedules', { params });
            setSchedules(response.data.data);

            // --- AUTO SCROLL LOGIC ---
            // Tunggu sebentar (100ms) agar elemen dirender dulu, baru scroll
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const proceedToBooking = () => {
        if (!selectedDeparture) return alert("Pilih jadwal keberangkatan dulu!");
        if (isRoundTrip && !selectedReturn) return alert("Pilih jadwal kepulangan dulu!");

        const selectedSchedules = [selectedDeparture];
        if (isRoundTrip && selectedReturn) selectedSchedules.push(selectedReturn);

        if (!user) {
            navigate('/profile', { state: { from: '/booking', schedules: selectedSchedules } });
        } else {
            navigate('/booking', { state: { schedules: selectedSchedules } });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            
            {/* HERO SECTION */}
            <div className="bg-blue-600 px-4 pt-10 pb-32 rounded-b-[2.5rem] shadow-lg">
                <div className="max-w-5xl mx-auto text-center text-white mb-8">
                    <h1 className="text-3xl font-bold mb-2">Jelajahi Lautan Indonesia</h1>
                    <p className="opacity-90">Pesan tiket kapal feri dengan mudah, cepat, dan aman.</p>
                </div>

                <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
                    <form onSubmit={handleSearch} className="space-y-6">
                        
                        <div className="flex justify-center">
                            <label className="inline-flex items-center cursor-pointer bg-gray-100 p-1 rounded-full shadow-inner">
                                {/* Tombol dengan efek klik (active:scale-95) */}
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all transform active:scale-95 duration-100 ${!isRoundTrip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setIsRoundTrip(false)}>
                                    Sekali Jalan
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all transform active:scale-95 duration-100 ${isRoundTrip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setIsRoundTrip(true)}>
                                    Pulang Pergi
                                </span>
                            </label>
                        </div>

                        {/* Area Input Utama (Asal & Tujuan) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 relative">
                            
                            {/* Input Asal */}
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Dari Pelabuhan</label>
                                <div className="relative flex items-center">
                                    <div className={`absolute left-4 ${loadingPorts ? 'text-gray-400 animate-spin' : 'text-blue-500'}`}>
                                        {/* Ganti icon jadi Loader kalau loading, Ship kalau ready */}
                                        {loadingPorts ? <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div> : <Ship size={24} />}
                                    </div>
                                    <select 
                                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl outline-none font-semibold transition-all appearance-none 
                                            ${loadingPorts 
                                                ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-gray-50 border-transparent hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-500 text-gray-700 cursor-pointer'
                                            }`}
                                        value={origin} 
                                        onChange={(e) => setOrigin(e.target.value)} 
                                        required
                                        disabled={loadingPorts} // <--- KUNCI: Matikan input saat loading
                                    >
                                        <option value="">{loadingPorts ? "Memuat Data..." : "Pilih Asal"}</option>
                                        {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                    </select>
                                    {!loadingPorts && (
                                        <div className="absolute right-4 pointer-events-none text-gray-400">
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Icon Panah Tengah (Hiasan Desktop) */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border border-gray-100 p-2 rounded-full shadow-md text-gray-400">
                                <ArrowRight size={20} />
                            </div>

                            {/* Input Tujuan */}
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Ke Pelabuhan</label>
                                <div className="relative flex items-center">
                                    <div className={`absolute left-4 ${loadingPorts ? 'text-gray-400 animate-spin' : 'text-orange-500'}`}>
                                        {loadingPorts ? <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full"></div> : <MapPin size={24} />}
                                    </div>
                                    <select 
                                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl outline-none font-semibold transition-all appearance-none 
                                            ${loadingPorts 
                                                ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-gray-50 border-transparent hover:bg-white hover:border-orange-100 focus:bg-white focus:border-orange-500 text-gray-700 cursor-pointer'
                                            }`}
                                        value={destination} 
                                        onChange={(e) => setDestination(e.target.value)} 
                                        required
                                        disabled={loadingPorts}
                                    >
                                        <option value="">{loadingPorts ? "Memuat Data..." : "Pilih Tujuan"}</option>
                                        {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                    </select>
                                    {!loadingPorts && (
                                        <div className="absolute right-4 pointer-events-none text-gray-400">
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Area Tanggal (Dynamic Layout) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
                            
                            {/* Input Tanggal Pergi */}
                            {/* Logic: Kalau RoundTrip mati, dia ambil 2 kolom (full). Kalau aktif, dia ambil 1 kolom. */}
                            <div className={`transition-all duration-300 ease-in-out ${isRoundTrip ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Tanggal Pergi</label>
                                <div className="relative flex items-center group">
                                    <div className="absolute left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <input 
                                        type="date" 
                                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-blue-500 rounded-xl outline-none font-bold text-gray-700 transition-all shadow-sm"
                                        value={date} 
                                        onChange={(e) => setDate(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            {/* Input Tanggal Pulang */}
                            {/* Logic: Hanya dirender kalau isRoundTrip = TRUE */}
                            {isRoundTrip && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Tanggal Pulang</label>
                                    <div className="relative flex items-center group">
                                        <div className="absolute left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <input 
                                            type="date" 
                                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-orange-500 rounded-xl outline-none font-bold text-gray-700 transition-all shadow-sm"
                                            value={returnDate} 
                                            onChange={(e) => setReturnDate(e.target.value)} 
                                            required={isRoundTrip} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TOMBOL CARI DENGAN EFEK KENYAL (active:scale-95) */}
                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transform transition-transform active:scale-95 duration-100 flex items-center justify-center gap-2">
                            <Search size={22} strokeWidth={3} />
                            Cari Jadwal Kapal
                        </button>

                    </form>
                </div>
            </div>

            {/* HASIL PENCARIAN (Pasang REF di sini) */}
            <div ref={resultsRef} className="max-w-6xl mx-auto px-4 -mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
                
                {/* LIST PERGI */}
                {(hasSearched || loading) && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                            <ArrowRight className="text-blue-600" /> Jadwal Keberangkatan
                        </h3>
                        
                        {loading ? <p className="text-center">Loading...</p> : 
                         schedules.departures.length === 0 ? <p className="text-center text-gray-500 py-10 bg-white rounded-lg">Tidak ada jadwal.</p> :
                         schedules.departures.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedDeparture(item)}
                                // Efek Kenyal saat pilih jadwal
                                className={`bg-white p-4 rounded-xl shadow-md border-2 cursor-pointer transition-all transform active:scale-95 duration-100 ${selectedDeparture?.id === item.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Ship size={20} /></div>
                                        <div>
                                            <h4 className="font-bold">{item.ship.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(item.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">Sisa {item.quota_passenger_left}</p>
                                        {selectedDeparture?.id === item.id && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Dipilih</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LIST PULANG */}
                {isRoundTrip && (hasSearched || loading) && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                            <ArrowLeftRight className="text-orange-600" /> Jadwal Kepulangan
                        </h3>

                        {loading ? <p className="text-center">Loading...</p> : 
                         schedules.returns.length === 0 ? <p className="text-center text-gray-500 py-10 bg-white rounded-lg">Tidak ada jadwal pulang.</p> :
                         schedules.returns.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedReturn(item)}
                                className={`bg-white p-4 rounded-xl shadow-md border-2 cursor-pointer transition-all transform active:scale-95 duration-100 ${selectedReturn?.id === item.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600"><Ship size={20} /></div>
                                        <div>
                                            <h4 className="font-bold">{item.ship.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(item.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">Sisa {item.quota_passenger_left}</p>
                                        {selectedReturn?.id === item.id && <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">Dipilih</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedDeparture && (!isRoundTrip || (isRoundTrip && selectedReturn)) && (
                <div className="fixed bottom-24 left-4 right-4 z-40">
                    <div className="bg-gray-800 text-white p-4 rounded-2xl shadow-2xl shadow-blue-900/20 flex justify-between items-center transform transition-all animate-bounce-in">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status Pemesanan</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="font-bold text-base">{isRoundTrip ? 'Siap Lanjut (PP)' : 'Siap Lanjut'}</p>
                            </div>
                        </div>
                        {/* Tombol Lanjut dengan efek kenyal */}
                        <button 
                            onClick={proceedToBooking}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-transform transform active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/50"
                        >
                            Pesan Sekarang <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}