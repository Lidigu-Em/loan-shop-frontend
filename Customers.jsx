import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import CustomerEditModal from './CustomerEditModal';
import { Users, Pencil, ShieldCheck } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiClient('customers');
      setCustomers(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Customer Accounts</h2>
        <p className="text-sm text-slate-400">Manage registered borrowers and their credit allocations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Users size={16} /> Registered Customers ({customers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-xs border-b border-slate-100">
                <th className="p-4">NAME</th>
                <th className="p-4">PHONE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">LOAN LIMIT (KSh)</th>
                <th className="p-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No customers registered yet.</td></tr>
              ) : customers.map(c => (
                <tr key={c.customer_id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-700">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">ID #{c.customer_id}</p>
                  </td>
                  <td className="p-4 text-slate-500">{c.phone_number || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                      }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.maximum_loan_limit > 0 ? (
                      <span className="font-black text-slate-800">
                        {Number(c.maximum_loan_limit).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs">NOT SET</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setEditingCustomer(c)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all"
                    >
                      <Pencil size={12} /> Edit / Set Limit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingCustomer && (
        <CustomerEditModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSaved={() => {
            setEditingCustomer(null);
            fetchCustomers(); // Refresh table after save
          }}
        />
      )}
    </div>
  );
}