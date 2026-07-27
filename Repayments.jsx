import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { Wallet, CheckCheck, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTIVE_PAGE_SIZE = 5;
const HISTORY_PAGE_SIZE = 8;

export default function Repayments() {
    const [approvedLoans, setApprovedLoans] = useState([]);
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [amounts, setAmounts] = useState({});
    const [processing, setProcessing] = useState(null);
    const [msg, setMsg] = useState({ id: null, text: '', ok: true });
    const [historyPage, setHistoryPage] = useState(1);
    const [activePage, setActivePage] = useState(1);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const apps = await apiClient('applications?status=Approved');
            setApprovedLoans(apps || []);
            const reps = await apiClient('repayments');
            setRepayments(reps || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
        setHistoryPage(1);
        setActivePage(1);
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
            fetchAll();
        } catch (e) {
            setMsg({ id: applicationId, text: 'Error: ' + e.message, ok: false });
        }
        setProcessing(null);
    };

    // ── Pagination helpers ──────────────────────────────────────────────────
    const totalPagesHistory = Math.max(1, Math.ceil(repayments.length / HISTORY_PAGE_SIZE));
    const safePageHistory = Math.min(historyPage, totalPagesHistory);
    const pagedReps = repayments.slice((safePageHistory - 1) * HISTORY_PAGE_SIZE, safePageHistory * HISTORY_PAGE_SIZE);

    const totalPagesActive = Math.max(1, Math.ceil(approvedLoans.length / ACTIVE_PAGE_SIZE));
    const safePageActive = Math.min(activePage, totalPagesActive);
    const pagedActiveLoans = approvedLoans.slice((safePageActive - 1) * ACTIVE_PAGE_SIZE, safePageActive * ACTIVE_PAGE_SIZE);

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6">
            <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Cash Repayments</h2>
                    <p className="text-sm text-slate-400">Record customer cash payments. Balance and limit update automatically.</p>
                </div>
                <button onClick={fetchAll} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 transition-all">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

                {/* Active Loan Repayment Panel */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <Wallet size={15} /> Active Loans Awaiting Payment ({loading ? '…' : approvedLoans.length})
                        </h3>
                        {approvedLoans.length > 0 && (
                            <p className="text-xs text-slate-400">
                                Page {safePageActive} of {totalPagesActive}
                            </p>
                        )}
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
                            {pagedActiveLoans.map(app => {
                                const customer = app.customer || {};
                                const outstanding = customer.outstanding_balance ?? 0;
                                return (
                                    <div key={app.application_id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
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

                    {/* Active Loans Pagination Controls */}
                    {totalPagesActive > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
                            <p className="text-xs text-slate-400">
                                Showing {((safePageActive - 1) * ACTIVE_PAGE_SIZE) + 1}–{Math.min(safePageActive * ACTIVE_PAGE_SIZE, approvedLoans.length)} of {approvedLoans.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                                    disabled={safePageActive === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                {Array.from({ length: totalPagesActive }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setActivePage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === safePageActive
                                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                            : 'border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-500'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setActivePage(p => Math.min(totalPagesActive, p + 1))}
                                    disabled={safePageActive === totalPagesActive}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Repayment History */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 text-sm">
                            Repayment History
                            <span className="ml-2 text-slate-400 font-normal text-xs">
                                ({repayments.length} record{repayments.length !== 1 ? 's' : ''})
                            </span>
                        </h3>
                        {repayments.length > 0 && (
                            <p className="text-xs text-slate-400">
                                Page {safePageHistory} of {totalPagesHistory}
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[600px]">
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
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
                                ) : pagedReps.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">No repayments recorded yet.</td></tr>
                                ) : (
                                    pagedReps.map(r => (
                                        <tr key={r.repayment_id ?? r.repaymentId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold text-slate-700">
                                                {r.application?.customer?.first_name ?? r.loanApplication?.customer?.first_name ?? '—'}{' '}
                                                {r.application?.customer?.last_name ?? r.loanApplication?.customer?.last_name ?? ''}
                                            </td>
                                            <td className="p-4 text-slate-500">
                                                {r.application?.product?.product_name ?? r.loanApplication?.product?.product_name ?? '—'}
                                            </td>
                                            <td className="p-4 text-slate-400 text-xs">
                                                {(r.payment_date ?? r.paymentDate)
                                                    ? new Date(r.payment_date ?? r.paymentDate).toLocaleString()
                                                    : '—'}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                                                    {r.payment_method ?? r.paymentMethod ?? 'Cash'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-black text-emerald-600">
                                                {Number(r.amount_paid ?? r.amountPaid ?? 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {repayments.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 border-t border-slate-200 font-black text-slate-800 text-sm">
                                        <td className="p-4" colSpan={4}>Total Collected</td>
                                        <td className="p-4 text-right text-emerald-600">
                                            KSh {repayments
                                                .reduce((s, r) => s + (r.amount_paid ?? r.amountPaid ?? 0), 0)
                                                .toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPagesHistory > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
                            <p className="text-xs text-slate-400">
                                Showing {((safePageHistory - 1) * HISTORY_PAGE_SIZE) + 1}–{Math.min(safePageHistory * HISTORY_PAGE_SIZE, repayments.length)} of {repayments.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                    disabled={safePageHistory === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={15} />
                                </button>
                                {Array.from({ length: totalPagesHistory }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setHistoryPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === safePageHistory
                                            ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                            : 'border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-500'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setHistoryPage(p => Math.min(totalPagesHistory, p + 1))}
                                    disabled={safePageHistory === totalPagesHistory}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
