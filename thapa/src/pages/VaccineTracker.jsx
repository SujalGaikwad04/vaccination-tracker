import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VaccineTracker.css';
import { generateVaccineSchedule, calculateMilestones } from '../utils/vaccinationData';

const VaccineTracker = ({ activeChild, childProfiles, setChildProfiles }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSideNav, setActiveSideNav] = useState('overview');
    const navigate = useNavigate();

    const defaultChild = {
        name: 'Leo',
        age: '18 Months',
        gender: 'Male',
        dob: '12 Aug 2022',
        completedVaccines: 12,
        totalVaccines: 16,
        nextDueDate: '24 Nov',
        overallProgress: 75,
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIq8omTrv-rkbWebLfpz2buNOTfQhet_9v2_LidMKkn12sdd5KbM9qthUOWHfRgzNR5fZa8VrVH1oshekaMTfwoJT7oOlBhn7HdIzo9NN5X1bXuWqSrq-ju_e-UYQqB1RKfWB9o-cKOE5UHfk7S5qCG_ieTilvLSOaDLiomXBQs9BFD494XSJ4o6GqtzxGlgneZlJjiv-sBz0ieNobubYS8l0RTLDsKcQPAikD1UO27RkdkpWCxdNvKX7XpO7V6wz9YazsPw9Fxz8',
        parentAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGwt6xTt0UUu60XvmwYQNnb9Bdyp9u8BPjBiXvDdYE0SyGj6lXY2ugB9-CFWpD7geaYwkM8M8M4mQtVLD14PquywpqEX_tuLxjI1zGzpWgoNPk6aPr7zTAQG_NVXQIbQpxl1WtOGLNkJzZ57TB8LgG5avsrdb0HCNvHx167_5z7aUdsQgOTheT4Euo55fgeZ7kXAsEPG-dZVVlBhvLrWo5w4QxkBPzpD9XlP8GjoqdOkAgb4eJ4hCxO5Wwr8NdLKOPx6wWbA9w6h0',
    };

    const childData = activeChild ? {
        ...defaultChild,
        name: activeChild.name,
        age: activeChild.dob ? 'Infant' : 'Newborn', // Simplified calculating age for demo
        gender: activeChild.gender || defaultChild.gender,
        dob: activeChild.dob || defaultChild.dob,
        completedVaccines: activeChild.vaccines ? activeChild.vaccines.filter(v => v.status === 'done').length : 0,
        totalVaccines: activeChild.vaccines ? activeChild.vaccines.length : 16,
        nextDueDate: activeChild.vaccines ?
            (activeChild.vaccines.find(v => v.status === 'due' || v.status === 'upcoming')?.dueDate ?
                new Date(activeChild.vaccines.find(v => v.status === 'due' || v.status === 'upcoming').dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None'
            ) : defaultChild.nextDueDate,
        overallProgress: activeChild.vaccines ? Math.round((activeChild.vaccines.filter(v => v.status === 'done').length / activeChild.vaccines.length) * 100) || 0 : (activeChild.progress || 0),
        avatarUrl: activeChild.avatarUrl || `https://ui-avatars.com/api/?name=${activeChild.name}&background=${(activeChild.gender && (activeChild.gender.toLowerCase() === 'male' || activeChild.gender.toLowerCase() === 'boy')) ? 'C4D9FF' : (activeChild.gender && (activeChild.gender.toLowerCase() === 'female' || activeChild.gender.toLowerCase() === 'girl')) ? 'F5AFAF' : 'ec5b13'}&color=fff&size=128&rounded=false`
    } : defaultChild;

    const [fallbackVaccines, setFallbackVaccines] = useState([
        {
            id: 'dummy-1',
            name: 'DTP',
            dose: '4th Dose',
            recommendedAge: '15-18 Months',
            dueDate: '12 Oct 2023',
            status: 'missed',
            action: 'recovery',
        },
        {
            id: 'dummy-2',
            name: 'MMR',
            dose: '1st Dose',
            recommendedAge: '12-15 Months',
            dueDate: '24 Nov 2023',
            status: 'upcoming',
            action: 'mark-done',
        },
        {
            id: 'dummy-3',
            name: 'Hepatitis B',
            dose: '3rd Dose',
            recommendedAge: '6-18 Months',
            dueDate: '04 Sep 2023',
            status: 'done',
            action: 'view-details',
            hospitalName: 'City Hospital',
            doctorName: 'Dr. Smith',
            dateAdministered: '2023-09-04',
            notes: 'Fever next day, given paracetamol'
        },
    ]);

    const vaccines = activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.map(v => ({
        id: v.id,
        name: v.name,
        dose: v.fullForm || v.when, // Fallback dose string if fullForm is undefined
        recommendedAge: v.when,
        dueDate: new Date(v.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        hospitalName: v.hospitalName,
        doctorName: v.doctorName,
        notes: v.notes,
        proofUrl: v.proofUrl,
        dateAdministered: v.dateAdministered,
        status: v.status === 'due' ? 'upcoming' : v.status, // simplifying exact due to upcoming for filter
        action: v.status === 'done' ? 'view-details' : (v.status === 'missed' ? 'recovery' : 'mark-done'),
    })) : fallbackVaccines;

    const [markDoneModal, setMarkDoneModal] = useState({ show: false, vaccine: null });
    const [viewDetailsModal, setViewDetailsModal] = useState({ show: false, vaccine: null });
    const [showClinicsModal, setShowClinicsModal] = useState(false);
    const [clinicsData, setClinicsData] = useState({
        list: [],
        loading: false,
        error: null,
        locationFetched: false,
        selectedClinic: null
    });

    const fetchNearbyClinics = () => {
        if (!navigator.geolocation) {
            setClinicsData(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        setClinicsData(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`http://localhost:5000/api/nearby-clinics?lat=${latitude}&lng=${longitude}`);
                    const data = await response.json();
                    if (data.success) {
                        // Sort by distance numerically
                        const sortedClinics = (data.clinics || []).sort((a, b) => {
                            return parseFloat(a.distance) - parseFloat(b.distance);
                        });
                        
                        setClinicsData({
                            list: sortedClinics,
                            loading: false,
                            error: null,
                            locationFetched: true,
                            selectedClinic: sortedClinics[0] // Default to nearest
                        });
                    } else {
                        throw new Error(data.error || 'Failed to fetch clinics');
                    }
                } catch (err) {
                    setClinicsData(prev => ({ ...prev, loading: false, error: err.message }));
                }
            },
            (err) => {
                let msg = 'Could not get your location';
                if (err.code === 1) msg = 'Location permission denied. Please enable it to find nearby clinics.';
                setClinicsData(prev => ({ ...prev, loading: false, error: msg }));
            },
            { timeout: 10000 }
        );
    };

    // No hardcoded clinics anymore - only real data
    const milestones = childData.dob && activeChild.dob ? calculateMilestones(activeChild.dob) : [
        { age: '6 Months', label: 'Sitting Unassisted', type: 'completed', icon: 'check' },
        { age: '12 Months', label: 'First Steps Taken', type: 'completed', icon: 'check' },
        { age: 'Current (18m)', label: 'Vocabulary Growth', type: 'current', icon: 'child_care' },
        { age: '24 Months', label: 'Potty Training Ready', type: 'future', icon: 'flag' },
    ];

    const filters = [
        { key: 'all', label: 'All Vaccines' },
        { key: 'upcoming', label: 'Upcoming', dotClass: 'amber' },
        { key: 'completed', label: 'Completed', dotClass: 'emerald' },
        { key: 'missed', label: 'Missed', dotClass: 'rose' },
    ];

    const filteredVaccines = activeFilter === 'all'
        ? vaccines
        : vaccines.filter(v => v.status === activeFilter || (activeFilter === 'completed' && v.status === 'done'));

    const getStatusLabel = (status) => {
        switch (status) {
            case 'missed': return 'Missed';
            case 'upcoming': return 'Upcoming';
            case 'done': return 'Done';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'missed': return 'rose';
            case 'upcoming': return 'amber';
            case 'done': return 'emerald';
            default: return '';
        }
    };

    // Progress ring math (SVG viewBox 0 0 100 100, r=42)
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ~263.89
    const offset = circumference - (childData.overallProgress / 100) * circumference;

    const [processingId, setProcessingId] = useState(null);

    const handleMarkDone = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const vaccineId = markDoneModal.vaccine.id;
        const submitData = {
            status: 'done',
            dateAdministered: formData.get('dateAdministered'),
            hospitalName: formData.get('hospitalName'),
            doctorName: formData.get('doctorName'),
            notes: formData.get('notes'),
            proofUrl: formData.get('proofUrl'),
        };

        if (!vaccineId) return;

        if (!activeChild) {
            setProcessingId(vaccineId);
            setTimeout(() => {
                setFallbackVaccines(prev => prev.map(v => 
                    v.id === vaccineId ? { ...v, ...submitData, action: 'view-details' } : v
                ));
                setProcessingId(null);
                setMarkDoneModal({ show: false, vaccine: null });
            }, 600);
            return;
        }

        setProcessingId(vaccineId);
        try {
            const token = localStorage.getItem('token');
            const today = submitData.dateAdministered || new Date().toISOString().split('T')[0];

            const response = await fetch(`http://localhost:5000/api/vaccines/${vaccineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                if (childProfiles && setChildProfiles) {
                    const updatedProfiles = childProfiles.map(child => {
                        if (child.id === activeChild.id) {
                            const updatedVaccines = child.vaccines.map(vac =>
                                vac.id === vaccineId
                                    ? { ...vac, ...submitData, dueDate: today }
                                    : vac
                            );

                            const completed = updatedVaccines.filter(v => v.status === 'done').length;
                            const upcoming = updatedVaccines.filter(v => v.status === 'upcoming' || v.status === 'due').length;
                            const missed = updatedVaccines.filter(v => v.status === 'missed').length;
                            const progress = updatedVaccines.length > 0 ? Math.round((completed / updatedVaccines.length) * 100) : 0;

                            return { ...child, vaccines: updatedVaccines, completed, upcoming, missed, progress };
                        }
                        return child;
                    });
                    setChildProfiles(updatedProfiles);
                }
                setMarkDoneModal({ show: false, vaccine: null });
            } else {
                console.error('Failed to update vaccine status');
            }
        } catch (err) {
            console.error('Error marking vaccine as done:', err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleUndoMarkDone = async (vaccineId, vaccineName) => {
        if (!vaccineId) return;

        if (!activeChild) {
            // Mock undo for dummy data
            setProcessingId(vaccineId);
            setTimeout(() => {
                setFallbackVaccines(prev => prev.map(v => 
                    v.id === vaccineId ? { ...v, status: 'upcoming', action: 'mark-done' } : v
                ));
                setProcessingId(null);
            }, 600);
            return;
        }

        setProcessingId(vaccineId);
        try {
            const token = localStorage.getItem('token');
            let targetStatus = 'upcoming';
            let targetDueDate = null;

            if (activeChild.dob) {
                const originalSchedule = generateVaccineSchedule(activeChild.dob);
                const originalVaccine = originalSchedule.find(v => v.name === vaccineName);
                if (originalVaccine) {
                    targetStatus = originalVaccine.status;
                    targetDueDate = originalVaccine.dueDate;
                }
            }

            const response = await fetch(`http://localhost:5000/api/vaccines/${vaccineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: targetStatus, dueDate: targetDueDate })
            });

            if (response.ok) {
                if (childProfiles && setChildProfiles) {
                    const updatedProfiles = childProfiles.map(child => {
                        if (child.id === activeChild.id) {
                            const updatedVaccines = child.vaccines.map(vac =>
                                vac.id === vaccineId
                                    ? { ...vac, status: targetStatus, dueDate: targetDueDate || vac.dueDate }
                                    : vac
                            );

                            const completed = updatedVaccines.filter(v => v.status === 'done').length;
                            const upcoming = updatedVaccines.filter(v => v.status === 'upcoming' || v.status === 'due').length;
                            const missed = updatedVaccines.filter(v => v.status === 'missed').length;
                            const progress = updatedVaccines.length > 0 ? Math.round((completed / updatedVaccines.length) * 100) : 0;

                            return { ...child, vaccines: updatedVaccines, completed, upcoming, missed, progress };
                        }
                        return child;
                    });
                    setChildProfiles(updatedProfiles);
                }
            } else {
                console.error('Failed to undo vaccine status');
            }
        } catch (err) {
            console.error('Error undoing vaccine status:', err);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <>
            <div className="vt-page">
                {/* ===== LEFT SIDEBAR ===== */}
                <aside className="vt-sidebar">
                    <div className="vt-profile-card">
                        <div className="vt-profile-top">
                            <div className="vt-profile-avatar">
                                <img src={childData.avatarUrl} alt={childData.name} />
                            </div>
                            <h2 className="vt-profile-name">{childData.name}</h2>
                            <span className="vt-age-badge">{childData.age}</span>
                        </div>

                        <div className="vt-profile-details">
                            <div className="vt-detail-row">
                                <span className="vt-detail-label">Gender</span>
                                <span className="vt-detail-value">{childData.gender}</span>
                            </div>
                            <div className="vt-dob-section">
                                <div className="vt-detail-row">
                                    <span className="vt-detail-label">DOB</span>
                                    <span className="vt-detail-value">{childData.dob}</span>
                                </div>
                                <div className="vt-progress-track">
                                    <div className="vt-progress-fill" style={{ width: `${childData.overallProgress}%` }}></div>
                                </div>
                                <p className="vt-progress-hint">Progress toward next milestone</p>
                            </div>
                        </div>

                        <div className="vt-profile-nav">
                            <nav>
                                <button
                                    className={`vt-nav-link ${activeSideNav === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveSideNav('overview')}
                                >
                                    <span className="material-symbols-outlined">analytics</span>
                                    Overview
                                </button>
                                <button
                                    className={`vt-nav-link ${activeSideNav === 'records' ? 'active' : ''}`}
                                    onClick={() => setActiveSideNav('records')}
                                >
                                    <span className="material-symbols-outlined">description</span>
                                    Health Records
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="vt-resources">
                        <h4 className="vt-resources-label">Resources</h4>
                        <div 
                            className="vt-resource-card clickable" 
                            onClick={() => navigate('/awareness')}
                        >
                            <div className="vt-resource-icon blue">
                                <span className="material-symbols-outlined">help</span>
                            </div>
                            <p className="vt-resource-text">Vaccination FAQ</p>
                        </div>
                        <div 
                            className="vt-resource-card clickable" 
                            onClick={() => {
                                setShowClinicsModal(true);
                                if (!clinicsData.locationFetched) fetchNearbyClinics();
                            }}
                        >
                            <div className="vt-resource-icon teal">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            <p className="vt-resource-text">Nearby Clinic</p>
                        </div>
                    </div>
                </aside>

                {/* ===== MAIN CONTENT ===== */}
                <main className="vt-main">
                    {activeSideNav === 'overview' ? (
                        <>
                            {/* Header Card: Stats + Progress Ring */}
                            <div className="vt-header-card">
                                <div className="vt-header-info">
                                    <h1 className="vt-page-title">Vaccination Tracker</h1>
                                    <p className="vt-page-desc">
                                        Track {childData.name}'s immunization progress and keep up with his upcoming health milestones.
                                    </p>
                                    <div className="vt-stats-row">
                                        <div className="vt-stat-box">
                                            <span className="vt-stat-label">Completed</span>
                                            <span className="vt-stat-value">
                                                {childData.completedVaccines} / {childData.totalVaccines}
                                            </span>
                                        </div>
                                        <div className="vt-stat-box">
                                            <span className="vt-stat-label">Next Due</span>
                                            <span className="vt-stat-value orange">{childData.nextDueDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="vt-ring-area">
                                    <div className="vt-ring-wrapper">
                                        <svg viewBox="0 0 100 100">
                                            <circle className="vt-ring-bg" cx="50" cy="50" r={radius} />
                                            <circle
                                                className="vt-ring-progress progress-ring__circle"
                                                cx="50"
                                                cy="50"
                                                r={radius}
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                            />
                                        </svg>
                                        <div className="vt-ring-center">
                                            <span className="vt-ring-percent">{childData.overallProgress}%</span>
                                        </div>
                                    </div>
                                    <p className="vt-ring-label">Overall Progress</p>
                                </div>
                            </div>

                            {/* Filter Tabs + Table */}
                            <div className="vt-filters-section">
                                <div className="vt-filter-row">
                                    {filters.map(f => (
                                        <button
                                            key={f.key}
                                            className={`vt-filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                                            onClick={() => setActiveFilter(f.key)}
                                        >
                                            {f.dotClass && <span className={`vt-dot ${f.dotClass}`}></span>}
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="vt-table-card">
                                    <div className="vt-table-scroll">
                                        <table className="vt-table">
                                            <thead>
                                                <tr>
                                                    <th>Vaccine Name</th>
                                                    <th>Recommended Age</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVaccines.map((v, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <button
                                                                onClick={() => navigate(`/vaccine-info/${v.name}`)}
                                                                title="Click to learn more"
                                                                className="vt-cell-name-btn"
                                                            >
                                                                <div className="vt-cell-name-wrapper">
                                                                    <span className="vt-cell-name">{v.name}</span>
                                                                    <span className="material-symbols-outlined vt-info-icon">info</span>
                                                                </div>
                                                                <div className="vt-cell-dose">{v.dose}</div>
                                                            </button>
                                                        </td>
                                                        <td className="vt-cell-text">{v.recommendedAge}</td>
                                                        <td className="vt-cell-text medium">{v.dueDate}</td>
                                                        <td>
                                                            <span className={`vt-status-badge ${getStatusColor(v.status)}`}>
                                                                <span className="vt-status-dot"></span>
                                                                {getStatusLabel(v.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {v.action === 'recovery' && (
                                                                <button className="vt-btn-recovery">Recovery Plan</button>
                                                            )}
                                                            {v.action === 'mark-done' && (
                                                                <button
                                                                    className="vt-btn-mark-done"
                                                                    onClick={() => setMarkDoneModal({ show: true, vaccine: v })}
                                                                    disabled={processingId === v.id}
                                                                >
                                                                    {processingId === v.id ? 'Updating...' : 'Mark Done'}
                                                                </button>
                                                            )}
                                                            {v.action === 'view-details' && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <button 
                                                                        className="vt-btn-view"
                                                                        onClick={() => setViewDetailsModal({ show: true, vaccine: v })}
                                                                    >
                                                                        View Details
                                                                        <span className="material-symbols-outlined">chevron_right</span>
                                                                    </button>
                                                                    <button
                                                                        className="vt-btn-undo"
                                                                        onClick={() => handleUndoMarkDone(v.id, v.name)}
                                                                        disabled={processingId === v.id}
                                                                        title="Undo Mark Done"
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                                                    >
                                                                        <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '20px' }}>undo</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom: Timeline + Tip */}
                            <div className="vt-bottom-grid">
                                {/* Developmental Timeline */}
                                <div className="vt-timeline-card">
                                    <div className="vt-timeline-header">
                                        <h3 className="vt-timeline-title">
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            {childData.name}'s Developmental Timeline
                                        </h3>
                                        <span className="vt-timeline-hint">Swipe to explore</span>
                                    </div>

                                    <div className="vt-steps">
                                        {milestones.map((m, i) => (
                                            <div className="vt-step" key={i}>
                                                {i < milestones.length - 1 && (
                                                    <div className={`vt-step-connector ${m.type === 'completed' ? 'completed' : 'pending'}`}></div>
                                                )}
                                                <div className={`vt-step-circle ${m.type}`}>
                                                    <span className="material-symbols-outlined">{m.icon}</span>
                                                </div>
                                                <p className={`vt-step-age ${m.type === 'current' ? 'active' : 'default'}`}>{m.age}</p>
                                                <p className={`vt-step-text ${m.type === 'current' ? 'bold' :
                                                    m.type === 'future' ? 'muted' : 'default'
                                                    }`}>
                                                    {m.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Parenting Tip */}
                                <div className="vt-tip-card">
                                    <div className="vt-tip-inner">
                                        <div className="vt-tip-top">
                                            <div className="vt-tip-icon-box">
                                                <span className="material-symbols-outlined">emoji_objects</span>
                                            </div>
                                            <span className="vt-tip-age-badge">Age 18m Tip</span>
                                        </div>
                                        <h4 className="vt-tip-title">Parenting Tip of the Week</h4>
                                        <p className="vt-tip-text">
                                            At 18 months, {childData.name} is likely becoming more independent. Try offering
                                            limited choices ("Do you want the blue shirt or the red one?") to foster autonomy
                                            while maintaining boundaries. This age is also crucial for the MMR booster—ensure
                                            his hydration is high post-vaccination.
                                        </p>
                                    </div>

                                    <div className="vt-tip-footer">
                                        <a href="#" className="vt-tip-link">
                                            Explore Development Guide
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </a>
                                        <div className="vt-tip-avatars">
                                            <div className="vt-tip-avatar-img">
                                                <img src={childData.parentAvatarUrl} alt="User" />
                                            </div>
                                            <div className="vt-tip-avatar-count">+12k</div>
                                        </div>
                                    </div>

                                    <div className="vt-tip-bg-icon">
                                        <span className="material-symbols-outlined">family_restroom</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ===== HEALTH RECORDS VIEW ===== */
                        <div className="vt-records-view">
                            <div className="vt-records-header">
                                <div>
                                    <h1 className="vt-page-title">Health Records</h1>
                                    <p className="vt-page-desc">Complete medical history and immunization logs for {childData.name}.</p>
                                </div>
                                <button className="vt-btn-download-record" onClick={() => navigate('/digital-card')}>
                                    <span className="material-symbols-outlined">verified</span>
                                    View Digital Card
                                </button>
                            </div>

                            <div className="vt-records-grid">
                                {vaccines.filter(v => v.status === 'done').length > 0 ? (
                                    vaccines.filter(v => v.status === 'done').map((v, i) => (
                                        <div key={i} className="vt-record-card">
                                            <div className="vt-record-card-header">
                                                <div className="vt-record-icon">
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </div>
                                                <div>
                                                    <h3 className="vt-record-name">{v.name}</h3>
                                                    <p className="vt-record-date">Administered on: {v.dateAdministered || v.dueDate}</p>
                                                </div>
                                            </div>
                                            <div className="vt-record-body">
                                                <div className="vt-record-info-item">
                                                    <span className="vt-record-label">Hospital</span>
                                                    <span className="vt-record-value">{v.hospitalName || 'Not specified'}</span>
                                                </div>
                                                <div className="vt-record-info-item">
                                                    <span className="vt-record-label">Doctor</span>
                                                    <span className="vt-record-value">{v.doctorName || 'Not specified'}</span>
                                                </div>
                                                <div className="vt-record-info-item full">
                                                    <span className="vt-record-label">Notes</span>
                                                    <p className="vt-record-notes">{v.notes || 'No notes available for this record.'}</p>
                                                </div>
                                            </div>
                                            {v.proofUrl && (
                                                <div className="vt-record-footer">
                                                    <a href={v.proofUrl} target="_blank" rel="noreferrer" className="vt-record-link">
                                                        <span className="material-symbols-outlined">attachment</span>
                                                        View Proof
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="vt-no-records">
                                        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1' }}>history_edu</span>
                                        <h3>No Records Found</h3>
                                        <p>Complete a vaccination and mark it as done to see it in your health records.</p>
                                        <button className="vt-btn-view" onClick={() => setActiveSideNav('overview')} style={{ marginTop: '16px' }}>
                                            Go to Overview
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom: Timeline + Tip (Always visible) */}
                    <div className="vt-bottom-grid">
                        {/* Developmental Timeline */}
                        <div className="vt-timeline-card">
                            <div className="vt-timeline-header">
                                <h3 className="vt-timeline-title">
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    {childData.name}'s Developmental Timeline
                                </h3>
                                <span className="vt-timeline-hint">Swipe to explore</span>
                            </div>

                            <div className="vt-steps">
                                {milestones.map((m, i) => (
                                    <div className="vt-step" key={i}>
                                        {i < milestones.length - 1 && (
                                            <div className={`vt-step-connector ${m.type === 'completed' ? 'completed' : 'pending'}`}></div>
                                        )}
                                        <div className={`vt-step-circle ${m.type}`}>
                                            <span className="material-symbols-outlined">{m.icon}</span>
                                        </div>
                                        <p className={`vt-step-age ${m.type === 'current' ? 'active' : 'default'}`}>{m.age}</p>
                                        <p className={`vt-step-text ${m.type === 'current' ? 'bold' :
                                            m.type === 'future' ? 'muted' : 'default'
                                            }`}>
                                            {m.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Parenting Tip */}
                        <div className="vt-tip-card">
                            <div className="vt-tip-inner">
                                <div className="vt-tip-top">
                                    <div className="vt-tip-icon-box">
                                        <span className="material-symbols-outlined">emoji_objects</span>
                                    </div>
                                    <span className="vt-tip-age-badge">Age 18m Tip</span>
                                </div>
                                <h4 className="vt-tip-title">Parenting Tip of the Week</h4>
                                <p className="vt-tip-text">
                                    At 18 months, {childData.name} is likely becoming more independent. Try offering
                                    limited choices ("Do you want the blue shirt or the red one?") to foster autonomy
                                    while maintaining boundaries. This age is also crucial for the MMR booster—ensure
                                    his hydration is high post-vaccination.
                                </p>
                            </div>

                            <div className="vt-tip-footer">
                                <a href="#" className="vt-tip-link">
                                    Explore Development Guide
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </a>
                                <div className="vt-tip-avatars">
                                    <div className="vt-tip-avatar-img">
                                        <img src={childData.parentAvatarUrl} alt="User" />
                                    </div>
                                    <div className="vt-tip-avatar-count">+12k</div>
                                </div>
                            </div>

                            <div className="vt-tip-bg-icon">
                                <span className="material-symbols-outlined">family_restroom</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer - outside the grid for full width */}
            <footer className="vt-footer">
                <div className="vt-footer-inner">
                    <div className="vt-footer-brand">
                        <div className="vt-footer-logo">
                            <span className="material-symbols-outlined">vaccines</span>
                        </div>
                        <span className="vt-footer-brand-text">VaxiCare</span>
                    </div>
                    <div className="vt-footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Help Center</a>
                    </div>
                    <p className="vt-footer-copy">© 2024 VaxiCare Vaccination Services</p>
                </div>
            </footer>

            {/* Mark Done Modal */}
            {markDoneModal.show && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal-content">
                        <button className="vt-modal-close" onClick={() => setMarkDoneModal({ show: false, vaccine: null })}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="vt-modal-title">Mark "{markDoneModal.vaccine?.name}" as Done</h2>
                        <form className="vt-modal-form" onSubmit={handleMarkDone}>
                            <div className="vt-form-group">
                                <label>Date Administered <span style={{ color: "red" }}>*</span></label>
                                <input type="date" name="dateAdministered" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="vt-form-group">
                                <label>Hospital / Clinic Name</label>
                                <input type="text" name="hospitalName" placeholder="e.g. City General Hospital" />
                            </div>
                            <div className="vt-form-group">
                                <label>Doctor Name</label>
                                <input type="text" name="doctorName" placeholder="e.g. Dr. Sarah" />
                            </div>
                            <div className="vt-form-group">
                                <label>Upload Hospital Slip (Proof)</label>
                                <input type="file" name="proofFile" accept="image/*, .pdf" onChange={(e) => {
                                    // For Hackathon, quickly simulate upload by converting to local object URL
                                    if(e.target.files?.[0]){
                                        const url = URL.createObjectURL(e.target.files[0]);
                                        // We sneak this into a hidden input to easily grab it in formData
                                        document.getElementById('proofUrlInput').value = url;
                                    }
                                }} />
                                <input type="hidden" name="proofUrl" id="proofUrlInput" />
                            </div>
                            <div className="vt-form-group">
                                <label>Notes</label>
                                <textarea name="notes" placeholder="Any side effects or notes..." rows="3"></textarea>
                            </div>
                            <button type="submit" className="vt-btn-modal-submit" disabled={processingId === markDoneModal.vaccine.id}>
                                {processingId === markDoneModal.vaccine.id ? 'Saving...' : 'Save Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Nearby Clinics Modal */}
            {showClinicsModal && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal-content clinics-modal">
                        <button className="vt-modal-close" onClick={() => setShowClinicsModal(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="vt-clinics-header">
                            <span className="material-symbols-outlined teal" style={{fontSize: '48px'}}>medical_services</span>
                            <h2 className="vt-modal-title">Nearby Vaccination Clinics</h2>
                            {clinicsData.loading ? (
                                <p style={{color: '#64748b'}}>Fetching your location and finding best clinics...</p>
                            ) : (
                                <p style={{color: '#64748b'}}>
                                    {clinicsData.list.length > 0 
                                        ? `Found ${clinicsData.list.length} verified centers near you.`
                                        : 'Find the nearest healthcare facilities for your child.'}
                                </p>
                            )}
                        </div>
                        
                        <div className="vt-clinics-list">
                            {clinicsData.loading && (
                                <div className="vt-clinics-loading">
                                    <div className="vt-spinner"></div>
                                    <p>Searching for centers...</p>
                                </div>
                            )}

                            {clinicsData.error && (
                                <div className="vt-clinics-error">
                                    <span className="material-symbols-outlined">location_off</span>
                                    <p>{clinicsData.error}</p>
                                    <button onClick={fetchNearbyClinics} className="vt-btn-retry">Retry Search</button>
                                </div>
                            )}

                            {!clinicsData.loading && !clinicsData.error && clinicsData.list.length > 0 && (
                                clinicsData.list.map((clinic, i) => {
                                    return (
                                        <div 
                                            key={i} 
                                            className={`vt-clinic-item ${i < 3 ? 'highlight' : ''} ${i === 0 ? 'nearest' : ''} ${clinicsData.selectedClinic?.name === clinic.name ? 'active' : ''}`}
                                            onClick={() => setClinicsData(prev => ({ ...prev, selectedClinic: clinic }))}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {i === 0 && <span className="vt-nearest-badge">Nearest</span>}
                                            <div className="vt-clinic-info">
                                                <div className="vt-clinic-title-row">
                                                    <h4>{clinic.name}</h4>
                                                </div>
                                                <p className="vt-clinic-address">
                                                    <span className="vt-type-pill">{clinic.type}</span>
                                                    {clinic.address}
                                                </p>
                                                <div className="vt-clinic-meta">
                                                    <span className="vt-clinic-distance">
                                                        <span className="material-symbols-outlined">distance</span>
                                                        {clinic.distance}
                                                    </span>
                                                    <span className="vt-clinic-rating">
                                                        <span className="material-symbols-outlined">star</span>
                                                        {clinic.rating}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="vt-clinic-actions">
                                                <a href={clinic.dirUrl} target="_blank" rel="noreferrer" className="vt-clinic-btn icon" title="Get Directions">
                                                    <span className="material-symbols-outlined">directions</span>
                                                </a>
                                                <a href={clinic.mapUrl} target="_blank" rel="noreferrer" className="vt-clinic-btn primary">
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {!clinicsData.loading && !clinicsData.error && clinicsData.locationFetched && clinicsData.list.length === 0 && (
                                <div className="vt-clinics-empty">
                                    <span className="material-symbols-outlined">search_off</span>
                                    <p>No nearby hospitals found. Try increasing search range.</p>
                                </div>
                            )}
                        </div>

                        {/* Interactive Map View */}
                        {!clinicsData.loading && clinicsData.selectedClinic && (
                            <div className="vt-clinics-map-container">
                                <iframe
                                    title="Clinic Location"
                                    width="100%"
                                    height="250"
                                    style={{ border: 0, borderRadius: '12px' }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(clinicsData.selectedClinic.name + ' ' + clinicsData.selectedClinic.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                ></iframe>
                            </div>
                        )}

                        {!clinicsData.loading && (
                            <div className="vt-clinics-footer">
                                <button 
                                    className="vt-btn-view" 
                                    style={{width: '100%', justifyContent: 'center'}}
                                    onClick={() => window.open('https://www.google.com/maps/search/vaccination+clinic+near+me', '_blank')}
                                >
                                    <span className="material-symbols-outlined">map</span>
                                    Explore on Google Maps
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default VaccineTracker;
