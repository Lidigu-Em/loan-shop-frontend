import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { ClipboardList, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function LoanApprovals() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [rejectionReason, setRejectionReason] = useState({});
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await apiClient(`applications?status=${filter}`);
            setApplications(data || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleDecision = async (id, status) => {
        setProcessing(id + status);
        try {
            await apiClient(`applications/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status,
                    rejectionReason: rejectionReason[id] || ''
                })
            });
            fetchApplications();
        } catch (e) {
            alert('Error: ' + e.message);
        }
        setProcessing(null);
    };

    const statusColors = {
        Pending: 'bg-amber-100 text-amber-700',
        Approved: 'bg-emerald-100 text-emerald-700',
        Rejected: 'bg-rose-100 text-rose-600',
        Disbursed: 'bg-sky-100 text-sky-700',
        Completed: 'bg-slate-100 text-slate-600',
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Loan Applications</h2>
                <p className="text-sm text-slate-400">Review, approve, or reject customer loan requests.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s === 'All' ? '' : s)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${(s === 'All' ? filter === '' : filter === s)
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-300'
                            }`}
                    >
                        {s}
                    </button>
                ))}
                <button onClick={fetchApplications} className="ml-auto p-2 text-slate-400 hover:text-sky-500 transition-colors">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <p className="p-8 text-center text-slate-400">Loading applications...</p>
                ) : applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardList size={32} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-400 font-semibold">No {filter || ''} applications found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {applications.map(app => (
                            <div key={app.application_id} className="p-5 hover:bg-slate-50/60 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Application Info */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-extrabold text-slate-800 text-base">
                                                {app.customer?.first_name} {app.customer?.last_name}
                                            </p>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Product: <span className="font-bold text-slate-700">{app.product?.product_name || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Requested: <span className="font-black text-sky-600">KSh {Number(app.requested_amount).toLocaleString()}</span>
                                        </p>
                                        {app.rejection_reason && (
                                            <p className="text-xs text-rose-500 font-semibold mt-1">Reason: {app.rejection_reason}</p>
                                        )}
                                    </div>

                                    {/* Action Buttons — only show for Pending */}
                                    {app.status === 'Pending' && (
                                        <div className="flex flex-col gap-2 min-w-[220px]">
                                            <input
                                                type="text"
                                                placeholder="Rejection reason (optional)"
                                                value={rejectionReason[app.application_id] || ''}
                                                onChange={e => setRejectionReason(prev => ({ ...prev, [app.application_id]: e.target.value }))}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-rose-400"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDecision(app.application_id, 'Approved')}
                                                    disabled={processing === app.application_id + 'Approved'}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                                                >
                                                    <CheckCircle size={14} />
                                                    {processing === app.application_id + 'Approved' ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleDecision(app.application_id, 'Rejected')}
                                                    disabled={processing === app.application_id + 'Rejected'}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-rose-500/20"
                                                >
                                                    <XCircle size={14} />
                                                    {processing === app.application_id + 'Rejected' ? '...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
