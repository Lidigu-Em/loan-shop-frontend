import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import PaymentModal from './PaymentModal';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [activePaymentLoan, setActivePaymentLoan] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const custData = await apiClient('customers');
      setCustomers(custData || []);

      const loanData = await apiClient('loans?status=Active');
      setActiveLoans(loanData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueLoan = async (e) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);
    if (!selectedCustomerId || isNaN(amount) || !dueDate) return;

    try {
      await apiClient('loans', {
        method: 'POST',
        body: JSON.stringify({ customer_id: selectedCustomerId, principal_amount: amount, balance_remaining: amount, due_date: dueDate })
      });
      setLoanAmount(''); setDueDate(''); setSelectedCustomerId('');
      fetchDashboardData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Header Segment with Landscape Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white h-44 flex items-center px-6 md:px-10 shadow-lg">
        <img src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=1000" alt="Retail Store Storefront" className="absolute inset-0 w-full h-full object-cover opacity-25 object-center" />
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">Biashara Credit Operations</h2>
          <p className="text-xs md:text-sm text-sky-200/80">Issue immediate store credit tabs and manage running asset deficits[cite: 59].</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module: Record Loan Transaction */}
        <form onSubmit={handleIssueLoan} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Issue Store Credit</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">SELECT CUSTOMER</label>
            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500">
              <option value="">Choose Profile...</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">CREDIT AMOUNT (KSh)</label>
            <input type="number" placeholder="Principal Balance" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">MATURITY/DUE DATE</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
          </div>
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-50">
            Issue Credit Line
          </button>
        </form>

        {/* Real-time Open Credit Registry Row */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-3">Active Customer Credit Lines</h3>
            <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto pr-1">
              {activeLoans.length === 0 ? (
                <p className="text-sm text-slate-400 pt-4 text-center">No open active debt positions registered.</p>
              ) : (
                activeLoans.map(l => (
                  <div key={l.loan_id} className="flex justify-between items-center py-3 text-sm">
                    <div>
                      <p className="font-bold text-slate-700">{l.customers?.first_name} {l.customers?.last_name}</p>
                      <p className="text-xs text-slate-400">Due: {l.due_date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800">KSh {l.balance_remaining}</span>
                      <button onClick={() => setActivePaymentLoan(l)} className="px-3 py-1.5 bg-sky-500 text-white font-bold rounded-xl text-xs hover:bg-sky-600 shadow-sm shadow-sky-100 transition-all">
                        Record Payment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {activePaymentLoan && (
        <PaymentModal loan={activePaymentLoan} onClose={() => setActivePaymentLoan(null)} onPaymentSuccess={fetchDashboardData} />
      )}
    </div>
  );
}