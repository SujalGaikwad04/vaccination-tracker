import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Profile.css';
import { API_URL } from '../config';

const Profile = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [age, setAge] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const { theme, setTheme, fontSize, setFontSize, isPrivate, setIsPrivate } = useSettings();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords do not match!");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert("Password updated successfully!");
                setShowPasswordModal(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                alert(data.error || "Failed to update password");
            }
        } catch (err) {
            alert("Connection error");
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserEmail(user.email);
                if (user.full_name) setFullName(user.full_name);
                if (user.mobile_number) setMobileNumber(user.mobile_number);
                if (user.age) setAge(user.age);
                if (user.profile_picture) setProfilePicture(user.profile_picture);
            } catch (e) {
                console.error("Could not parse user data");
            }
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: userEmail, full_name: fullName, mobile_number: mobileNumber, age, profile_picture: profilePicture })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Profile updated successfully!');
                const user = JSON.parse(localStorage.getItem('user'));
                localStorage.setItem('user', JSON.stringify({ ...user, full_name: fullName, mobile_number: mobileNumber, age, profile_picture: profilePicture }));
            } else {
                setMessage(data.error || 'Failed to update profile');
            }
        } catch (err) {
            setMessage('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        if (setIsLoggedIn) setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <main className="profile-main">
            <div className="profile-header">
                <div className="profile-title-group">
                    <h1 className="profile-title">Profile & Settings</h1>
                    <p className="profile-subtitle">Manage your family health accounts and preferences</p>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-card profile-card-large">
                    <div className="profile-form-layout">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar-wrapper">
                                <img alt="Profile large" className="profile-avatar-img" src={profilePicture || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} />
                            </div>
                            <label className="profile-avatar-upload">
                                <input
                                    type="file"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setProfilePicture(reader.result);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <span className="font-icon icon-sm">photo_camera</span>
                            </label>
                        </div>
                        <div className="profile-form-fields">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="form-input" type="text" placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="form-input" type="text" placeholder="Add mobile number" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Verified Email</label>
                                <div className="input-with-icon">
                                    <input className="form-input" type="email" defaultValue={userEmail} readOnly />
                                    <span className="input-icon">verified</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input value={age} onChange={(e) => setAge(e.target.value)} className="form-input" type="number" placeholder="Enter age" />
                            </div>
                        </div>
                    </div>
                    {message && (
                        <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <div className="profile-actions">
                        <button onClick={handleSave} disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon orange">
                            <span className="font-icon">notifications_active</span>
                        </div>
                        <h3 className="card-title">Notification Preferences</h3>
                    </div>
                    <div className="settings-list settings-list-sm">
                        <div className="settings-row">
                            <div className="settings-text">
                                <h4>Email Alerts</h4>
                                <p>Weekly summaries and reports</p>
                            </div>
                            <label className="toggle-switch">
                                <input defaultChecked className="toggle-input" type="checkbox" />
                                <div className="toggle-bg"></div>
                            </label>
                        </div>
                        <div className="settings-row">
                            <div className="settings-text">
                                <h4>Push Notifications</h4>
                                <p>Instant dose reminders</p>
                            </div>
                            <label className="toggle-switch">
                                <input defaultChecked className="toggle-input" type="checkbox" />
                                <div className="toggle-bg"></div>
                            </label>
                        </div>
                        <div className="pt-2">
                            <label className="form-label block mb-2">Reminder Timing</label>
                            <select className="form-select">
                                <option>24 hours before</option>
                                <option>2 days before</option>
                                <option>1 week before</option>
                            </select>
                        </div>
                        <div className="settings-row settings-row-divider">
                            <div className="settings-text">
                                <h4>Emergency Escalation</h4>
                                <p>Get alerts for overdue vaccines</p>
                            </div>
                            <label className="toggle-switch">
                                <input className="toggle-input" type="checkbox" />
                                <div className="toggle-bg secondary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon blue">
                            <span className="font-icon">language</span>
                        </div>
                        <h3 className="card-title">Language & Region</h3>
                    </div>
                    <div className="settings-list">
                        <div>
                            <label className="form-label block mb-2">Primary Language</label>
                            <select className="form-select">
                                <option>English (United States)</option>
                                <option>Hindi (India)</option>
                                <option>Spanish (Mexico)</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label block mb-2">Country / Region</label>
                            <select className="form-select">
                                <option>India</option>
                                <option>United States</option>
                                <option>United Kingdom</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label block mb-2">Date Format</label>
                            <div className="btn-group">
                                <button className="btn-group-item active">DD/MM/YYYY</button>
                                <button className="btn-group-item">MM/DD/YYYY</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon purple">
                            <span className="font-icon">palette</span>
                        </div>
                        <h3 className="card-title">Appearance Settings</h3>
                    </div>
                    <div className="settings-list settings-list-lg">
                        <div>
                            <p className="form-label block mb-3">Color Theme</p>
                            <div className="theme-grid">
                                <button 
                                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <span className="font-icon icon">light_mode</span>
                                    <span>Light</span>
                                </button>
                                <button 
                                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <span className="font-icon icon">dark_mode</span>
                                    <span>Dark</span>
                                </button>
                                <button 
                                    className={`theme-btn ${theme === 'auto' ? 'active' : ''}`}
                                    onClick={() => setTheme('auto')}
                                >
                                    <span className="font-icon icon">settings_brightness</span>
                                    <span>Auto</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="form-label block mb-3">Font Size</label>
                            <div className="btn-group">
                                <button 
                                    className={`btn-group-item ${fontSize === 'small' ? 'active' : ''}`}
                                    onClick={() => setFontSize('small')}
                                >Small</button>
                                <button 
                                    className={`btn-group-item ${fontSize === 'medium' ? 'active' : ''}`}
                                    onClick={() => setFontSize('medium')}
                                >Standard</button>
                                <button 
                                    className={`btn-group-item ${fontSize === 'large' ? 'active' : ''}`}
                                    onClick={() => setFontSize('large')}
                                >Large</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon green">
                            <span className="font-icon">security</span>
                        </div>
                        <h3 className="card-title">Account Security</h3>
                    </div>
                    <div className="settings-list settings-list-sm">
                        <button className="list-btn" onClick={() => setShowPasswordModal(true)}>
                            <div className="list-btn-content">
                                <span className="font-icon icon">lock</span>
                                <div className="list-btn-text">
                                    <h4>Change Account Password</h4>
                                    <p>Update your login credentials</p>
                                </div>
                            </div>
                            <span className="font-icon chevron">chevron_right</span>
                        </button>
                        <button className="list-btn">
                            <div className="list-btn-content">
                                <span className="font-icon icon">mail</span>
                                <div className="list-btn-text">
                                    <h4>Update Email Address</h4>
                                    <p>{userEmail || 'Loading...'}</p>
                                </div>
                            </div>
                            <span className="font-icon chevron">chevron_right</span>
                        </button>
                        <div className="list-item-highlight">
                            <div className="list-btn-content">
                                <span className="font-icon icon">verified_user</span>
                                <div className="list-btn-text">
                                    <h4>Two-Factor Auth</h4>
                                    <p>Highly Recommended</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input defaultChecked className="toggle-input" type="checkbox" />
                                <div className="toggle-bg"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon slate">
                            <span className="font-icon">shield</span>
                        </div>
                        <h3 className="card-title">Privacy & Data</h3>
                    </div>
                    <div className="settings-list settings-list-sm">
                        <div className="list-item-highlight">
                            <div className="list-btn-content">
                                <span className="font-icon icon">visibility_off</span>
                                <div className="list-btn-text">
                                    <h4>Private Account</h4>
                                    <p>Only you can see your data</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    className="toggle-input" 
                                    type="checkbox" 
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <div className="toggle-bg"></div>
                            </label>
                        </div>
                        <button className="list-btn">
                            <div className="list-btn-content">
                                <span className="font-icon icon">download</span>
                                <div className="list-btn-text">
                                    <h4>Export My Health Data</h4>
                                </div>
                            </div>
                            <span className="font-icon chevron">chevron_right</span>
                        </button>
                        <button className="list-btn danger">
                            <div className="list-btn-content">
                                <span className="font-icon icon">warning</span>
                                <h4>Delete Account</h4>
                            </div>
                            <span className="font-icon chevron">chevron_right</span>
                        </button>
                    </div>
                    <p className="privacy-text">
                        VaxiCare follows GDPR and local health privacy regulations. Your data is encrypted at rest and in transit.
                    </p>
                </div>

                <div className="profile-card">
                    <div className="card-header">
                        <div className="card-icon teal">
                            <span className="font-icon">contact_support</span>
                        </div>
                        <h3 className="card-title">Help & Support</h3>
                    </div>
                    <div className="action-grid">
                        <button className="action-card">
                            <span className="font-icon icon">help</span>
                            <span>FAQ</span>
                        </button>
                        <button className="action-card" onClick={() => window.location.href = 'mailto:support@vaxicare.com?subject=Support Request'}>
                            <span className="font-icon icon">chat_bubble</span>
                            <span>Support</span>
                        </button>
                        <button className="action-card">
                            <span className="font-icon icon">report</span>
                            <span>Report Issue</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="profile-footer-box" style={{ marginBottom: "1.5rem" }}>
                <div className="profile-footer-header">
                    <span className="font-icon icon-manage">family_home</span>
                    <h4>Manage Children</h4>
                </div>
                <p className="profile-footer-text">
                    Easily add new children and manage their profiles directly from the dashboard.
                </p>
                <Link to="/dashboard" className="btn-manage">
                    <span className="font-icon">dashboard</span>
                    <span>Go to Dashboard</span>
                </Link>
            </div>

            <div className="profile-footer-box">
                <div className="profile-footer-header">
                    <span className="font-icon icon">info</span>
                    <h4>VaxiCare v2.4.0</h4>
                </div>
                <p className="profile-footer-text">
                    Committed to a healthier tomorrow through digital immunization management.
                </p>
                <div className="profile-footer-links">
                    <a href="#">Terms of Service</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Vaccine Guide</a>
                </div>
            </div>

            <div className="profile-logout-section">
                <button className="btn-logout" onClick={handleLogout}>
                    <span className="font-icon">logout</span>
                    <span>Log Out of Account</span>
                </button>
            </div>
            
            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal-content">
                        <button className="vt-modal-close" onClick={() => setShowPasswordModal(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="vt-modal-title">Change Password</h2>
                        <form className="vt-modal-form" onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    required
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    required
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    required
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Profile;
