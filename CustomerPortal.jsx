import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { Package, ChevronRight, Clock, RefreshCw, Printer } from 'lucide-react';

export default function CustomerPortal() {
    const [profile, setProfile] = useState(null);
    const [products, setProducts] = useState([]);
    const [applications, setApplications] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [requestedAmount, setRequestedAmount] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const p = await apiClient('customers/profile');
            setProfile(p);
            const prods = await apiClient('products?status=Active');
            setProducts(prods || []);
            const apps = await apiClient('applications');
            setApplications(apps || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await apiClient('applications', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: selectedProduct.product_id,
                    requested_amount: parseFloat(requestedAmount)
                })
            });
            alert("Application submitted successfully! It is now pending admin approval.");
            setSelectedProduct(null);
            setRequestedAmount('');
            fetchData();
        } catch (e) {
            alert("Application Failed: " + e.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const statusColor = (status) => {
        if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
        if (status === 'Rejected') return 'bg-rose-100 text-rose-600';
        if (status === 'Pending') return 'bg-amber-100 text-amber-700';
        return 'bg-slate-100 text-slate-600';
    };

    if (!profile) return <p className="p-10 text-center text-slate-500">Loading Profile...</p>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* ─── Print Header (only visible when printing) ─── */}
            <div className="hidden print:block border-b pb-4 mb-4">
                <h1 className="text-2xl font-black text-slate-900">Ledgerly — Customer Loan Statement</h1>
                <p className="text-sm text-slate-600 mt-1">
                    <strong>Name:</strong> {profile.first_name} {profile.last_name} &nbsp;|&nbsp;
                    <strong>Phone:</strong> {profile.phone_number || '—'} &nbsp;|&nbsp;
                    <strong>Date:</strong> {new Date().toLocaleString()}
                </p>
            </div>

            {/* ─── Profile Header (hidden when printing) ─── */}
            <div className="bg-sky-500 rounded-3xl p-6 md:p-10 text-white shadow-xl shadow-sky-500/20 print:hidden">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-black">Welcome, {profile.first_name}</h2>
                        <p className="opacity-80 mt-1">Manage your active loans and requests.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all" title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-all" title="Print Statement">
                            <Printer size={15} /> Print Statement
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                        <p className="text-xs font-semibold opacity-80 mb-1 tracking-wider uppercase">Available Limit</p>
                        <p className="text-3xl font-black">KSh {Number(profile.maximum_loan_limit).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                        <p className="text-xs font-semibold opacity-80 mb-1 tracking-wider uppercase">Outstanding Balance</p>
                        <p className="text-3xl font-black">KSh {Number(profile.outstanding_balance ?? 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* ─── Balance Summary (visible on print only) ─── */}
            <div className="hidden print:grid grid-cols-2 gap-6 mb-4">
                <div className="border rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Available Limit</p>
                    <p className="text-2xl font-black text-slate-800">KSh {Number(profile.maximum_loan_limit).toLocaleString()}</p>
                </div>
                <div className="border rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Outstanding Balance</p>
                    <p className="text-2xl font-black text-slate-800">KSh {Number(profile.outstanding_balance ?? 0).toLocaleString()}</p>
                </div>
            </div>

            {/* ─── Application History (shown always, prints cleanly) ─── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm print:shadow-none print:border-slate-300 print:rounded-none">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" /> Loan Request History
                    </h3>
                    <p className="text-xs text-slate-400 print:hidden">{applications.length} records</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                                <th className="p-4">PRODUCT</th>
                                <th className="p-4 text-right">AMOUNT (KSh)</th>
                                <th className="p-4 text-center">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {applications.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400">No loan history yet.</td></tr>
                            ) : applications.map(app => (
                                <tr key={app.application_id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-700">{app.product?.product_name || 'Loan Application'}</td>
                                    <td className="p-4 text-right font-black text-sky-600">{Number(app.requested_amount).toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${statusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-black text-slate-800 text-sm border-t border-slate-200">
                                <td className="p-4" colSpan={1}>Total Borrowed</td>
                                <td className="p-4 text-right text-rose-600">
                                    KSh {applications
                                        .filter(a => a.status === 'Approved')
                                        .reduce((s, a) => s + (a.requested_amount || 0), 0)
                                        .toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ─── Apply for Loan (hidden when printing) ─── */}
            <div className="print:hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Package className="text-sky-500" /> Apply for a Product
                </h3>
                {selectedProduct ? (
                    <form onSubmit={handleApply} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <div className="mb-4">
                            <p className="text-xs text-sky-600 font-bold tracking-tight uppercase mb-1">SELECTED</p>
                            <p className="text-lg font-black text-slate-800">{selectedProduct.product_name}</p>
                            <p className="text-sm text-slate-500">Interest: {selectedProduct.interest_rate}% | Max: KSh {Number(selectedProduct.maximum_loan_amount).toLocaleString()}</p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 mb-2">HOW MUCH DO YOU NEED? (KSh)</label>
                            <input
                                type="number"
                                value={requestedAmount}
                                onChange={e => setRequestedAmount(e.target.value)}
                                max={Math.min(selectedProduct.maximum_loan_amount, profile.maximum_loan_limit)}
                                className="w-full text-lg p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 outline-none focus:border-sky-500 transition-colors"
                                placeholder="0.00"
                                required
                            />
                            <p className="text-xs text-slate-400 mt-2">Cannot exceed your available limit of KSh {Number(profile.maximum_loan_limit).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setSelectedProduct(null)} className="px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 bg-sky-500 text-white rounded-xl font-bold tracking-wide shadow-md shadow-sky-500/30 hover:bg-sky-600 transition-colors py-3">Submit Request</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        {products.length === 0 ? <p className="text-slate-400 text-sm">No products available.</p> : products.map(p => (
                            <div key={p.product_id} onClick={() => setSelectedProduct(p)} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 rounded-2xl cursor-pointer transition-all group">
                                <div>
                                    <h4 className="font-extrabold text-slate-700 group-hover:text-sky-700">{p.product_name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{p.interest_rate}% Interest • {p.repayment_period_months} Months</p>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-sky-500" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
