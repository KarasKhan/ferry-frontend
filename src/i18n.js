import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

// KAMUS KATA (Translation Resources)
const resources = {
  id: {
    translation: {
      "welcome": "Jelajahi Lautan Indonesia",
      "sub_welcome": "Pesan tiket kapal feri dengan mudah, cepat, dan aman.",
      "one_way": "Sekali Jalan",
      "round_trip": "Pulang Pergi",
      "from": "Dari Pelabuhan",
      "to": "Ke Pelabuhan",
      "date_depart": "Tanggal Pergi",
      "date_return": "Tanggal Pulang",
      "search_btn": "Cari Jadwal Kapal",
      "select_origin": "Pilih Asal",
      "select_dest": "Pilih Tujuan",
      "loading_ports": "Memuat Data...",
      "ready_go": "Jadwal Keberangkatan",
      "ready_back": "Jadwal Kepulangan",
      "seats": "Sisa",
      "selected": "Dipilih",
      "continue_btn": "Pesan Sekarang",
      "ready_status": "Siap Lanjut"
    }
  },
  en: {
    translation: {
      "welcome": "Explore Indonesian Seas",
      "sub_welcome": "Book ferry tickets easily, quickly, and securely.",
      "one_way": "One Way",
      "round_trip": "Round Trip",
      "from": "From Port",
      "to": "To Port",
      "date_depart": "Departure Date",
      "date_return": "Return Date",
      "search_btn": "Search Schedule",
      "select_origin": "Select Origin",
      "select_dest": "Select Destination",
      "loading_ports": "Loading Data...",
      "ready_go": "Departure Schedule",
      "ready_back": "Return Schedule",
      "seats": "Left",
      "selected": "Selected",
      "continue_btn": "Book Now",
      "ready_status": "Ready to Go"
    }
  },
  my: {
    translation: {
      "welcome": "Jelajah Lautan Indonesia",
      "sub_welcome": "Tempah tiket feri dengan mudah, pantas, dan selamat.",
      "one_way": "Sehala",
      "round_trip": "Dua Hala",
      "from": "Dari Pelabuhan",
      "to": "Ke Pelabuhan",
      "date_depart": "Tarikh Pergi",
      "date_return": "Tarikh Pulang",
      "search_btn": "Cari Jadual Feri",
      "select_origin": "Pilih Asal",
      "select_dest": "Pilih Destinasi",
      "loading_ports": "Memuat Data...",
      "ready_go": "Jadual Pelepasan",
      "ready_back": "Jadual Pulang",
      "seats": "Baki",
      "selected": "Dipilih",
      "continue_btn": "Tempah Sekarang",
      "ready_status": "Sedia Lanjut"
    }
  }
};

i18n
  .use(LanguageDetector) // Otomatis deteksi bahasa browser user
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "id", // Kalau bahasa gak ketemu, pakai Indo
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;