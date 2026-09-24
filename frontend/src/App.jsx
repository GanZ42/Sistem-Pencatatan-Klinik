import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('klinik_token');
      const savedUser = localStorage.getItem('klinik_user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Storage korup / diutak-atik manual -> bersihkan agar tidak blank putih
      localStorage.removeItem('klinik_token');
      localStorage.removeItem('klinik_user');
      setUser(null);
    }
    setChecking(false);
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('klinik_token');
    localStorage.removeItem('klinik_user');
    setUser(null);
    setShowLogin(false);
  }

  if (checking) return null;

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <LandingPage onMasuk={() => setShowLogin(true)} />;
}
