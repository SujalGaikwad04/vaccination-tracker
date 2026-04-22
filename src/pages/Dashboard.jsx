import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { generateVaccineSchedule } from '../utils/vaccinationData';

const Dashboard = ({ childProfiles, setChildProfiles, activeChildIndex, setActiveChildIndex }) => {
    const children = childProfiles || [];
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    const handleAddChild = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('fullName');
        const gender = formData.get('gender');
        let avatarUrl = '';
        if (gender === 'male') {
            avatarUrl = '/baby-boy.png';
        } else if (gender === 'female') {
            avatarUrl = '/baby-girl.png';
        } else {
            const avatarColor = gender === 'male' || gender === 'boy' ? 'C4D9FF' : (gender === 'female' || gender === 'girl' ? 'F5AFAF' : 'ec5b13');
            avatarUrl = `https://ui-avatars.com/api/?name=${name}&background=${avatarColor}&color=fff&size=128&rounded=false`;
        }

        const dob = formData.get('dob');
        const generatedVaccines = generateVaccineSchedule(dob);

        const newChildData = {
            name: name,
            dob: dob,
            gender: gender,
            bloodGroup: formData.get('bloodGroup'),
            avatarUrl: avatarUrl,
            vaccines: generatedVaccines
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/children', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newChildData)
            });

            if (response.ok) {
                // Fetch updated children list to get the real database IDs for vaccines
                const fetchRes = await fetch('http://localhost:5000/api/children', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (fetchRes.ok) {
                    const data = await fetchRes.json();
                    setChildProfiles(data.children || []);
                    setActiveChildIndex((data.children || []).length - 1);
                }
                
                setShowAddModal(false);
            } else {
                console.error('Failed to add child');
            }
        } catch (err) {
            console.error('Error adding child:', err);
        }
    };

    const activeChild = children[activeChildIndex];

    const handleDeleteChild = async () => {
        if (window.confirm(`Are you sure you want to delete ${activeChild.name}'s profile? This action cannot be undone.`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/children/${activeChild.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const newChildren = children.filter((_, index) => index !== activeChildIndex);
                    setChildProfiles(newChildren);
                    if (newChildren.length > 0) {
                        setActiveChildIndex(newChildren.length - 1);
                    } else {
                        setActiveChildIndex(0);
                    }
                } else {
                    console.error('Failed to delete child');
                }
            } catch (err) {
                console.error('Error deleting child:', err);
            }
        }
    };

    let nextDueVaccine = null;
    let missedAlerts = [];
    let upcomingAlerts = [];

    if (activeChild && activeChild.vaccines) {
        const sortedVaccines = [...activeChild.vaccines].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        nextDueVaccine = sortedVaccines.find(v => v.status === 'upcoming' || v.status === 'due');

        missedAlerts = sortedVaccines.filter(v => v.status === 'missed').map(v => ({
            type: 'missed',
            title: `${v.name} was missed`,
            time: `Due on ${new Date(v.dueDate).toLocaleDateString()}`
        }));

        upcomingAlerts = sortedVaccines.filter(v => v.status === 'due' || v.status === 'upcoming')
            .filter(v => {
                const due = new Date(v.dueDate);
                const today = new Date();
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 14;
            })
            .map(v => ({
                type: 'upcoming',
                title: `${v.name} due in ${Math.ceil((new Date(v.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days`,
                time: `Due on ${new Date(v.dueDate).toLocaleDateString()}`
            }));
    }

    const allAlerts = [...missedAlerts, ...upcomingAlerts].slice(0, 3);

    return (
        <div className="dashboard-container relative min-h-screen text-slate-900 dark:text-slate-100">
            {/* Empty State */}
            {children.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-lg border border-slate-200 dark:border-slate-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="size-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 ring-8 ring-primary/5">
                            <span className="material-symbols-outlined text-4xl">child_care</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Welcome to VaxiCare</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed text-sm md:text-base">Get started by adding your child's profile. We will automatically generate their vaccination schedule based on their date of birth.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mx-auto w-full md:w-auto"
                        >
                            <span className="material-symbols-outlined font-bold">add_circle</span>
                            Add Child Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Content when children exist */}
            {children.length > 0 && activeChild && (
                <main className="max-w-[1440px] mx-auto px-6 py-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Main Content Area (Left/Center) */}
                        <div className="col-span-12 lg:col-span-9 space-y-8">
                            {/* Child Overview Hero */}
                            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-center">
                                <div className="size-32 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                                    <img className="w-full h-full object-cover" data-alt={`Detailed portrait of ${activeChild.name} the baby`} src={activeChild.avatarUrl || `https://ui-avatars.com/api/?name=${activeChild.name}&background=${(activeChild.gender && (activeChild.gender.toLowerCase() === 'male' || activeChild.gender.toLowerCase() === 'boy')) ? 'C4D9FF' : (activeChild.gender && (activeChild.gender.toLowerCase() === 'female' || activeChild.gender.toLowerCase() === 'girl')) ? 'F5AFAF' : 'ec5b13'}&color=fff&size=128&rounded=false`} />
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="flex flex-wrap justify-between items-start gap-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{activeChild.name}</h2>
                                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">cake</span> {activeChild.dob ? 'DOB: ' + activeChild.dob : 'Newborn'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hidden sm:flex">
                                                <span className="material-symbols-outlined text-lg">verified</span>
                                                Vaccine Confidence: High
                                            </div>
                                            <button
                                                onClick={handleDeleteChild}
                                                className="bg-white hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/50 w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center transition-all shadow-sm group"
                                                title="Delete Profile"
                                            >
                                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Overall Vaccination Progress</span>
                                            <span className="text-primary">{activeChild.progress}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${activeChild.progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            {/* Stats Grid */}
                            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-green-500 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed</p>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.completed}</h3>
                                        <span className="text-green-500 flex items-center text-sm font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                            <span className="material-symbols-outlined text-sm">trending_up</span> 82%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-amber-400 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upcoming</p>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.upcoming}</h3>
                                        <span className="text-amber-500 text-sm font-bold">This month</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-red-500 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Missed</p>
                                    <div className="flex items-end justify-between mt-2">
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{activeChild.missed}</h3>
                                        <span className="text-red-500 text-sm font-bold underline cursor-pointer">Re-schedule</span>
                                    </div>
                                </div>
                            </section>
                            {/* Next Due and Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Next Due */}
                                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between">
                                    <div><div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold mb-3">
                                        <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                                        FOR {activeChild.name.toUpperCase()}
                                    </div>
                                        <div className="flex items-center gap-2 text-primary mb-2">
                                            <span className="material-symbols-outlined">event_upcoming</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Milestone</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {nextDueVaccine ? nextDueVaccine.name : 'All caught up!'}
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1">Due Date: <span className="font-semibold">
                                            {nextDueVaccine ? new Date(nextDueVaccine.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </span></p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/vaccine-tracker')}
                                        className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                                    >
                                        View Details
                                    </button>
                                </div>
                                {/* Quick Actions Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowAddModal(true)} className="flex flex-col items-center justify-center gap-2 p-4 bg-primary/10 dark:bg-primary/20 border-2 border-dashed border-primary/40 rounded-2xl hover:bg-primary/20 transition-all group scale-[1.02] ring-2 ring-primary/10 hover:ring-primary/30">
                                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform font-bold">add_circle</span>
                                        <span className="text-xs font-bold text-primary">Add New Baby</span>
                                    </button>
                                    <button onClick={() => navigate('/vaccine-tracker')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-colors group">
                                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">timeline</span>
                                        <span className="text-xs font-bold">Timeline</span>
                                    </button>
                                    <button onClick={() => navigate('/digital-card')} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary transition-colors group">
                                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">badge</span>
                                        <span className="text-xs font-bold">Digital Card</span>
                                    </button>
                                    <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-2xl hover:bg-red-100 transition-colors group">
                                        <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">emergency_home</span>
                                        <span className="text-xs font-bold text-red-600">Emergency</span>
                                    </button>
                                </div>
                            </div>
                            {/* Timeline Table */}
                            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Vaccination Timeline</h3>
                                    <button onClick={() => navigate('/vaccine-tracker')} className="text-primary text-sm font-semibold hover:underline">Full Schedule</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Vaccine Name</th>
                                                <th className="px-6 py-4">Dose</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {activeChild.vaccines && activeChild.vaccines.slice(0, 5).map((v, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4 font-semibold">{v.name}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{v.when}</td>
                                                    <td className="px-6 py-4">
                                                        {v.status === 'done' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</span>}
                                                        {v.status === 'missed' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Missed</span>}
                                                        {v.status === 'upcoming' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Upcoming</span>}
                                                        {v.status === 'due' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Due Now</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {new Date(v.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!activeChild.vaccines || activeChild.vaccines.length === 0) && (
                                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No vaccines generated.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                        {/* Sidebar (Right) */}
                        <aside className="col-span-12 lg:col-span-3 space-y-8">
                            {/* Recent Alerts */}
                            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">Recent Alerts</h3><button className="text-[10px] font-bold text-primary hover:underline">Manage Children</button></div>
                                <div className="space-y-4">
                                    {allAlerts.length > 0 ? allAlerts.map((alert, idx) => (
                                        <div className="flex gap-4" key={idx}>
                                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${alert.type === 'missed' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                                <span className={`material-symbols-outlined text-sm ${alert.type === 'missed' ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {alert.type === 'missed' ? 'warning' : 'notifications_active'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{alert.title}</p>
                                                <p className="text-[10px] text-slate-400">{alert.time}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex gap-4">
                                            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">All caught up!</p>
                                                <p className="text-[10px] text-slate-400">No pending alerts</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                            {/* Milestones */}
                            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-lg mb-4">Milestones</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 w-[calc(50%-0.375rem)]">
                                        <span className="material-symbols-outlined">stars</span>
                                        <span className="text-[10px] font-bold">First Shot</span>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 w-[calc(50%-0.375rem)]">
                                        <span className="material-symbols-outlined">trending_up</span>
                                        <span className="text-[10px] font-bold">On Track</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 w-[calc(50%-0.375rem)] border border-dashed border-slate-300">
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                        <span className="text-[10px] font-bold">Super Guard</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-2 rounded-xl flex flex-col items-center justify-center text-center gap-1 w-[calc(50%-0.375rem)] border border-dashed border-slate-300">
                                        <span className="material-symbols-outlined">shield</span>
                                        <span className="text-[10px] font-bold">Immune Pro</span>
                                    </div>
                                </div>
                            </section>
                            {/* Educational Card */}
                            <section className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative z-10">
                                    <span className="material-symbols-outlined text-primary mb-2">menu_book</span>
                                    <h4 className="font-bold mb-2">Did you know?</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                        Breastfeeding provides antibodies that help protect babies from many infections, but vaccines are still essential for diseases like Polio and Measles.
                                    </p>
                                    <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                        Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            )}

            {/* Add Child Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-3xl">child_care</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Profile</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Register a child for vaccine tracking</p>
                            </div>
                        </div>
                        <form className="space-y-5" onSubmit={handleAddChild}>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Child's Full Name</label>
                                <input type="text" name="fullName" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold placeholder:font-normal placeholder:text-slate-400" placeholder="e.g., Maya" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                                    <input type="date" name="dob" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                                    <select name="gender" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold" required>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                                <select name="bloodGroup" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold">
                                    <option value="">Unknown / Optional</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full mt-8 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 border border-transparent text-lg">
                                Save Details
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
