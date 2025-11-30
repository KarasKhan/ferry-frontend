import i18n from '../i18n'; // Import settingan bahasa kita

// Kurs Manual (Estimasi)
// Nanti bisa diupdate kalau Rupiah melemah/menguat
const EXCHANGE_RATES = {
    IDR: 1,
    MYR: 3500,  // 1 Ringgit approx Rp 3.500
    USD: 15500  // 1 USD approx Rp 15.500
};

export const formatCurrency = (amountInIDR) => {
    // Cek bahasa yang sedang aktif (id, my, en)
    const language = i18n.language; 

    let currency = 'IDR';
    let rate = 1;

    // Tentukan mata uang target berdasarkan bahasa
    if (language === 'my') {
        currency = 'MYR';
        rate = EXCHANGE_RATES.MYR;
    } else if (language === 'en') {
        currency = 'USD';
        rate = EXCHANGE_RATES.USD;
    }

    // Hitung Konversi
    const convertedAmount = amountInIDR / rate;

    // Format Angka jadi Duit (Rp 10.000 atau RM 2.85)
    // Kalau IDR gak usah pakai koma desimal, kalau asing pakai 2 desimal
    return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'IDR' ? 0 : 2,
        maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(convertedAmount);
};