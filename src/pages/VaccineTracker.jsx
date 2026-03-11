import React, { useState } from 'react';
import './VaccineTracker.css';
import { generateVaccineSchedule, calculateMilestones } from '../utils/vaccinationData';

const VaccineTracker = ({ activeChild, childProfiles, setChildProfiles }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSideNav, setActiveSideNav] = useState('overview');

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

    const vaccines = activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.map(v => ({
        id: v.id,
        name: v.name,
        dose: v.fullForm || v.when, // Fallback dose string if fullForm is undefined
        recommendedAge: v.when,
        dueDate: new Date(v.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: v.status === 'due' ? 'upcoming' : v.status, // simplifying exact due to upcoming for filter
        action: v.status === 'done' ? 'view-details' : (v.status === 'missed' ? 'recovery' : 'mark-done'),
    })) : [
        {
            id: 1,
            name: 'DTP',
            dose: '4th Dose',
            recommendedAge: '15-18 Months',
            dueDate: '12 Oct 2023',
            status: 'missed',
            action: 'recovery',
        },
        {
            name: 'MMR',
            dose: '1st Dose',
            recommendedAge: '12-15 Months',
            dueDate: '24 Nov 2023',
            status: 'upcoming',
            action: 'mark-done',
        },
        {
            name: 'Hepatitis B',
            dose: '3rd Dose',
            recommendedAge: '6-18 Months',
            dueDate: '04 Sep 2023',
            status: 'done',
            action: 'view-details',
        },
    ];

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

    const handleMarkDone = async (vaccineId) => {
        if (!activeChild || !vaccineId) return;

        setProcessingId(vaccineId);
        try {
            const token = localStorage.getItem('token');
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch(`http://localhost:5000/api/vaccines/${vaccineId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'done', dateAdministered: today })
            });

            if (response.ok) {
                // To reflect locally without a full network fetch again immediately
                if (childProfiles && setChildProfiles) {
                    const updatedProfiles = childProfiles.map(child => {
                        if (child.id === activeChild.id) {
                            const updatedVaccines = child.vaccines.map(vac =>
                                vac.id === vaccineId
                                    ? { ...vac, status: 'done', dueDate: today }
                                    : vac
                            );

                            const completed = updatedVaccines.filter(v => v.status === 'done').length;
                            const progress = updatedVaccines.length > 0 ? Math.round((completed / updatedVaccines.length) * 100) : 0;

                            return { ...child, vaccines: updatedVaccines, completed, progress };
                        }
                        return child;
                    });
                    setChildProfiles(updatedProfiles);
                }
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
        if (!activeChild || !vaccineId) return;

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
                            const progress = updatedVaccines.length > 0 ? Math.round((completed / updatedVaccines.length) * 100) : 0;

                            return { ...child, vaccines: updatedVaccines, completed, progress };
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
                        <div className="vt-resource-card">
                            <div className="vt-resource-icon blue">
                                <span className="material-symbols-outlined">help</span>
                            </div>
                            <p className="vt-resource-text">Vaccination FAQ</p>
                        </div>
                        <div className="vt-resource-card">
                            <div className="vt-resource-icon teal">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            <p className="vt-resource-text">Nearby Clinic</p>
                        </div>
                    </div>
                </aside>

                {/* ===== MAIN CONTENT ===== */}
                <main className="vt-main">
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
                                                    <div className="vt-cell-name">{v.name}</div>
                                                    <div className="vt-cell-dose">{v.dose}</div>
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
                                                            onClick={() => handleMarkDone(v.id)}
                                                            disabled={processingId === v.id}
                                                        >
                                                            {processingId === v.id ? 'Updating...' : 'Mark Done'}
                                                        </button>
                                                    )}
                                                    {v.action === 'view-details' && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button className="vt-btn-view">
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
        </>
    );
};

export default VaccineTracker;
