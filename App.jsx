import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Customers from './Customers';
import Products from './Products';
import LoanApprovals from './LoanApprovals';
import Repayments from './Repayments';
import Reports from './Reports';
import Profile from './Profile';
import Navbar from './components/Navbar';
import CustomerPortal from './CustomerPortal';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      const decoded = decodeJwt(jwt);
      if (decoded) {
        setSession({ access_token: jwt });
        setRole(decoded.role || 'CUSTOMER'); // Fallback if missing
      } else {
        localStorage.removeItem('jwt');
      }
    }
  }, []);

  if (!session) return <Login setSession={(s) => {
    setSession(s);
    if (s && s.access_token) {
      const decoded = decodeJwt(s.access_token);
      setRole(decoded?.role || 'CUSTOMER');
    }
  }} />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} role={role} />
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-64 min-h-screen transition-all">
        {role === 'ADMIN' ? (
          <>
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'customers' && <Customers />}
            {currentPage === 'products' && <Products />}
            {currentPage === 'approvals' && <LoanApprovals />}
            {currentPage === 'repayments' && <Repayments />}
            {currentPage === 'reports' && <Reports />}
            {currentPage === 'profile' && <Profile />}
          </>
        ) : (
          <CustomerPortal />
        )}
      </main>
    </div>
  );
}