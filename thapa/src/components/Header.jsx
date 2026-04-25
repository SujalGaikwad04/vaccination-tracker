import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isLoggedIn, setIsLoggedIn, activeChild, childProfiles, setActiveChildIndex }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const [childSelectorOpen, setChildSelectorOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const desktopChildSelectorRef = useRef(null);
  const mobileChildSelectorRef = useRef(null);
  const notificationRef = useRef(null);

  // Calculate Alerts
  let missedAlerts = [];
  let upcomingAlerts = [];
  if (activeChild && activeChild.vaccines) {
    const sortedVaccines = [...activeChild.vaccines].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    missedAlerts = sortedVaccines.filter(v => v.status === 'missed').map(v => ({
      type: 'missed',
      title: `${v.name} missed`,
      time: `Was due on ${new Date(v.dueDate).toLocaleDateString()}`
    }));
    upcomingAlerts = sortedVaccines.filter(v => v.status === 'due' || v.status === 'upcoming')
      .filter(v => {
        const due = new Date(v.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7; // Remind 1 week ahead
      })
      .map(v => ({
        type: 'upcoming',
        title: `${v.name} due soon`,
        time: `Due on ${new Date(v.dueDate).toLocaleDateString()}`
      }));
  }
  const allAlerts = [...missedAlerts, ...upcomingAlerts].slice(0, 5);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }

      const isOutsideDesktop = desktopChildSelectorRef.current && !desktopChildSelectorRef.current.contains(event.target);
      const isOutsideMobile = mobileChildSelectorRef.current && !mobileChildSelectorRef.current.contains(event.target);
      const isOutsideNotification = notificationRef.current && !notificationRef.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile) {
        setChildSelectorOpen(false);
      }
      if (isOutsideNotification) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthAction = () => {
    setProfileMenuOpen(false);
    if (isLoggedIn) {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      if (setIsLoggedIn) setIsLoggedIn(false);
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        {/* Logo & Branding */}
        <NavLink to="/dashboard" className="header-brand" onClick={closeMobileMenu}>
          <div className="header-logo-icon">
            <img src="/vaxicare-logo.png" alt="VaxiCare Logo" className="logo-img" />
          </div>
          <span className="header-title">
            Vaxi<span className="header-title-highlight">Care</span>
          </span>
        </NavLink>

        {/* Center: Child Selector (Desktop) */}
        <div className="header-profile-selector" ref={desktopChildSelectorRef}>
          <button className="profile-btn" onClick={() => setChildSelectorOpen(!childSelectorOpen)}>
            <div className="profile-img-container">
              <img
                data-alt="Child portrait"
                src={activeChild ? (activeChild.avatarUrl || (activeChild.gender?.toLowerCase() === 'male' || activeChild.gender?.toLowerCase() === 'boy' ? '/baby-boy.png' : activeChild.gender?.toLowerCase() === 'female' || activeChild.gender?.toLowerCase() === 'girl' ? '/baby-girl.png' : `https://ui-avatars.com/api/?name=${activeChild.name}&background=0D8ABC&color=fff&rounded=true`)) : "/baby-boy.png"}
                alt="Child Profile Placeholder"
              />
            </div>
            <div className="profile-info">
              <span className="profile-label">Active Profile</span>
              <span className="profile-name">{activeChild ? activeChild.name : "Select Child"}</span>
            </div>
            {childProfiles && childProfiles.length > 0 && (
              <span className={`chevron-arrow ${childSelectorOpen ? 'up' : ''}`}></span>
            )}
          </button>

          {childProfiles && childProfiles.length > 0 && (
            <div className={`profile-dropdown ${childSelectorOpen ? 'open' : ''}`} style={{ top: 'calc(100% + 10px)' }}>
              {childProfiles.map((child, index) => (
                <button
                  key={index}
                  className={`dropdown-item ${activeChild && activeChild.id === child.id ? 'text-primary font-bold bg-primary/5' : ''}`}
                  onClick={() => {
                    setActiveChildIndex(index);
                    setChildSelectorOpen(false);
                    if (window.location.pathname !== '/dashboard') {
                      navigate('/dashboard');
                    }
                  }}
                >
                  <div className="flex items-center gap-2 w-full text-left">
                    <img src={child.avatarUrl || (child.gender?.toLowerCase() === 'male' || child.gender?.toLowerCase() === 'boy' ? '/baby-boy.png' : child.gender?.toLowerCase() === 'female' || child.gender?.toLowerCase() === 'girl' ? '/baby-girl.png' : `https://ui-avatars.com/api/?name=${child.name}&background=ec5b13&color=fff&rounded=true&size=24`)} alt={child.name} className="rounded-full w-6 h-6 object-cover" />
                    <span>{child.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notifications & User */}
        <div className="header-actions">
          <div className="notification-container" ref={notificationRef}>
            <button className="notification-btn" onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <img src="/bell-icon.png" alt="Notifications" className="bell-img" />
              {allAlerts.length > 0 && <span className="notification-badge">{allAlerts.length}</span>}
            </button>

            <div className={`notification-dropdown ${notificationsOpen ? 'open' : ''}`}>
              <div className="notif-header">
                <h3>Notifications</h3>
                {allAlerts.length > 0 && <span className="notif-count">{allAlerts.length} New</span>}
              </div>
              <div className="notif-body">
                {allAlerts.length === 0 ? (
                  <div className="notif-empty">
                    <span className="material-symbols-outlined">notifications_off</span>
                    <p>No new notifications</p>
                  </div>
                ) : (
                  allAlerts.map((alert, idx) => (
                    <div key={idx} className={`notif-item ${alert.type}`} onClick={() => {
                      setNotificationsOpen(false);
                      if (alert.type === 'missed') navigate('/vaccine-tracker');
                      else navigate('/dashboard');
                    }}>
                      <div className="notif-icon">
                        <span className="material-symbols-outlined">
                          {alert.type === 'missed' ? 'warning' : 'event_upcoming'}
                        </span>
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{alert.title}</p>
                        <p className="notif-time">{alert.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {allAlerts.length > 0 && (
                <div className="notif-footer">
                  <button onClick={() => { setNotificationsOpen(false); navigate('/vaccine-tracker'); }}>
                    View All Schedule
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="divider"></div>

          <div className="user-profile-container" ref={profileMenuRef}>
            <button className="user-btn" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
              <img
                className="user-avatar"
                data-alt="Profile picture of parent or guardian"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhrgHkk4ReWg8tP8FX8mwEAZNdFHejpfH3g01USUj1Nflc8PY-1a6Uz08lROuVoyBEKt4m3LYVSiVq4HkZbK6sJCy4iCDv3o-h50bTpCSIQ5IVEG7lR2-kBBtrWeW-kFiDpv50XSpzq6hMzJm5XDYqYfDuMb1LBhLZVrOU-gEXILp96L_K2QqAVryempmZvcMk2H6VPiLRf6sHqQD0VLLsF5NJSPC7RFsFfalkgRSvhu2gCm_bqL4lWWC_rbA9_UOssQYJ9h47Z2k"
                alt="Parent avatar"
              />
              <span className={`chevron-arrow ${profileMenuOpen ? 'up' : ''}`}></span>
            </button>

            <div className={`profile-dropdown ${profileMenuOpen ? 'open' : ''}`}>
              <button
                className="dropdown-item"
                onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}
              >
                Profile & Settings
              </button>
              <div className="dropdown-divider"></div>
              <button
                className={`dropdown-item ${isLoggedIn ? 'logout-item' : 'text-primary'}`}
                onClick={handleAuthAction}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            </div>
          </div>

          {/* Hamburger Menu (Mobile Only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Sub-header/Navigation Tabs (Desktop) */}
      <nav className="header-nav">
        <div className="nav-container">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/vaccine-tracker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Vaccine Tracker</NavLink>
          <NavLink to="/digital-card" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Digital Card</NavLink>
          <NavLink to="/awareness" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Awareness</NavLink>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Profile Selector (Mobile) */}
        <div className="mobile-profile" ref={mobileChildSelectorRef}>
          <button className="profile-btn" onClick={() => setChildSelectorOpen(!childSelectorOpen)}>
            <div className="profile-img-container">
              <img
                src={activeChild ? (activeChild.avatarUrl || (activeChild.gender?.toLowerCase() === 'male' || activeChild.gender?.toLowerCase() === 'boy' ? '/baby-boy.png' : activeChild.gender?.toLowerCase() === 'female' || activeChild.gender?.toLowerCase() === 'girl' ? '/baby-girl.png' : `https://ui-avatars.com/api/?name=${activeChild.name}&background=0D8ABC&color=fff&rounded=true`)) : "/baby-boy.png"}
                alt="Child Profile Placeholder"
              />
            </div>
            <div className="profile-info">
              <span className="profile-label">Active Profile</span>
              <span className="profile-name">{activeChild ? activeChild.name : "Select Child"}</span>
            </div>
            {childProfiles && childProfiles.length > 0 && (
              <span className={`chevron-arrow ${childSelectorOpen ? 'up' : ''}`}></span>
            )}
          </button>

          {childProfiles && childProfiles.length > 0 && (
            <div className={`profile-dropdown ${childSelectorOpen ? 'open' : ''}`}>
              {childProfiles.map((child, index) => (
                <button
                  key={index}
                  className={`dropdown-item ${activeChild && activeChild.id === child.id ? 'text-primary font-bold bg-primary/5' : ''}`}
                  onClick={() => {
                    setActiveChildIndex(index);
                    setChildSelectorOpen(false);
                    closeMobileMenu();
                    if (window.location.pathname !== '/dashboard') {
                      navigate('/dashboard');
                    }
                  }}
                >
                  <div className="flex items-center gap-2 w-full text-left">
                    <img src={child.avatarUrl || (child.gender?.toLowerCase() === 'male' || child.gender?.toLowerCase() === 'boy' ? '/baby-boy.png' : child.gender?.toLowerCase() === 'female' || child.gender?.toLowerCase() === 'girl' ? '/baby-girl.png' : `https://ui-avatars.com/api/?name=${child.name}&background=ec5b13&color=fff&rounded=true&size=24`)} alt={child.name} className="rounded-full w-6 h-6 object-cover" />
                    <span>{child.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links (Mobile) */}
        <nav className="mobile-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Dashboard</NavLink>
          <NavLink to="/vaccine-tracker" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Vaccine Tracker</NavLink>
          <NavLink to="/digital-card" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Digital Card</NavLink>
          <NavLink to="/awareness" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Awareness</NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
