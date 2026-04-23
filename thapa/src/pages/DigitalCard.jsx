import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import './DigitalCard.css';

const DigitalCard = ({ activeChild }) => {
    const [isLoading, setIsLoading] = useState({
        download: false,
        share: false,
        email: false
    });

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
        certificateNo: `#VC-2023-${activeChild.id || '8842'}`
    } : defaultData;

    const componentRef = useRef();
    
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${childData.fullName}_Vaccination_Record`,
    });

    const shareUrl = activeChild ? `${window.location.origin}/public/${activeChild.id}` : window.location.href;

    const generateProfessionalPDF = async () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1 });

        // 1. Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text('Digital Vaccination Record', 20, 30);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`VaxiCare Global Health Services • Certificate ${childData.certificateNo}`, 20, 38);

        // 2. QR Code (Top-Right)
        doc.addImage(qrCodeDataUrl, 'PNG', 155, 15, 35, 35);
        doc.setFontSize(8);
        doc.text('Scan to Verify Record', 158, 53);

        // 3. Child Details (2-Column)
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Child Information', 20, 65);
        doc.setDrawColor(13, 138, 188);
        doc.setLineWidth(0.5);
        doc.line(20, 67, 40, 67);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        // Column 1 labels
        doc.text('FULL NAME', 20, 75);
        doc.text('DATE OF BIRTH', 20, 85);
        doc.text('AGE / GENDER', 20, 95);
        
        // Column 2 labels
        doc.text('GUARDIAN NAME', 110, 75);
        doc.text('BLOOD GROUP', 110, 85);
        doc.text('CERTIFICATE ID', 110, 95);

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        // Column 1 values
        doc.text(childData.fullName, 20, 80);
        doc.text(childData.dob, 20, 90);
        doc.text(childData.ageGender, 20, 100);

        // Column 2 values
        doc.text(childData.guardian || 'N/A', 110, 80);
        doc.setTextColor(239, 68, 68); // Red for blood group
        doc.text(childData.bloodGroup, 110, 90);
        doc.setTextColor(15, 23, 42);
        doc.text(childData.certificateNo, 110, 100);

        // 4. Vaccination Table
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Vaccination History', 20, 115);
        doc.line(20, 117, 40, 117);

        autoTable(doc, {
            startY: 125,
            head: [['Vaccine Name', 'Date Given', 'Next Due Date', 'Administered By', 'Batch No.']],
            body: vaccines.map(v => [
                v.name, 
                v.dateGiven, 
                v.nextDue, 
                v.administeredBy, 
                v.batchNo
            ]),
            headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
            bodyStyles: { textColor: [71, 85, 105], fontSize: 9 },
            columnStyles: {
                2: { fontStyle: 'bold' } // Style for Next Due Date column
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.raw === 'COMPLETED') {
                        data.cell.styles.textColor = [22, 163, 74]; // Green
                    } else {
                        data.cell.styles.textColor = [37, 99, 235]; // Blue
                    }
                }
            },
            margin: { left: 20, right: 20 },
            theme: 'grid'
        });

        // 5. Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('This is a digitally verified vaccination record. Issued by VaxiCare Health.', 20, 285);
            doc.text(`Generated on: ${new Date().toLocaleString('en-GB')} • Page ${i} of ${pageCount}`, 145, 285);
        }

        return doc;
    };

    const handleDownloadPDF = async () => {
        setIsLoading(prev => ({ ...prev, download: true }));
        const toastId = toast.loading('Generating professional certificate...');
        
        try {
            const doc = await generateProfessionalPDF();
            doc.save(`Vaccination_Record_${childData.fullName.replace(/\s+/g, '_')}.pdf`);
            toast.success('Certificate downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate professional PDF', { id: toastId });
        } finally {
            setIsLoading(prev => ({ ...prev, download: false }));
        }
    };

    const handleCopyLink = async () => {
        setIsLoading(prev => ({ ...prev, share: true }));
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied successfully!');
        } catch (error) {
            toast.error('Failed to copy link');
        } finally {
            setIsLoading(prev => ({ ...prev, share: false }));
        }
    };

    const handleEmailCard = async () => {
        const email = prompt('Enter recipient email address:');
        if (!email) return;

        setIsLoading(prev => ({ ...prev, email: true }));
        const toastId = toast.loading('Generating document and sending email...');

        try {
            // 1. Generate PDF
            const doc = await generateProfessionalPDF();
            const pdfBase64 = doc.output('datauristring').split(',')[1];

            // 2. Send to backend
            const response = await fetch('http://localhost:5000/api/send-card-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    childName: childData.fullName,
                    shareLink: shareUrl,
                    pdfAttachment: pdfBase64
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Certificate emailed successfully!', { id: toastId });
            } else {
                throw new Error(data.details || data.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Email Error:', error);
            toast.error(`Could not email document: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(prev => ({ ...prev, email: false }));
        }
    };

    const vaccines = activeChild && activeChild.vaccines && activeChild.vaccines.length > 0 ? activeChild.vaccines.map(v => ({
        name: v.name,
        dot: v.status === 'done' ? 'green' : (v.status === 'due' || v.status === 'upcoming' ? 'blue' : 'red'),
        dateGiven: v.status === 'done' ? new Date(v.dateAdministered || v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--/--/----',
        nextDue: v.status === 'done' ? 'COMPLETED' : new Date(v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        nextDueType: v.status === 'done' ? 'completed' : (v.status === 'missed' ? 'overdue' : 'pending'),
        statusText: v.status === 'done' ? 'Completed' : 'Remaining',
        administeredBy: v.status === 'done' ? (v.hospitalName || 'Authorized Clinic') : '-',
        batchNo: v.status === 'done' ? 'VC-' + Math.floor(Math.random() * 90000 + 10000) : '-',
    })) : [
        {
            name: 'BCG',
            dot: 'green',
            dateGiven: '15/05/2021',
            nextDue: 'COMPLETED',
            nextDueType: 'completed',
            statusText: 'Completed',
            administeredBy: 'City Health Center',
            batchNo: 'B1234-AX',
        },
        {
            name: 'HepB 1',
            dot: 'green',
            dateGiven: '15/05/2021',
            nextDue: 'COMPLETED',
            nextDueType: 'completed',
            statusText: 'Completed',
            administeredBy: 'City Health Center',
            batchNo: 'H5678-BY',
        },
        {
            name: 'DTP 1',
            dot: 'blue',
            dateGiven: '15/07/2021',
            nextDue: '20/08/2021',
            nextDueType: 'pending',
            statusText: 'Remaining',
            administeredBy: 'Wellness Clinic',
            batchNo: 'D9012-CZ',
        },
    ];

    return (
        <>
            <Toaster position="top-right" />
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
                <div ref={componentRef} className="dc-card-printable-container">
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
                                <QRCodeCanvas 
                                    value={shareUrl} 
                                    size={100}
                                    level={"H"}
                                    includeMargin={false}
                                />
                            </div>
                            <span className="dc-qr-label">Scan to Verify Record</span>
                            <span className="dc-qr-hint">Secure digital signature attached</span>
                        </div>
                    </div>

                    {/* Vaccine Table */}
                    <div className="dc-table-wrapper">
                        <table className="dc-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Status</th>
                                    <th>Date Given</th>
                                    <th>Next Due Date</th>
                                    <th>Administered By</th>
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
                                        <td data-label="Status">
                                            <span className={`dc-status-text ${v.dot}`}>
                                                {v.statusText}
                                            </span>
                                        </td>
                                        <td data-label="Date Given" className="dc-date-cell">{v.dateGiven}</td>
                                        <td data-label="Next Due">
                                            <span className={`dc-due-badge ${v.nextDueType}`}>
                                                {v.nextDue}
                                            </span>
                                        </td>
                                        <td data-label="Administered By" className="dc-admin-cell">{v.administeredBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Card Footer */}
                    <div className="dc-card-footer">
                        <div className="dc-generated-info">
                            <span className="material-symbols-outlined">calendar_today</span>
                            Generated on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} GMT
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
                    <button 
                        className={`dc-action-btn primary ${isLoading.download ? 'loading' : ''}`} 
                        onClick={handleDownloadPDF}
                        disabled={isLoading.download}
                    >
                        <span className="material-symbols-outlined">
                            {isLoading.download ? 'sync' : 'download'}
                        </span>
                        {isLoading.download ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button className="dc-action-btn secondary" onClick={handlePrint}>
                        <span className="material-symbols-outlined">print</span>
                        Print
                    </button>
                    <button 
                        className={`dc-action-btn secondary ${isLoading.share ? 'loading' : ''}`} 
                        onClick={handleCopyLink}
                        disabled={isLoading.share}
                    >
                        <span className="material-symbols-outlined">
                            {isLoading.share ? 'sync' : 'link'}
                        </span>
                        {isLoading.share ? 'Copying...' : 'Copy Share Link'}
                    </button>
                    <button 
                        className={`dc-action-btn secondary ${isLoading.email ? 'loading' : ''}`} 
                        onClick={handleEmailCard}
                        disabled={isLoading.email}
                    >
                        <span className="material-symbols-outlined">
                            {isLoading.email ? 'sync' : 'forward_to_inbox'}
                        </span>
                        {isLoading.email ? 'Sending...' : 'Email Card'}
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
