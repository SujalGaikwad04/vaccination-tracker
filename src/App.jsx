import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import VaccineTracker from './pages/VaccineTracker'
import DigitalCard from './pages/DigitalCard'
import Awareness from './pages/Awareness'
import Profile from './pages/Profile'
import Login from './pages/Login'
import PublicView from './pages/PublicView'

const AppContent = ({ isLoggedIn, setIsLoggedIn }) => {
  const location = useLocation();
  const hideHeaderRoutes = ['/', '/login'];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vaccine-tracker" element={<VaccineTracker />} />
        <Route path="/digital-card" element={<DigitalCard />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/public/:id" element={<PublicView />} />
      </Routes>
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <BrowserRouter>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </BrowserRouter>
  )
}

export default App
