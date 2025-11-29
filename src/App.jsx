import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop'; // <--- Import ini

// Layout Khusus User
const AppLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="pb-24"> 
          <Outlet /> 
       </div>
       <BottomNav />
    </div>
  );
};

// Proteksi Halaman
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  
  if (!user) {
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
      {/* --- PERBAIKAN: ScrollToTop HARUS DI SINI (Di luar Routes) --- */}
      <ScrollToTop /> 
      
      <AuthProvider>
        <Routes>
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />

          <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              <Route path="/my-bookings" element={
                  <ProtectedRoute>
                      <MyBookings />
                  </ProtectedRoute>
              } />
              
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