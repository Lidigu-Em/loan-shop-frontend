import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [activeApplications, setActiveApplications] = useState([]);
  const [products, setProducts] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loanLimit, setLoanLimit] = useState('');

  // Product Loan State
  const [issueCustomerId, setIssueCustomerId] = useState('');
  const [issueProductId, setIssueProductId] = useState('');
  const [issueAmount, setIssueAmount] = useState('');

  // Tab Pagination
  const [activeTab, setActiveTab] = useState('register');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const custData = await apiClient('customers');
      setCustomers(custData || []);

      const prodData = await apiClient('products');
      setProducts(prodData || []);

      const loanData = await apiClient('applications?status=Approved');
      setActiveApplications(loanData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) return;

    try {
      await apiClient('customers', {
        method: 'POST',
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phone,
          maximumLoanLimit: loanLimit ? parseFloat(loanLimit) : 0
        })
      });
      setFirstName(''); setLastName(''); setPhone(''); setLoanLimit('');
      fetchDashboardData();
      alert("Customer registered successfully.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleIssueProduct = async (e) => {
    e.preventDefault();
    if (!issueCustomerId || !issueProductId || !issueAmount) return;

    try {
      await apiClient('applications/admin-issue', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: issueCustomerId,
          product_id: issueProductId,
          requested_amount: parseFloat(issueAmount)
        })
      });
      setIssueCustomerId(''); setIssueProductId(''); setIssueAmount('');
      alert("Product loan successfully recorded.");
      // Note: This API updates 'LoanApplications'. The right-side table shows cash 'Loans'. 
      // If you want product loans shown there, that table will need an update.
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
        <div className="space-y-4">
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              1. Register
            </button>
            <button
              onClick={() => setActiveTab('issue')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'issue' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              2. Issue Product
            </button>
          </div>

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterCustomer} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-bold text-slate-800 text-base">Register Walk-in Customer</h3>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">FIRST NAME</label>
                <input type="text" placeholder="e.g. John" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">LAST NAME</label>
                <input type="text" placeholder="e.g. Doe" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">PHONE NUMBER</label>
                <input type="text" placeholder="e.g. +254 700 000 000" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">INITIAL LOAN LIMIT (KSh)</label>
                <input type="number" min="0" placeholder="Optional limit" value={loanLimit} onChange={e => setLoanLimit(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
              </div>
              <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-50">
                Register Customer
              </button>
            </form>
          )}

          {activeTab === 'issue' && (
            <form onSubmit={handleIssueProduct} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-bold text-slate-800 text-base">Issue Product Loan</h3>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SELECT CUSTOMER</label>
                <select value={issueCustomerId} onChange={e => setIssueCustomerId(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500">
                  <option value="">Choose registered profile...</option>
                  {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">SELECT PRODUCT</label>
                <select value={issueProductId} onChange={e => {
                  setIssueProductId(e.target.value);
                  const p = products.find(prod => prod.product_id == e.target.value);
                  if (p) setIssueAmount(p.price);
                }} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500">
                  <option value="">Choose product...</option>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name} (KSh {p.price})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">LOAN AMOUNT (KSh)</label>
                <input type="number" min="0" placeholder="Defaults to product price" value={issueAmount} onChange={e => setIssueAmount(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" />
              </div>
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md">
                Issue Product
              </button>
            </form>
          )}
        </div>

        {/* Real-time Open Credit Registry Row */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-3">Active Customer Credit Lines</h3>
            <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto pr-1">
              {activeApplications.length === 0 ? (
                <p className="text-sm text-slate-400 pt-4 text-center">No open active debt positions registered.</p>
              ) : (
                activeApplications.map(l => (
                  <div key={l.application_id} className="flex justify-between items-center py-3 text-sm">
                    <div>
                      <p className="font-bold text-slate-700">{l.customer?.first_name} {l.customer?.last_name}</p>
                      <p className="text-xs text-slate-400">{l.product?.product_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800">KSh {l.balance_remaining?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}