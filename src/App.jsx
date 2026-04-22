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

const AppContent = ({ isLoggedIn, setIsLoggedIn, childProfiles, setChildProfiles, activeChildIndex, setActiveChildIndex }) => {
  const location = useLocation();
  const hideHeaderRoutes = ['/', '/login'];

  const activeChild = childProfiles[activeChildIndex] || null;

  useEffect(() => {
    if (activeChild && activeChild.gender) {
      if (activeChild.gender.toLowerCase() === 'male' || activeChild.gender.toLowerCase() === 'boy') {
        document.documentElement.setAttribute('data-theme', 'boy');
      } else if (activeChild.gender.toLowerCase() === 'female' || activeChild.gender.toLowerCase() === 'girl') {
        document.documentElement.setAttribute('data-theme', 'girl');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [activeChild]);

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} activeChild={activeChild} childProfiles={childProfiles} setActiveChildIndex={setActiveChildIndex} />}
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard childProfiles={childProfiles} setChildProfiles={setChildProfiles} activeChildIndex={activeChildIndex} setActiveChildIndex={setActiveChildIndex} />} />
        <Route path="/vaccine-tracker" element={<VaccineTracker activeChild={activeChild} childProfiles={childProfiles} setChildProfiles={setChildProfiles} />} />
        <Route path="/digital-card" element={<DigitalCard activeChild={activeChild} />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/profile" element={<Profile activeChild={activeChild} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/public/:id" element={<PublicView />} />
      </Routes>
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [childProfiles, setChildProfiles] = useState([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchChildren = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setIsLoggedIn(false);
            return;
          }
          const response = await fetch('http://localhost:5000/api/children', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setChildProfiles(data.children || []);
            setActiveChildIndex(0);
          } else {
            console.error('Failed to fetch children');
          }
        } catch (e) {
          console.error('Error fetching data:', e);
        }
      };
      fetchChildren();
    } else {
      setChildProfiles([]);
      setActiveChildIndex(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <BrowserRouter>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        childProfiles={childProfiles}
        setChildProfiles={setChildProfiles}
        activeChildIndex={activeChildIndex}
        setActiveChildIndex={setActiveChildIndex}
      />
    </BrowserRouter>
  )
}

export default App
