import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { TrendingUp, Users, AlertCircle, Printer, ClipboardList, RefreshCw, CreditCard, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('summary');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, a, r] = await Promise.all([
        apiClient('customers'),
        apiClient('applications'),
        apiClient('repayments'),
      ]);
      setCustomers(c || []);
      setApplications(a || []);
      setRepayments(r || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Derived metrics from live data
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);
  const activeDebtors = customers.filter(c => (c.outstanding_balance || 0) > 0).length;
  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const totalRepaid = repayments.reduce((sum, r) => sum + (r.amount_paid || 0), 0);


  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = `Ledgerly - ${tabs.find(t => t.id === activeReport)?.label} Transactions`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(11);
    doc.text(`Downloaded By: Admin`, 14, 23);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 30);

    let head = [];
    let body = [];

    if (activeReport === 'summary') {
      head = [['CUSTOMER', 'PHONE', 'ALLOCATED LIMIT', 'OUTSTANDING', 'STATUS']];
      body = customers.map(c => [
        `${c.first_name} ${c.last_name}`,
        c.phone_number || '—',
        Number(c.maximum_loan_limit || 0).toLocaleString(),
        Number(c.outstanding_balance || 0).toLocaleString(),
        c.status
      ]);
    } else if (activeReport === 'loans') {
      head = [['CUSTOMER', 'PRODUCT', 'AMOUNT (KSh)', 'STATUS', 'DATE']];
      body = applications.map(a => [
        `${a.customer?.first_name || ''} ${a.customer?.last_name || ''}`,
        a.product?.product_name || '—',
        Number(a.requested_amount).toLocaleString(),
        a.status,
        a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'
      ]);
    } else if (activeReport === 'customers') {
      head = [['CUSTOMER', 'PHONE', 'LIMIT (KSh)', 'OUTSTANDING (KSh)']];
      body = customers.map(c => [
        `${c.first_name} ${c.last_name}`,
        c.phone_number || '—',
        Number(c.maximum_loan_limit || 0).toLocaleString(),
        Number(c.outstanding_balance || 0).toLocaleString()
      ]);
    } else if (activeReport === 'repayments') {
      head = [['CUSTOMER', 'PRODUCT', 'DATE', 'CHANNEL', 'AMOUNT (KSh)']];
      body = repayments.map(r => {
        const cust = r.application?.customer ?? r.loanApplication?.customer;
        const prod = r.application?.product ?? r.loanApplication?.product;
        const date = r.payment_date ?? r.paymentDate;
        const method = r.payment_method ?? r.paymentMethod;
        const paid = r.amount_paid ?? r.amountPaid ?? 0;
        return [
          cust ? `${cust.first_name ?? ''} ${cust.last_name ?? ''}`.trim() : '—',
          prod?.product_name ?? '—',
          date ? new Date(date).toLocaleDateString() : '—',
          method || '—',
          Number(paid).toLocaleString()
        ];
      });
    }

    autoTable(doc, {
      startY: 38,
      head: head,
      body: body,
    });
    doc.save(`Ledgerly_${activeReport}_Transactions.pdf`);
  };

  const handleDownloadExcel = () => {
    let exportData = [];

    if (activeReport === 'summary') {
      exportData = customers.map(c => ({
        'Customer': `${c.first_name} ${c.last_name}`,
        'Phone': c.phone_number || '—',
        'Allocated Limit': Number(c.maximum_loan_limit || 0),
        'Outstanding': Number(c.outstanding_balance || 0),
        'Status': c.status
      }));
    } else if (activeReport === 'loans') {
      exportData = applications.map(a => ({
        'Customer': `${a.customer?.first_name || ''} ${a.customer?.last_name || ''}`,
        'Product': a.product?.product_name || '—',
        'Amount (KSh)': Number(a.requested_amount),
        'Status': a.status,
        'Date': a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'
      }));
    } else if (activeReport === 'customers') {
      exportData = customers.map(c => ({
        'Customer': `${c.first_name} ${c.last_name}`,
        'Phone': c.phone_number || '—',
        'Limit (KSh)': Number(c.maximum_loan_limit || 0),
        'Outstanding (KSh)': Number(c.outstanding_balance || 0)
      }));
    } else if (activeReport === 'repayments') {
      exportData = repayments.map(r => {
        const cust = r.application?.customer ?? r.loanApplication?.customer;
        const prod = r.application?.product ?? r.loanApplication?.product;
        const date = r.payment_date ?? r.paymentDate;
        const method = r.payment_method ?? r.paymentMethod;
        const paid = r.amount_paid ?? r.amountPaid ?? 0;
        return {
          'Customer': cust ? `${cust.first_name ?? ''} ${cust.last_name ?? ''}`.trim() : '—',
          'Product': prod?.product_name ?? '—',
          'Date': date ? new Date(date).toLocaleDateString() : '—',
          'Channel': method || '—',
          'Amount (KSh)': Number(paid)
        };
      });
    }

    const ws = XLSX.utils.json_to_sheet([
      { A: 'Title', B: `Ledgerly - ${tabs.find(t => t.id === activeReport)?.label} Transactions` },
      { A: 'Downloaded By', B: `Admin` },
      { A: 'Date', B: new Date().toLocaleString() },
      {},
    ], { skipHeader: true });

    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A5' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Ledgerly_${activeReport}_Transactions.xlsx`);
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: TrendingUp },
    { id: 'loans', label: 'Loan Applications', icon: ClipboardList },
    { id: 'customers', label: 'Customer Balances', icon: Users },
    { id: 'repayments', label: 'Repayments', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Financial Insights</h2>
          <p className="text-sm text-slate-400">Live report across customers, applications, and repayments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-sky-500 hover:border-sky-300 transition-all">
            <RefreshCw size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500 mr-1">Download:</span>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-sky-500/20">
              <Download size={15} /> PDF
            </button>
            <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/20">
              <Download size={15} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Outstanding', value: `KSh ${totalOutstanding.toLocaleString()}`, color: 'sky', icon: TrendingUp },
          { label: 'Active Debtors', value: activeDebtors, color: 'emerald', icon: Users },
          { label: 'Pending Approvals', value: pendingCount, color: 'amber', icon: AlertCircle },
          { label: 'Approved Loans', value: approvedCount, color: 'blue', icon: ClipboardList },
          { label: 'Total Repaid', value: `KSh ${totalRepaid.toLocaleString()}`, color: 'violet', icon: CreditCard },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg bg-${m.color}-50 flex items-center justify-center text-${m.color}-500`}>
                <Icon size={16} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{m.label}</p>
              <p className="text-lg font-black text-slate-800 leading-none">{loading ? '…' : m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tab selector (hidden on print) */}
      <div className="flex gap-2 flex-wrap print:hidden">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveReport(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeReport === t.id
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-300'
                }`}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Print header (shows on print only) */}
      <div className="hidden print:block border-b pb-3 mb-4">
        <h1 className="text-2xl font-black text-slate-900">Ledgerly — {tabs.find(t => t.id === activeReport)?.label} Report</h1>
        <p className="text-xs text-slate-500">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Report Tables */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* SUMMARY */}
          {activeReport === 'summary' && (
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                <th className="p-4">CUSTOMER</th><th className="p-4">PHONE</th><th className="p-4 text-right">ALLOCATED LIMIT</th><th className="p-4 text-right">OUTSTANDING</th><th className="p-4 text-center">STATUS</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{c.first_name} {c.last_name}</td>
                    <td className="p-4 text-slate-500">{c.phone_number || '—'}</td>
                    <td className="p-4 text-right font-semibold">{Number(c.maximum_loan_limit || 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-black text-rose-600">{Number(c.outstanding_balance || 0).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No customers found.</td></tr>}
              </tbody>
            </table>
          )}

          {/* LOAN APPLICATIONS */}
          {activeReport === 'loans' && (
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                <th className="p-4">CUSTOMER</th><th className="p-4">PRODUCT</th><th className="p-4 text-right">AMOUNT</th><th className="p-4 text-center">STATUS</th><th className="p-4">DATE</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map(a => (
                  <tr key={a.application_id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{a.customer?.first_name} {a.customer?.last_name}</td>
                    <td className="p-4 text-slate-500">{a.product?.product_name || '—'}</td>
                    <td className="p-4 text-right font-black text-sky-600">KSh {Number(a.requested_amount).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${a.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-600'
                        }`}>{a.status}</span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {applications.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No applications found.</td></tr>}
              </tbody>
            </table>
          )}

          {/* CUSTOMER BALANCES */}
          {activeReport === 'customers' && (
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                <th className="p-4">CUSTOMER</th><th className="p-4">PHONE</th><th className="p-4 text-right">LIMIT (KSh)</th><th className="p-4 text-right">OUTSTANDING (KSh)</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{c.first_name} {c.last_name}</td>
                    <td className="p-4 text-slate-500">{c.phone_number || '—'}</td>
                    <td className="p-4 text-right font-semibold">{Number(c.maximum_loan_limit || 0).toLocaleString()}</td>
                    <td className="p-4 text-right font-black text-rose-600">{Number(c.outstanding_balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400">No customers found.</td></tr>}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-black text-slate-800 text-sm border-t border-slate-200">
                  <td className="p-4" colSpan={3}>Total Outstanding</td>
                  <td className="p-4 text-right text-rose-600">KSh {totalOutstanding.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* REPAYMENTS */}
          {activeReport === 'repayments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead><tr className="bg-slate-50 text-slate-400 text-xs font-bold border-b border-slate-100">
                  <th className="p-4">CUSTOMER</th>
                  <th className="p-4">PRODUCT</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4">CHANNEL</th>
                  <th className="p-4 text-right">AMOUNT (KSh)</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {repayments.map(r => {
                    const cust = r.application?.customer ?? r.loanApplication?.customer;
                    const prod = r.application?.product ?? r.loanApplication?.product;
                    const date = r.payment_date ?? r.paymentDate;
                    const method = r.payment_method ?? r.paymentMethod;
                    const paid = r.amount_paid ?? r.amountPaid ?? 0;
                    return (
                      <tr key={r.repayment_id ?? r.repaymentId} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-700">
                          {cust ? `${cust.first_name ?? ''} ${cust.last_name ?? ''}`.trim() : '—'}
                        </td>
                        <td className="p-4 text-slate-500">{prod?.product_name ?? '—'}</td>
                        <td className="p-4 text-slate-500 text-xs">{date ? new Date(date).toLocaleDateString() : '—'}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-xs font-bold text-slate-700">{method || '—'}</span>
                        </td>
                        <td className="p-4 text-right font-black text-emerald-600">KSh {Number(paid).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {repayments.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No repayments recorded yet.</td></tr>}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-black text-slate-800 text-sm border-t border-slate-200">
                    <td className="p-4" colSpan={4}>Total Collected</td>
                    <td className="p-4 text-right text-emerald-600">KSh {totalRepaid.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
}