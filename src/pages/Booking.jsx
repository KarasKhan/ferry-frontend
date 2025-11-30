import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
// Tambahkan ArrowLeft di import
import { User, CreditCard, Trash2, PlusCircle, Ship, Calendar, MapPin, Ticket, ChevronDown, Info, ArrowLeft } from 'lucide-react';

import { formatCurrency } from '../utils/currency';
import { useTranslation } from 'react-i18next'; // Kita butuh ini buat cek bahasa aktif

export default function Booking() {
    const { i18n } = useTranslation();
    const { state } = useLocation(); 
    const navigate = useNavigate();
    
    // Ambil data schedules (Array) dari Dashboard
    const selectedSchedules = state?.schedules || [];

    // Validasi: Kalau user nyelonong masuk tanpa pilih jadwal, tendang ke home
    useEffect(() => {
        if (selectedSchedules.length === 0) {
            navigate('/');
        }
    }, [selectedSchedules, navigate]);

    // State Penumpang
    const [passengers, setPassengers] = useState([
        { name: '', identity_number: '', ticket_category_id: '' }
    ]);
    const [loading, setLoading] = useState(false);

    // --- LOGIC FORM PENUMPANG ---
    const addPassenger = () => {
        setPassengers([...passengers, { name: '', identity_number: '', ticket_category_id: '' }]);
    };

    const removePassenger = (index) => {
        if (passengers.length > 1) {
            const newPassengers = [...passengers];
            newPassengers.splice(index, 1);
            setPassengers(newPassengers);
        }
    };

    const handleInputChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    // --- LOGIC HITUNG HARGA (PP / One Way) ---
    const calculateTotal = () => {
        let grandTotal = 0;
        passengers.forEach(pax => {
            selectedSchedules.forEach(schedule => {
                const priceObj = schedule.route.pricings.find(p => p.category_id == pax.ticket_category_id);
                if (priceObj) {
                    grandTotal += Number(priceObj.price);
                }
            });
        });
        return grandTotal;
    };

    // --- SUBMIT KE BACKEND ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                schedule_ids: selectedSchedules.map(s => s.id),
                passengers: passengers
            };

            const response = await api.post('/bookings', payload);
            const { snap_token } = response.data;

            if (snap_token) {
                window.snap.pay(snap_token, {
                    onSuccess: () => { alert("Pembayaran Berhasil!"); navigate('/my-bookings'); },
                    onPending: () => { alert("Menunggu pembayaran!"); navigate('/my-bookings'); },
                    onError: () => alert("Pembayaran Gagal!"),
                    onClose: () => alert('Anda menutup popup pembayaran')
                });
            } else {
                alert("Gagal mendapatkan token pembayaran");
            }

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Gagal booking tiket');
        } finally {
            setLoading(false);
        }
    };

    if (selectedSchedules.length === 0) return null;

    // Ambil data acuan pricing dari jadwal pertama
    const referencePricings = selectedSchedules[0]?.route?.pricings || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            
            <div className="max-w-5xl mx-auto px-4 mt-8">
                
                {/* HEADER STICKY (SOLID WHITE) */}
                <div className="sticky top-0 z-20 bg-white pt-6 pb-4 px-4 -mx-4 mb-6 border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="bg-gray-50 p-2 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Pemesanan Tiket</h1>
                            <p className="text-xs text-gray-500">Lengkapi data penumpang</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KOLOM KIRI: FORM PENUMPANG */}
                    <div className="lg:col-span-2 space-y-6">
                        <form id="bookingForm" onSubmit={handleSubmit}>
                            {passengers.map((pax, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4 relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                            <User size={18} className="text-blue-500" /> Penumpang {index + 1}
                                        </h3>
                                        {passengers.length > 1 && (
                                            <button type="button" onClick={() => removePassenger(index)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Lengkap</label>
                                            <input 
                                                type="text" required
                                                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={pax.name}
                                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                                placeholder="Sesuai KTP/Identitas"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">NIK / Identitas</label>
                                            <input 
                                                type="text" required
                                                className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={pax.identity_number}
                                                onChange={(e) => handleInputChange(index, 'identity_number', e.target.value)}
                                                placeholder="Nomor KTP/SIM/Paspor"
                                            />
                                        </div>
                                        
                                        {/* GOLONGAN TIKET (DESAIN BARU) */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Golongan Tiket</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
                                                    <Ticket size={20} />
                                                </div>

                                                <select 
                                                    required
                                                    className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent hover:bg-white hover:border-blue-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-gray-700 transition-all appearance-none cursor-pointer placeholder-gray-400"
                                                    value={pax.ticket_category_id}
                                                    onChange={(e) => handleInputChange(index, 'ticket_category_id', e.target.value)}
                                                >
                                                    <option value="" className="text-gray-400">Pilih Kategori Tiket</option>
                                                    {referencePricings.map(price => (
                                                        <option key={price.id} value={price.category_id} className="text-gray-800">
                                                            {price.category.name} — {formatCurrency(price.price)}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors">
                                                    <ChevronDown size={20} />
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1 mt-2 ml-1 text-[10px] text-gray-400">
                                                <Info size={12} />
                                                <span>Harga tiket otomatis dihitung untuk perjalanan Pergi & Pulang (jika ada)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={addPassenger} className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                                <PlusCircle size={20} /> Tambah Penumpang Lain
                            </button>
                        </form>
                    </div>

                    {/* KOLOM KANAN: RINGKASAN */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 sticky top-24">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-4 flex items-center gap-2">
                                <Ship size={20} className="text-blue-600" /> Ringkasan Perjalanan
                            </h3>
                            
                            <div className="space-y-6 mb-6">
                                {selectedSchedules.map((sch, idx) => (
                                    <div key={sch.id} className="relative pl-4 border-l-2 border-blue-200">
                                        <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                        <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                                            {idx === 0 ? 'Perjalanan Pergi' : 'Perjalanan Pulang'}
                                        </p>
                                        <p className="font-bold text-gray-800 text-sm">
                                            {sch.route.origin.name} → {sch.route.destination.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Calendar size={12} />
                                            {new Date(sch.departure_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • 
                                            {new Date(sch.departure_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Kapal: {sch.ship.name}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                    <span>Jumlah Penumpang</span>
                                    <span className="font-semibold">{passengers.length} Orang</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold text-blue-600 mt-4">
                                    <span>Total Bayar</span>
                                    <div className="text-right">
                                        {/* Tampilkan Harga sesuai Mata Uang Bahasa */}
                                        <span>{formatCurrency(calculateTotal())}</span>
                                        
                                        {/* Jika BUKAN Bahasa Indo, kasih info kecil bahwa charge tetap IDR */}
                                        {i18n.language !== 'id' && (
                                            <p className="text-[10px] text-gray-400 font-normal mt-1">
                                                Processed in IDR (Rp {calculateTotal().toLocaleString('id-ID')})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button 
                                form="bookingForm"
                                type="submit" 
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {loading ? 'Memproses...' : (
                                    <>
                                        <CreditCard size={18} /> Bayar Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}