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

// Proteksi Halaman
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
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
          {/* Halaman Login */}
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />

          {/* HALAMAN UTAMA (DENGAN MENU BAWAH) */}
          <Route element={
              <ProtectedRoute>
                 <AppLayout />
              </ProtectedRoute>
          }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/booking" element={<Booking />} />
          </Route>
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;