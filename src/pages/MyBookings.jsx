import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Ticket, Calendar, MapPin, Clock, Download, ArrowLeft, AlertCircle, Timer } from 'lucide-react';
import QRCode from "react-qr-code"; 

// --- SUB-KOMPONEN: TICKET CARD (Agar Timer berjalan mandiri per tiket) ---
const TicketCard = ({ booking, downloadTicket }) => {
    // State untuk timer
    const [timeLeft, setTimeLeft] = useState(null);
    const isCancelled = booking.payment_status === 'cancelled' || booking.payment_status === 'failed';
    const isPaid = booking.payment_status === 'paid';
    const isPending = booking.payment_status === 'pending';

    // Logika Hitung Mundur (Hanya jalan kalau status Pending)
    useEffect(() => {
        if (!isPending) return;

        const interval = setInterval(() => {
            // Waktu Booking dibuat + 60 Menit
            const createdTime = new Date(booking.created_at).getTime();
            const expiryTime = createdTime + (60 * 60 * 1000); 
            const now = new Date().getTime();
            const distance = expiryTime - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("Waktu Habis");
                // Opsional: Bisa auto-refresh halaman biar statusnya berubah jadi cancelled
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking.created_at, isPending]);

    // Helper Warna Status & Style Card
    const getStatusBadge = () => {
        if (isPaid) return 'bg-green-100 text-green-700 border-green-200';
        if (isCancelled) return 'bg-gray-200 text-gray-600 border-gray-300'; // Abu-abu
        return 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse'; // Kedip-kedip kalau pending
    };

    // Style Card Utama (Kalau Cancelled jadi hitam putih/abu)
    const cardStyle = isCancelled 
        ? "bg-gray-50 rounded-xl border border-gray-200 opacity-75 grayscale transition-all" 
        : "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow";

    return (
        <div className={cardStyle}>
            
            {/* Header Status */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-opacity-50">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Kode Booking</p>
                    <p className="font-mono font-bold text-lg text-gray-800 tracking-wider">{booking.booking_code}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge()}`}>
                    {isCancelled ? 'HANGUS / BATAL' : booking.payment_status.toUpperCase()}
                </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Kolom Kiri: Detail (Sama kayak dulu) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <MapPin size={16} /> Rute
                            </div>
                            <p className="font-semibold text-lg">
                                {booking.schedule?.route?.origin?.name} → {booking.schedule?.route?.destination?.name}
                            </p>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Calendar size={16} /> Jadwal
                            </div>
                            <p className="font-semibold text-lg">
                                {new Date(booking.schedule?.departure_time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Clock size={14} /> 
                                {new Date(booking.schedule?.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} WIB
                            </p>
                        </div>
                    </div>
                    {/* Manifest Penumpang */}
                    <div className="border-t pt-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Penumpang</p>
                        <div className="bg-gray-50/50 rounded-lg p-3 space-y-2">
                            {booking.passengers.map(pax => (
                                <div key={pax.id} className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{pax.name}</span>
                                    <span className="text-gray-400 font-mono">{pax.identity_number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: ACTION AREA (Logic Berubah Disini) */}
                <div className="flex flex-col items-center justify-center border-l border-dashed border-gray-200 pl-0 md:pl-8 pt-6 md:pt-0">
                    
                    {/* KONDISI 1: SUDAH LUNAS */}
                    {isPaid && (
                        <div className="text-center">
                            <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm mb-3 inline-block">
                                <QRCode value={booking.booking_code} size={120} fgColor="#1e293b" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-3">Scan di Pelabuhan</p>
                            <button 
                                onClick={() => downloadTicket(booking.booking_code)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg transition-colors mx-auto"
                            >
                                <Download size={16} /> Download PDF
                            </button>
                        </div>
                    )}

                    {/* KONDISI 2: HANGUS / CANCELLED */}
                    {isCancelled && (
                        <div className="text-center w-full">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-gray-500 font-bold mb-1">Tiket Hangus</p>
                            <p className="text-xs text-gray-400">Batas waktu pembayaran telah habis.</p>
                        </div>
                    )}

                    {/* KONDISI 3: BELUM BAYAR (PENDING) */}
                    {isPending && (
                        <div className="text-center w-full">
                            {/* Timer Hitung Mundur */}
                            <div className="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-lg flex flex-col items-center">
                                <p className="text-[10px] uppercase font-bold text-orange-400 mb-1 flex items-center gap-1">
                                    <Timer size={10} /> Sisa Waktu Bayar
                                </p>
                                <p className="text-xl font-mono font-bold text-orange-600">
                                    {timeLeft || 'Calculating...'}
                                </p>
                            </div>

                            <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
                            <p className="text-xl font-bold text-blue-600 mb-4">
                                Rp {Number(booking.total_amount).toLocaleString('id-ID')}
                            </p>
                            
                            {booking.snap_token && (
                                <button 
                                    onClick={() => window.snap.pay(booking.snap_token)}
                                    className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    Bayar Sekarang
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN UTAMA ---
export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/my-bookings')
            .then(res => {
                setBookings(res.data.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const downloadTicket = async (bookingCode) => {
        try {
            alert(`Sedang mengunduh tiket ${bookingCode}...`);
            const response = await api.get(`/bookings/${bookingCode}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `E-Ticket-${bookingCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Gagal mengunduh. Pastikan tiket sudah LUNAS.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 mt-8">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white pt-6 pb-4 px-4 -mx-4 mb-4 border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="bg-gray-50 p-2 rounded-full border border-gray-200 text-gray-600 hover:text-blue-600 active:scale-95 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Tiket Saya</h1>
                            <p className="text-xs text-gray-500">Riwayat & Status Pembayaran</p>
                        </div>
                    </div>
                </div>

                {loading ? <p className="text-center py-10 text-gray-500">Memuat tiket...</p> : 
                 bookings.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500">Belum ada riwayat.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map(booking => (
                            <TicketCard key={booking.id} booking={booking} downloadTicket={downloadTicket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}