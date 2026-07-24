import React, { useState, useRef } from 'react';
import { Save, CheckCircle, Camera } from 'lucide-react';

export default function Profile() {
  const [shopName, setShopName] = useState('Biashara Retail Shop');
  const [currency, setCurrency] = useState('KSh');
  const [owner, setOwner] = useState('Brenda Akinyi');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80');
  const [saved, setSaved] = useState(false);
  
  // Create a reference to pull up the system file upload dialogue box
  const fileInputRef = useRef(null);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Convert local file selector upload data into a renderable local image URL path
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-1 md:p-0">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Business Profile Settings</h2>
        <p className="text-sm text-slate-400">Configure storefront identity tags and administrator profiles.</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        
        {/* Profile Picture with Edit Icon Overlay */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-50 pb-5 text-center sm:text-left">
          <div className="relative group cursor-pointer" onClick={triggerFileSelect}>
            <img 
              src={avatarUrl} 
              alt="Admin Profile Avatar" 
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-sky-50 shadow-sm shrink-0 transition-opacity group-hover:opacity-80"
            />
            {/* Hover Camera Icon Mask */}
            <div className="absolute inset-0 bg-slate-900/30 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} />
            </div>
            {/* Stationary Floating Action Edit Button badge */}
            <button 
              type="button"
              className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1.5 rounded-lg shadow-md border border-white hover:bg-sky-600 transition-all"
            >
              <Camera size={12} />
            </button>
          </div>

          {/* Native Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-lg">{owner ? owner : 'Store Admin'}</h3>
            <p className="text-xs text-slate-400 font-medium">Identity: <span className="text-sky-500 font-bold">{shopName}</span></p>
          </div>
        </div>

        {/* Action Status Toast */}
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle size={18} />
            Profile modifications updated successfully!
          </div>
        )}

        {/* Input Settings Matrix */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">OWNER NAME</label>
              <input type="text" value={owner} onChange={e => setOwner(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">REGISTERED SHOP NAME</label>
              <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500 font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">PRIMARY CURRENCY SYMBOL</label>
            <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-sky-500 font-medium" />
          </div>
        </div>

        <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-100">
          <Save size={16} />
          Save Changes
        </button>
      </form>
    </div>
  );
}