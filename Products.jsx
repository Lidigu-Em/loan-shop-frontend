import React, { useState, useEffect } from 'react';
import { apiClient } from './apiClient';
import { PackageSearch, Plus, Tag } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [maximumLoanAmount, setMaximumLoanAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await apiClient('products');
            setProducts(data || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!productName || !price) return;

        try {
            await apiClient('products', {
                method: 'POST',
                body: JSON.stringify({
                    product_name: productName,
                    description,
                    category,
                    price: parseFloat(price),
                    maximum_loan_amount: parseFloat(maximumLoanAmount) || parseFloat(price),
                    interest_rate: parseFloat(interestRate) || 0,
                    repayment_period_months: parseInt(repaymentPeriodMonths) || 12
                })
            });
            setProductName(''); setDescription(''); setCategory(''); setPrice('');
            setMaximumLoanAmount(''); setInterestRate(''); setRepaymentPeriodMonths('');
            fetchProducts();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800">Product Catalog</h2>
                <p className="text-sm text-slate-400">Manage available loan products and borrowing limits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Create Product Form */}
                <form onSubmit={handleCreateProduct} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Plus size={16} /></div>
                        <h3 className="font-bold text-slate-800 text-sm">Add New Product</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">PRODUCT NAME *</label>
                        <input type="text" value={productName} onChange={e => setProductName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="e.g. Smartphone" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">CATEGORY</label>
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="e.g. Electronics" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">CASH PRICE (KSh) *</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="50000" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">MAX LOAN</label>
                            <input type="number" value={maximumLoanAmount} onChange={e => setMaximumLoanAmount(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="40000" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">INTEREST (%)</label>
                            <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="12" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">REPAYMENT PERIOD (MONTHS)</label>
                        <input type="number" value={repaymentPeriodMonths} onChange={e => setRepaymentPeriodMonths(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500" placeholder="12" />
                    </div>
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-sky-50">
                        Publish Product
                    </button>
                </form>

                {/* Product Registry Row */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2"><PackageSearch size={16} /> Available Catalog</h3>
                    </div>
                    <div className="overflow-x-auto p-4">
                        {loading ? (
                            <p className="text-sm text-slate-400 text-center py-10">Syncing database...</p>
                        ) : products.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-10">No items registered in the database catalog.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {products.map(p => (
                                    <div key={p.product_id} className="border border-slate-100 rounded-xl p-4 hover:border-sky-200 transition-colors shadow-sm bg-slate-50/20">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{p.product_name}</h4>
                                                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1"><Tag size={10} /> {p.category || 'Uncategorized'}</span>
                                            </div>
                                            <span className="font-black text-slate-800">KSh {p.price}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1 mt-3">
                                            <p>Max Assignable: <span className="font-semibold text-slate-700">KSh {p.maximum_loan_amount}</span></p>
                                            <p>Interest Line: <span className="font-semibold text-rose-500">{p.interest_rate}%</span></p>
                                            <p>Term Duration: <span className="font-semibold text-slate-700">{p.repayment_period_months} Months</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
