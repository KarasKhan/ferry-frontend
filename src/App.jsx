import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile'; // Import Profile
import BottomNav from './components/BottomNav'; // Import BottomNav

// Layout Khusus User (Ada Menu Bawahnya)
const AppLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
       {/* Area Konten Halaman */}
       <div className="pb-24"> {/* Kasih padding bawah biar konten gak ketutup menu */}
          <Outlet /> 
       </div>
       
       {/* Menu Bawah Melayang */}
       <BottomNav />
    </div>
  );
};

// Proteksi Halaman (Wajib Login)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // <--- Ambil lokasi saat ini

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  
  if (!user) {
      // replace={true} adalah KUNCINYA. 
      // Ini menghapus jejak halaman terlarang dari history browser.
      return <Navigate to="/profile" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Proteksi Tamu
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          
          {/* Halaman Login Khusus (Redirect) */}
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />

          {/* HALAMAN UTAMA (AppLayout) */}
          <Route element={<AppLayout />}> {/* <--- HAPUS ProtectedRoute DI SINI */}
              
              {/* Dashboard: PUBLIC (Semua bisa akses) */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Profile: PUBLIC (Isinya adaptif: Form Login / Data Diri) */}
              <Route path="/profile" element={<Profile />} />

              {/* MyBookings: PROTECTED (Hanya User Login) */}
              <Route path="/my-bookings" element={
                  <ProtectedRoute>
                      <MyBookings />
                  </ProtectedRoute>
              } />
              
              {/* Booking: PROTECTED (Hanya User Login) */}
              <Route path="/booking" element={
                  <ProtectedRoute>
                      <Booking />
                  </ProtectedRoute>
              } />

          </Route>
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;