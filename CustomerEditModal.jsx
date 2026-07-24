import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { X, User, Phone, CreditCard, Save } from 'lucide-react';

export default function CustomerEditModal({ customer, onClose, onSaved }) {
    const [firstName, setFirstName] = useState(customer.first_name || '');
    const [lastName, setLastName] = useState(customer.last_name || '');
    const [phone, setPhone] = useState(customer.phone_number || '');
    const [status, setStatus] = useState(customer.status || 'Active');
    const [loanLimit, setLoanLimit] = useState(customer.maximum_loan_limit ?? 0);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            await apiClient(`customers/${customer.customer_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phoneNumber: phone,
                    status,
                    maximumLoanLimit: parseFloat(loanLimit)
                })
            });
            setMsg('Saved successfully!');
            onSaved();
        } catch (err) {
            setMsg('Error: ' + err.message);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h3 className="font-extrabold text-slate-800">Edit Customer</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Update profile and loan allocation</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">FIRST NAME</label>
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">LAST NAME</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">PHONE NUMBER</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">ACCOUNT STATUS</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>

                    {/* The critical field */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <label className="block text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                            <CreditCard size={12} /> MAXIMUM LOAN LIMIT (KSh)
                        </label>
                        <input
                            type="number"
                            value={loanLimit}
                            onChange={e => setLoanLimit(e.target.value)}
                            min="0"
                            step="100"
                            className="w-full p-3 bg-white border border-amber-300 rounded-xl text-lg font-black text-slate-800 focus:outline-amber-500"
                        />
                        <p className="text-xs text-amber-600 mt-2">Current: KSh {customer.maximum_loan_limit ?? 0}</p>
                    </div>

                    {msg && (
                        <p className={`text-sm font-bold ${msg.startsWith('Error') ? 'text-rose-500' : 'text-emerald-600'}`}>{msg}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-500/20">
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
