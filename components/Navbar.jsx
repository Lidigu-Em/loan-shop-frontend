import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, PackageSearch, ClipboardList, Wallet } from 'lucide-react';

export default function Navbar({ setCurrentPage, currentPage, role }) {
    const adminLinks = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Control Panel' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'products', icon: PackageSearch, label: 'Product Catalog' },
        { id: 'approvals', icon: ClipboardList, label: 'Loan Approvals' },
        { id: 'repayments', icon: Wallet, label: 'Repayments' },
        { id: 'reports', icon: FileText, label: 'Ledger Reports' },
        { id: 'profile', icon: Settings, label: 'Preferences' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        window.location.reload();
    };

    return (
        <nav className="fixed md:relative top-0 w-full md:w-64 h-16 md:h-screen bg-white md:bg-slate-900 border-b md:border-r border-slate-200 md:border-slate-800 z-50 flex md:flex-col justify-between shadow-sm md:shadow-none">
            <div className="flex items-center px-6 h-16 md:h-20 shrink-0 md:bg-slate-950/50">
                <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-black flex items-center justify-center mr-3 shadow-md shadow-sky-500/20">L</div>
                <span className="font-extrabold text-slate-800 md:text-white tracking-tight hidden md:block">Ledgerly CRM</span>
            </div>

            <div className="flex md:flex-col flex-1 overflow-x-auto md:overflow-hidden px-4 md:px-3 py-2 md:py-6 gap-2 md:gap-1 scrollbar-hide">
                {role === 'ADMIN' ? adminLinks.map(link => {
                    const Icon = link.icon;
                    const active = currentPage === link.id;
                    return (
                        <button
                            key={link.id}
                            onClick={() => setCurrentPage(link.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${active ? 'bg-sky-50 text-sky-600 md:bg-sky-500 md:text-white shadow-sm md:shadow-sky-500/20' : 'text-slate-500 md:text-slate-400 hover:bg-slate-50 md:hover:bg-slate-800/50 hover:text-slate-700 md:hover:text-slate-300'}`}
                        >
                            <Icon size={18} className={active ? 'text-sky-600 md:text-white' : 'text-slate-400 md:text-slate-500'} />
                            <span className="hidden md:block">{link.label}</span>
                        </button>
                    )
                }) : (
                    <button
                        onClick={() => setCurrentPage('customer_dash')}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-sky-50 text-sky-600 md:bg-sky-500 md:text-white shadow-sm`}
                    >
                        <PackageSearch size={18} />
                        <span className="hidden md:block">My Portal</span>
                    </button>
                )}
            </div>

            <div className="p-2 md:p-4 shrink-0 flex items-center h-16 md:h-auto border-l md:border-l-0 md:border-t border-slate-100 md:border-slate-800">
                <button onClick={handleLogout} className="flex items-center justify-center md:justify-start gap-3 w-full p-2 md:p-3 text-rose-500 hover:bg-rose-50 md:hover:bg-rose-500/10 rounded-xl font-bold transition-all">
                    <LogOut size={18} />
                    <span className="hidden md:block text-sm">Sign Out</span>
                </button>
            </div>
        </nav>
    );
}
