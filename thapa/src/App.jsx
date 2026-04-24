import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import ChatBot from './components/ChatBot'
import Dashboard from './pages/Dashboard'
import VaccineTracker from './pages/VaccineTracker'
import DigitalCard from './pages/DigitalCard'
import Awareness from './pages/Awareness'
import Profile from './pages/Profile'
import Login from './pages/Login'
import PublicView from './pages/PublicView'
import VaccineInfo from './pages/VaccineInfo'
import { SettingsProvider } from './context/SettingsContext'
import { API_URL } from './config'

const AppContent = ({ isLoggedIn, setIsLoggedIn, childProfiles, setChildProfiles, activeChildIndex, setActiveChildIndex }) => {
  const location = useLocation();
  const hideHeaderRoutes = ['/', '/login'];

  const activeChild = childProfiles[activeChildIndex] || null;

  // ChatBot state — shared globally across all pages
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMsg, setChatInitialMsg] = useState('');

  // Listen for navigation state to open chat with a pre-filled question
  useEffect(() => {
    if (location.state?.openChat) {
      setChatInitialMsg(location.state.chatQuestion || '');
      setChatOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const showFloatingBtn = !hideHeaderRoutes.includes(location.pathname) && !chatOpen;

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && (
        <Header
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          activeChild={activeChild}
          childProfiles={childProfiles}
          setActiveChildIndex={setActiveChildIndex}
        />
      )}

      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/dashboard" element={<Dashboard childProfiles={childProfiles} setChildProfiles={setChildProfiles} activeChildIndex={activeChildIndex} setActiveChildIndex={setActiveChildIndex} />} />
        <Route path="/vaccine-tracker" element={<VaccineTracker activeChild={activeChild} childProfiles={childProfiles} setChildProfiles={setChildProfiles} />} />
        <Route path="/digital-card" element={<DigitalCard activeChild={activeChild} />} />
        <Route path="/awareness" element={
          <Awareness
            openChat={(q) => { setChatInitialMsg(q || ''); setChatOpen(true); }}
          />
        } />
        <Route path="/profile" element={<Profile activeChild={activeChild} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/public/:id" element={<PublicView />} />
        <Route path="/vaccine-info/:id" element={<VaccineInfo />} />
      </Routes>

      {/* Global Floating Chat Button */}
      {showFloatingBtn && (
        <button
          className="vx-float-btn"
          onClick={() => { setChatInitialMsg(''); setChatOpen(true); }}
          title="Ask VaxiCare AI"
          id="open-vaxicare-ai"
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="vx-float-badge">AI</span>
          <span className="vx-float-tooltip">Ask VaxiCare AI</span>
        </button>
      )}

      {/* Global ChatBot Modal */}
      <ChatBot
        isOpen={chatOpen}
        onClose={() => { setChatOpen(false); setChatInitialMsg(''); }}
        initialMessage={chatInitialMsg}
      />
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
          const response = await fetch(`${API_URL}/api/children`, {
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
    <SettingsProvider>
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
    </SettingsProvider>
  )
}

export default App
