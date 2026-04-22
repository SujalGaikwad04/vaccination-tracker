import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './DigitalCard.css';

const DigitalCard = ({ activeChild }) => {
    const defaultData = {
        fullName: 'Aarav Sharma',
        dob: 'May 12, 2021',
        ageGender: '2 Years • Male',
        bloodGroup: 'O Positive (O+)',
        guardian: 'Priya Sharma',
        certificateNo: '#VC-2023-8842',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIq8omTrv-rkbWebLfpz2buNOTfQhet_9v2_LidMKkn12sdd5KbM9qthUOWHfRgzNR5fZa8VrVH1oshekaMTfwoJT7oOlBhn7HdIzo9NN5X1bXuWqSrq-ju_e-UYQqB1RKfWB9o-cKOE5UHfk7S5qCG_ieTilvLSOaDLiomXBQs9BFD494XSJ4o6GqtzxGlgneZlJjiv-sBz0ieNobubYS8l0RTLDsKcQPAikD1UO27RkdkpWCxdNvKX7XpO7V6wz9YazsPw9Fxz8',
    };

    const childData = activeChild ? {
        ...defaultData,
        fullName: activeChild.name,
        dob: activeChild.dob || defaultData.dob,
        ageGender: `Infant • ${activeChild.gender || 'Male'}`,
        bloodGroup: activeChild.bloodGroup || defaultData.bloodGroup,
        avatarUrl: activeChild.avatarUrl || `https://ui-avatars.com/api/?name=${activeChild.name}&background=0D8ABC&color=fff&size=128&rounded=false`,
    } : defaultData;

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `${childData.fullName}_Vaccination_Record`,
    });

    const vaccines = activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.map(v => ({
        name: v.name,
        dot: v.status === 'done' ? 'green' : (v.status === 'due' || v.status === 'upcoming' ? 'blue' : 'red'), // red for missed
        dateGiven: v.status === 'done' ? new Date(v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--/--/----',
        nextDue: v.status === 'done' ? 'COMPLETED' : new Date(v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        nextDueType: v.status === 'done' ? 'completed' : (v.status === 'missed' ? 'overdue' : 'pending'), // ensure styling matches overdue/pending/completed
        administeredBy: v.status === 'done' ? 'Authorized Clinic' : '-',
        batchNo: v.status === 'done' ? 'VC-' + Math.floor(Math.random() * 90000 + 10000) : '-',
    })) : [
        {
            name: 'BCG',
            dot: 'green',
            dateGiven: '15/05/2021',
            nextDue: 'COMPLETED',
            nextDueType: 'completed',
            administeredBy: 'City Health Center',
            batchNo: 'B1234-AX',
        },
        {
            name: 'HepB 1',
            dot: 'green',
            dateGiven: '15/05/2021',
            nextDue: 'COMPLETED',
            nextDueType: 'completed',
            administeredBy: 'City Health Center',
            batchNo: 'H5678-BY',
        },
        {
            name: 'DTP 1',
            dot: 'blue',
            dateGiven: '15/07/2021',
            nextDue: '20/08/2021',
            nextDueType: 'pending',
            administeredBy: 'Wellness Clinic',
            batchNo: 'D9012-CZ',
        },
    ];

    return (
        <>
            <div className="dc-wrapper">
                {/* Breadcrumb */}
                <nav className="dc-breadcrumb">
                    <a href="/dashboard">Dashboard</a>
                    <span className="bc-sep">›</span>
                    <a href="#">{childData.fullName.split(' ')[0]}</a>
                    <span className="bc-sep">›</span>
                    <span className="bc-active">Digital Card</span>
                </nav>

                {/* ===== MAIN CARD (PRINTABLE) ===== */}
                <div ref={componentRef} style={{ padding: '20px', background: '#f8fafc' }}>
                    <div className="dc-card">
                    <div className="dc-watermark">VAXICARE</div>

                    {/* Card Header */}
                    <div className="dc-card-header">
                        <div className="dc-card-header-left">
                            <div className="dc-shield-icon">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div>
                                <h1 className="dc-card-title">Digital Vaccination Record</h1>
                                <p className="dc-card-subtitle">
                                    VaxiCare Global Health Services • Certificate {childData.certificateNo}
                                </p>
                            </div>
                        </div>
                        <div className="dc-validated-badge">
                            <span className="material-symbols-outlined">verified</span>
                            Fully Validated
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="dc-profile-section">
                        <div className="dc-profile-photo">
                            <img src={childData.avatarUrl} alt={childData.fullName} />
                        </div>

                        <div className="dc-profile-info">
                            <div className="dc-info-item">
                                <span className="dc-info-label">Full Name</span>
                                <span className="dc-info-value">{childData.fullName}</span>
                            </div>
                            <div className="dc-info-item">
                                <span className="dc-info-label">Age / Gender</span>
                                <span className="dc-info-value">{childData.ageGender}</span>
                            </div>
                            <div className="dc-info-item">
                                <span className="dc-info-label">Date of Birth</span>
                                <span className="dc-info-value">{childData.dob}</span>
                            </div>
                            <div className="dc-info-item">
                                <span className="dc-info-label">Guardian</span>
                                <span className="dc-info-value">{childData.guardian}</span>
                            </div>
                            <div className="dc-info-item">
                                <span className="dc-info-label">Blood Group</span>
                                <span className="dc-info-value highlight">{childData.bloodGroup}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="dc-qr-section">
                            <div className="dc-qr-box">
                                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    {/* QR Code Pattern */}
                                    <rect x="5" y="5" width="25" height="25" rx="2" fill="#0f172a" />
                                    <rect x="8" y="8" width="19" height="19" rx="1" fill="white" />
                                    <rect x="11" y="11" width="13" height="13" rx="1" fill="#0f172a" />
                                    <rect x="70" y="5" width="25" height="25" rx="2" fill="#0f172a" />
                                    <rect x="73" y="8" width="19" height="19" rx="1" fill="white" />
                                    <rect x="76" y="11" width="13" height="13" rx="1" fill="#0f172a" />
                                    <rect x="5" y="70" width="25" height="25" rx="2" fill="#0f172a" />
                                    <rect x="8" y="73" width="19" height="19" rx="1" fill="white" />
                                    <rect x="11" y="76" width="13" height="13" rx="1" fill="#0f172a" />
                                    {/* Data modules */}
                                    <rect x="35" y="5" width="5" height="5" fill="#0f172a" />
                                    <rect x="45" y="5" width="5" height="5" fill="#0f172a" />
                                    <rect x="55" y="5" width="5" height="5" fill="#0f172a" />
                                    <rect x="35" y="12" width="5" height="5" fill="#0f172a" />
                                    <rect x="50" y="12" width="5" height="5" fill="#0f172a" />
                                    <rect x="60" y="12" width="5" height="5" fill="#0f172a" />
                                    <rect x="35" y="20" width="5" height="5" fill="#0f172a" />
                                    <rect x="42" y="20" width="5" height="5" fill="#0f172a" />
                                    <rect x="55" y="20" width="5" height="5" fill="#0f172a" />
                                    <rect x="5" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="15" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="25" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="35" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="48" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="58" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="70" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="80" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="90" y="35" width="5" height="5" fill="#0f172a" />
                                    <rect x="5" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="20" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="35" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="42" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="55" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="65" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="75" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="85" y="45" width="5" height="5" fill="#0f172a" />
                                    <rect x="10" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="25" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="40" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="50" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="60" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="70" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="85" y="55" width="5" height="5" fill="#0f172a" />
                                    <rect x="35" y="65" width="5" height="5" fill="#0f172a" />
                                    <rect x="45" y="65" width="5" height="5" fill="#0f172a" />
                                    <rect x="55" y="65" width="5" height="5" fill="#0f172a" />
                                    <rect x="75" y="70" width="5" height="5" fill="#0f172a" />
                                    <rect x="85" y="70" width="5" height="5" fill="#0f172a" />
                                    <rect x="70" y="80" width="5" height="5" fill="#0f172a" />
                                    <rect x="80" y="80" width="5" height="5" fill="#0f172a" />
                                    <rect x="90" y="80" width="5" height="5" fill="#0f172a" />
                                    <rect x="75" y="90" width="5" height="5" fill="#0f172a" />
                                    <rect x="85" y="90" width="5" height="5" fill="#0f172a" />
                                </svg>
                            </div>
                            <span className="dc-qr-label">Scan to Share Record</span>
                            <span className="dc-qr-hint">Secure medical verification key encrypted</span>
                        </div>
                    </div>

                    {/* Vaccine Table */}
                    <div className="dc-table-wrapper">
                        <table className="dc-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Date Given</th>
                                    <th>Next Due Date</th>
                                    <th>Administered By</th>
                                    <th>Batch No.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccines.map((v, i) => (
                                    <tr key={i}>
                                        <td data-label="Vaccine">
                                            <div className="dc-vaccine-cell">
                                                <span className={`dc-vaccine-dot ${v.dot}`}></span>
                                                <span className="dc-vaccine-name">{v.name}</span>
                                            </div>
                                        </td>
                                        <td data-label="Date Given" className="dc-date-cell">{v.dateGiven}</td>
                                        <td data-label="Next Due">
                                            <span className={`dc-due-badge ${v.nextDueType}`}>
                                                {v.nextDue}
                                            </span>
                                        </td>
                                        <td data-label="Administered By" className="dc-admin-cell">{v.administeredBy}</td>
                                        <td data-label="Batch No.">
                                            <span className="dc-batch-cell">{v.batchNo}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Footer */}
                    <div className="dc-card-footer">
                        <div className="dc-generated-info">
                            <span className="material-symbols-outlined">calendar_today</span>
                            Generated on: 24 Oct, 2023 • 14:30 GMT
                        </div>
                        <p className="dc-disclaimer">
                            This digital record is for information purposes and is issued by VaxiCare Health. For official legal
                            verification, use the scannable QR link or consult with your pediatrician.
                        </p>
                    </div>
                </div>
                </div>

                {/* ===== STATS CARDS ===== */}
                <div className="dc-stats-row">
                    <div className="dc-stat-card">
                        <div className="dc-stat-icon green">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <div className="dc-stat-content">
                            <div className="dc-stat-label">Completed</div>
                            <div className="dc-stat-value">
                                {activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.filter(v => v.status === 'done').length : 12} / {activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.length : 16} <span className="stat-light">({activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? Math.round((activeChild.vaccines.filter(v => v.status === 'done').length / activeChild.vaccines.length) * 100) : 75}%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="dc-stat-card">
                        <div className="dc-stat-icon blue">
                            <span className="material-symbols-outlined">medication</span>
                        </div>
                        <div className="dc-stat-content">
                            <div className="dc-stat-label">Last Vaccine</div>
                            <div className="dc-stat-value">{activeChild && activeChild.vaccines && activeChild.vaccines.find(v => v.status === 'done')?.name || 'None'}</div>
                            <div className="dc-stat-sub">{activeChild && activeChild.vaccines && activeChild.vaccines.find(v => v.status === 'done')?.dueDate ? new Date(activeChild.vaccines.find(v => v.status === 'done').dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                        </div>
                    </div>

                    <div className="dc-stat-card">
                        <div className="dc-stat-icon orange">
                            <span className="material-symbols-outlined">event_upcoming</span>
                        </div>
                        <div className="dc-stat-content">
                            <div className="dc-stat-label">Next Due</div>
                            <div className="dc-stat-value">{activeChild && activeChild.vaccines && activeChild.vaccines.find(v => v.status === 'due' || v.status === 'upcoming')?.name || 'None'}</div>
                            <div className="dc-stat-sub urgent">{activeChild && activeChild.vaccines && activeChild.vaccines.find(v => v.status === 'due' || v.status === 'upcoming')?.dueDate ? new Date(activeChild.vaccines.find(v => v.status === 'due' || v.status === 'upcoming').dueDate).toLocaleDateString('en-GB') : 'Fully Vaxxed'}</div>
                        </div>
                    </div>
                </div>

                {/* ===== ACTION BUTTONS ===== */}
                <div className="dc-actions-row">
                    <button className="dc-action-btn primary" onClick={handlePrint}>
                        <span className="material-symbols-outlined">download</span>
                        Download PDF
                    </button>
                    <button className="dc-action-btn secondary" onClick={handlePrint}>
                        <span className="material-symbols-outlined">print</span>
                        Print
                    </button>
                    <button className="dc-action-btn secondary">
                        <span className="material-symbols-outlined">link</span>
                        Copy Share Link
                    </button>
                    <button className="dc-action-btn secondary">
                        <span className="material-symbols-outlined">forward_to_inbox</span>
                        Email Card
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="dc-footer dc-wrapper">
                <div className="dc-footer-inner">
                    <div className="dc-footer-brand">
                        <span className="material-symbols-outlined">verified_user</span>
                        VaxiCare © 2023
                    </div>
                    <div className="dc-footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Support</a>
                        <a href="#">Clinic Login</a>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default DigitalCard;
