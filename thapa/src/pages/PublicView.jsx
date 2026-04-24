import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import './DigitalCard.css';
import { API_URL } from '../config';

const PublicView = () => {
    const { id } = useParams();
    const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const componentRef = useRef();

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/child/${id}`);
                if (!response.ok) throw new Error('Record not found');
                const data = await response.json();
                setChild(data.child);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicData();
    }, [id]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${child?.name}_Vaccination_Record`,
    });

    const handleDownloadPDF = async () => {
        setDownloading(true);
        const toastId = toast.loading('Preparing PDF...');
        try {
            const element = componentRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#f8fafc' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Vaccination_Record_${child.name.replace(/\s+/g, '_')}.pdf`);
            toast.success('Downloaded!', { id: toastId });
        } catch (error) {
            toast.error('Failed to download', { id: toastId });
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="dc-wrapper" style={{textAlign: 'center', padding: '100px'}}>Loading record...</div>;
    if (error) return <div className="dc-wrapper" style={{textAlign: 'center', padding: '100px', color: '#ef4444'}}>Error: {error}</div>;

    const childData = {
        fullName: child.name,
        dob: new Date(child.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        ageGender: `Infant • ${child.gender}`,
        bloodGroup: child.blood_group,
        avatarUrl: child.avatar_url || `https://ui-avatars.com/api/?name=${child.name}&background=0D8ABC&color=fff&size=128`,
        certificateNo: `#VC-PUB-${id}`
    };

    const vaccines = child.vaccines.map(v => ({
        name: v.name,
        dot: v.status === 'done' ? 'green' : (v.status === 'due' || v.status === 'upcoming' ? 'blue' : 'red'),
        dateGiven: v.status === 'done' ? new Date(v.dateAdministered || v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--/--/----',
        nextDue: v.status === 'done' ? 'COMPLETED' : new Date(v.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        nextDueType: v.status === 'done' ? 'completed' : (v.status === 'missed' ? 'overdue' : 'pending'),
        statusText: v.status === 'done' ? 'Completed' : 'Remaining',
        administeredBy: v.status === 'done' ? (v.hospitalName || 'Authorized Clinic') : '-',
    }));

    return (
        <div className="dc-wrapper public-view">
            <Toaster position="top-right" />
            <div className="dc-card-printable-container" ref={componentRef}>
                <div className="dc-card">
                    <div className="dc-watermark">VERIFIED</div>
                    <div className="dc-card-header">
                        <div className="dc-card-header-left">
                            <div className="dc-shield-icon"><span className="material-symbols-outlined">verified_user</span></div>
                            <div>
                                <h1 className="dc-card-title">Digital Vaccination Record</h1>
                                <p className="dc-card-subtitle">VaxiCare Verified Public Record • {childData.certificateNo}</p>
                            </div>
                        </div>
                        <div className="dc-validated-badge"><span className="material-symbols-outlined">verified</span>Verified View</div>
                    </div>

                    <div className="dc-profile-section">
                        <div className="dc-profile-photo"><img src={childData.avatarUrl} alt={childData.fullName} /></div>
                        <div className="dc-profile-info">
                            <div className="dc-info-item"><span className="dc-info-label">Full Name</span><span className="dc-info-value">{childData.fullName}</span></div>
                            <div className="dc-info-item"><span className="dc-info-label">Age / Gender</span><span className="dc-info-value">{childData.ageGender}</span></div>
                            <div className="dc-info-item"><span className="dc-info-label">Date of Birth</span><span className="dc-info-value">{childData.dob}</span></div>
                            <div className="dc-info-item"><span className="dc-info-label">Blood Group</span><span className="dc-info-value highlight">{childData.bloodGroup}</span></div>
                        </div>
                        <div className="dc-qr-section">
                            <div className="dc-qr-box">
                                <QRCodeCanvas value={window.location.href} size={100} level={"H"} />
                            </div>
                            <span className="dc-qr-label">Verified Record</span>
                        </div>
                    </div>

                    <div className="dc-table-wrapper">
                        <table className="dc-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Status</th>
                                    <th>Date Given</th>
                                    <th>Next Due</th>
                                    <th>Administered By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccines.map((v, i) => (
                                    <tr key={i}>
                                        <td><div className="dc-vaccine-cell"><span className={`dc-vaccine-dot ${v.dot}`}></span>{v.name}</div></td>
                                        <td><span className={`dc-status-text ${v.dot}`}>{v.statusText}</span></td>
                                        <td>{v.dateGiven}</td>
                                        <td><span className={`dc-due-badge ${v.nextDueType}`}>{v.nextDue}</span></td>
                                        <td>{v.administeredBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="dc-card-footer">
                        <div className="dc-generated-info">
                            <span className="material-symbols-outlined">verified</span>
                            Public Verification Date: {new Date().toLocaleDateString()}
                        </div>
                        <p className="dc-disclaimer">This is a verified public view of a vaccination record issued by VaxiCare Health.</p>
                    </div>
                </div>
            </div>

            <div className="dc-actions-row" style={{marginTop: '2rem'}}>
                <button className="dc-action-btn primary" onClick={handleDownloadPDF} disabled={downloading}>
                    <span className="material-symbols-outlined">{downloading ? 'sync' : 'download'}</span>
                    {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button className="dc-action-btn secondary" onClick={handlePrint}>
                    <span className="material-symbols-outlined">print</span>
                    Print Record
                </button>
            </div>
        </div>
    );
};

export default PublicView;
