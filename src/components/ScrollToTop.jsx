import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset posisi scroll ke (0,0) alias paling atas kiri
    window.scrollTo(0, 0);
  }, [pathname]); // Dijalankan setiap kali 'pathname' (URL) berubah

  return null; // Komponen ini tidak merender apa-apa (invisible)
}