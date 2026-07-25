import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { Wallet, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function Repayments() {
    const [approvedLoans, setApprovedLoans] = useState([]);
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [amounts, setAmounts] = useState({});       // { applicationId: amount }
    const [processing, setProcessing] = useState(null);
    const [msg, setMsg] = useState({ id: null, text: '', ok: true });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // All approved/active loans (outstanding balance > 0)
            const apps = await apiClient('applications?status=Approved');
            setApprovedLoans(apps || []);
            const reps = await apiClient('repayments');
            setRepayments(reps || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleRecord = async (applicationId) => {
        const amount = parseFloat(amounts[applicationId] || 0);
        if (!amount || amount <= 0) {
            setMsg({ id: applicationId, text: 'Enter a valid amount.', ok: false });
            return;
        }
        setProcessing(applicationId);
        setMsg({ id: null, text: '', ok: true });
        try {
            await apiClient('repayments', {
                method: 'POST',
                body: JSON.stringify({ applicationId, amountPaid: amount })
            });
            setMsg({ id: applicationId, text: `KSh ${amount.toLocaleString()} recorded successfully!`, ok: true });
            setAmounts(prev => ({ ...prev, [applicationId]: '' }));
            fetchAll(); // Refresh list — completed loans will disappear
        } catch (e) {
            setMsg({ id: applicationId, text: 'Error: ' + e.message, ok: false });
        }
        setProcessing(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Cash Repayments</h2>
                    <p className="text-sm text-slate-400">Record customer cash payments. Balance and limit update automatically.</p>
                </div>
                <button onClick={fetchAll} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 transition-all">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Active Loan Repayment Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Wallet size={15} /> Active Loans Awaiting Payment ({loading ? '…' : approvedLoans.length})
                    </h3>
                </div>

                {loading ? (
                    <p className="p-8 text-center text-slate-400">Loading...</p>
                ) : approvedLoans.length === 0 ? (
                    <div className="p-10 text-center">
                        <CheckCheck size={32} className="mx-auto text-emerald-300 mb-3" />
                        <p className="font-semibold text-slate-400">All loans are settled. No pending repayments.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {approvedLoans.map(app => {
                            const customer = app.customer || {};
                            const outstanding = customer.outstanding_balance ?? 0;
                            return (
                                <div key={app.application_id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Info */}
                                        <div className="flex-1 space-y-1">
                                            <p className="font-extrabold text-slate-800 text-base">
                                                {customer.first_name} {customer.last_name}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Product: <span className="font-semibold text-slate-700">{app.product?.product_name || '—'}</span>
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Loan</p>
                                                    <p className="font-black text-slate-700">KSh {Number(app.requested_amount).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding</p>
                                                    <p className="font-black text-rose-600">KSh {Number(outstanding).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Limit</p>
                                                    <p className="font-black text-emerald-600">KSh {Number(customer.maximum_loan_limit ?? 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Record Payment */}
                                        <div className="flex flex-col gap-2 min-w-[240px]">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Received (KSh)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={outstanding}
                                                    placeholder={`Max: ${Number(outstanding).toLocaleString()}`}
                                                    value={amounts[app.application_id] || ''}
                                                    onChange={e => setAmounts(prev => ({ ...prev, [app.application_id]: e.target.value }))}
                                                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-sky-500"
                                                />
                                                <button
                                                    onClick={() => handleRecord(app.application_id)}
                                                    disabled={processing === app.application_id}
                                                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                                                >
                                                    {processing === app.application_id ? '…' : 'Record'}
                                                </button>
                                            </div>
                                            {msg.id === app.application_id && (
                                                <p className={`text-xs font-bold flex items-center gap-1 ${msg.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    <AlertCircle size={12} />{msg.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Repayment History */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-700 text-sm">Repayment History</h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                            <th className="p-4">CUSTOMER</th>
                            <th className="p-4">PRODUCT</th>
                            <th className="p-4">DATE</th>
                            <th className="p-4">CHANNEL</th>
                            <th className="p-4 text-right">AMOUNT (KSh)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {repayments.map(r => (
                            <tr key={r.repayment_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-slate-700">
                                    {r.application?.customer?.first_name} {r.application?.customer?.last_name}
                                </td>
                                <td className="p-4 text-slate-500">{r.application?.product?.product_name || '—'}</td>
                                <td className="p-4 text-slate-400 text-xs">
                                    {r.payment_date ? new Date(r.payment_date).toLocaleString() : '—'}
                                </td>
                                <td className="p-4">
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                                        {r.payment_method}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-black text-emerald-600">
                                    {Number(r.amount_paid).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {repayments.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No repayments recorded yet.</td></tr>
                        )}
                    </tbody>
                    {repayments.length > 0 && (
                        <tfoot>
                            <tr className="bg-slate-50 border-t border-slate-200 font-black text-slate-800 text-sm">
                                <td className="p-4" colSpan={4}>Total Collected</td>
                                <td className="p-4 text-right text-emerald-600">
                                    KSh {repayments.reduce((s, r) => s + (r.amount_paid || 0), 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
