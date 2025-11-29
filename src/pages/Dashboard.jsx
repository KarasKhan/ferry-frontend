import { useState, useRef } from 'react'; // Hapus useEffect karena data ports sudah ada di Context
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, Calendar, Search, Ship, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // <--- Import ini
import { Globe } from 'lucide-react'; // <--- Import Icon Globe (Opsional)

export default function Dashboard() {
    const { t, i18n } = useTranslation(); // <--- Init fungsi translate
    // Ambil user dan ports LANGSUNG dari Context (Data sudah siap berkat Splash Screen)
    const { user, ports } = useAuth(); 
    const navigate = useNavigate();
    
    // REF untuk Auto Scroll
    const resultsRef = useRef(null); 

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

        // Logic Cegatan Satpam (Guest Mode)
        if (!user) {
            navigate('/profile', { state: { from: '/booking', schedules: selectedSchedules } });
        } else {
            navigate('/booking', { state: { schedules: selectedSchedules } });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            
            {/* HERO SECTION */}
            <div className="bg-blue-600 px-4 pt-10 pb-32 rounded-b-[2.5rem] shadow-lg relative">
                
                {/* --- TOMBOL GANTI BAHASA (POJOK KANAN ATAS) --- */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-blue-700/50 backdrop-blur-md p-1 rounded-lg flex gap-1 border border-blue-500/30">
                        <button onClick={() => i18n.changeLanguage('id')} className={`px-2 py-1 rounded text-lg transition-all ${i18n.language === 'id' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇮🇩</button>
                        <button onClick={() => i18n.changeLanguage('my')} className={`px-2 py-1 rounded text-lg transition-all ${i18n.language === 'my' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇲🇾</button>
                        <button onClick={() => i18n.changeLanguage('en')} className={`px-2 py-1 rounded text-lg transition-all ${i18n.language === 'en' ? 'bg-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}>🇺🇸</button>
                    </div>
                </div>
                {/* ----------------------------------------------- */}

                <div className="max-w-5xl mx-auto text-center text-white mb-8 mt-4">
                    {/* Ganti Teks dengan t('key') */}
                    <h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1>
                    <p className="opacity-90">{t('sub_welcome')}</p>
                </div>

                <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
                    <form onSubmit={handleSearch} className="space-y-6">
                        
                        <div className="flex justify-center">
                            <label className="inline-flex items-center cursor-pointer bg-gray-100 p-1 rounded-full shadow-inner">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all transform active:scale-95 duration-100 ${!isRoundTrip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setIsRoundTrip(false)}>
                                    {t('one_way')}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all transform active:scale-95 duration-100 ${isRoundTrip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setIsRoundTrip(true)}>
                                    {t('round_trip')}
                                </span>
                            </label>
                        </div>

                        {/* Area Input Utama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 relative">
                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">{t('from')}</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-blue-500"><Ship size={24} /></div>
                                    <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent hover:bg-white hover:border-blue-100 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-semibold text-gray-700 transition-all appearance-none cursor-pointer" value={origin} onChange={(e) => setOrigin(e.target.value)} required>
                                        <option value="">{t('select_origin')}</option>
                                        {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-gray-400"><ArrowRight size={16} /></div>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">{t('to')}</label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 text-orange-500"><MapPin size={24} /></div>
                                    <select className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent hover:bg-white hover:border-orange-100 focus:bg-white focus:border-orange-500 rounded-xl outline-none font-semibold text-gray-700 transition-all appearance-none cursor-pointer" value={destination} onChange={(e) => setDestination(e.target.value)} required>
                                        <option value="">{t('select_dest')}</option>
                                        {ports.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                                    </select>
                                    <div className="absolute right-4 pointer-events-none text-gray-400"><ArrowRight size={16} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Area Tanggal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
                            <div className={`transition-all duration-300 ease-in-out ${isRoundTrip ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">{t('date_depart')}</label>
                                <div className="relative flex items-center group">
                                    <div className="absolute left-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <input type="date" className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-blue-500 rounded-xl outline-none font-bold text-gray-700 transition-all shadow-sm" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>
                            </div>
                            
                            {isRoundTrip && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">{t('date_return')}</label>
                                    <div className="relative flex items-center group">
                                        <div className="absolute left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <input type="date" className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 focus:border-orange-500 rounded-xl outline-none font-bold text-gray-700 transition-all shadow-sm" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required={isRoundTrip} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transform transition-transform active:scale-95 duration-100 flex items-center justify-center gap-2">
                            <Search size={22} strokeWidth={3} />
                            {t('search_btn')}
                        </button>

                    </form>
                </div>
            </div>

            {/* HASIL PENCARIAN */}
            <div ref={resultsRef} className="max-w-6xl mx-auto px-4 -mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
                
                {(hasSearched || loading) && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                            <ArrowRight className="text-blue-600" /> {t('ready_go')}
                        </h3>
                        
                        {loading ? <p className="text-center">{t('loading_ports')}</p> : 
                         schedules.departures.length === 0 ? <p className="text-center text-gray-500 py-10 bg-white rounded-lg">Tidak ada jadwal.</p> :
                         schedules.departures.map(item => (
                            <div key={item.id} onClick={() => setSelectedDeparture(item)} className={`bg-white p-4 rounded-xl shadow-md border-2 cursor-pointer transition-all transform active:scale-95 duration-100 ${selectedDeparture?.id === item.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Ship size={20} /></div>
                                        <div>
                                            <h4 className="font-bold">{item.ship.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(item.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">{t('seats')} {item.quota_passenger_left}</p>
                                        {selectedDeparture?.id === item.id && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">{t('selected')}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isRoundTrip && (hasSearched || loading) && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                            <ArrowLeftRight className="text-orange-600" /> {t('ready_back')}
                        </h3>

                        {loading ? <p className="text-center">{t('loading_ports')}</p> : 
                         schedules.returns.length === 0 ? <p className="text-center text-gray-500 py-10 bg-white rounded-lg">Tidak ada jadwal pulang.</p> :
                         schedules.returns.map(item => (
                            <div key={item.id} onClick={() => setSelectedReturn(item)} className={`bg-white p-4 rounded-xl shadow-md border-2 cursor-pointer transition-all transform active:scale-95 duration-100 ${selectedReturn?.id === item.id ? 'border-orange-500 ring-2 ring-orange-100' : 'border-transparent hover:border-gray-200'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600"><Ship size={20} /></div>
                                        <div>
                                            <h4 className="font-bold">{item.ship.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(item.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-600">{t('seats')} {item.quota_passenger_left}</p>
                                        {selectedReturn?.id === item.id && <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">{t('selected')}</span>}
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
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="font-bold text-base">{t('ready_status')}</p>
                            </div>
                        </div>
                        <button onClick={proceedToBooking} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-transform transform active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/50">
                            {t('continue_btn')} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}