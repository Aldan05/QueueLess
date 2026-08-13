import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSave, FiMapPin, FiClock, FiUser, FiBriefcase, FiAlertCircle, FiImage, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

const BusinessProfile = () => {
  const { businesses, fetchBusinesses } = useDatabase();
  const { currentUser } = useAuth();
  
  const business = businesses.find(b => b._id === currentUser?.businessId);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    openingTime: '',
    closingTime: '',
    workingDays: '',
    avgServiceTime: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        category: business.category || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        pinCode: business.pinCode || '',
        ownerName: business.ownerName || '',
        ownerEmail: business.ownerEmail || '',
        ownerMobile: business.ownerMobile || '',
        openingTime: business.openingTime || '',
        closingTime: business.closingTime || '',
        workingDays: business.workingDays || 'Mon-Fri',
        avgServiceTime: business.avgServiceTime || '15'
      });
    }
  }, [business]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        fetchBusinesses(); // Refresh global business state
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (error) {
      console.error("BusinessProfile Save Error:", error);
      toast.error('Server error while saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!business) return null;

  return (
    <div className="space-y-8 pb-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Business Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your public information and operating hours.</p>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all text-white ${
            isSaving ? 'bg-blue-400 cursor-wait' : 'bg-primary hover:bg-blue-600 hover:shadow-md'
          }`}
        >
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
          ) : (
            <><FiSave /> Save Changes</>
          )}
        </button>
      </div>

      {!business.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 text-yellow-800 font-medium">
          <FiAlertCircle className="w-6 h-6 shrink-0 text-yellow-600" />
          <p>
            Your business is currently <strong>Not Verified</strong>. Updating your profile information accurately helps speed up the verification process. Please head to the Verification tab once you've saved your details.
          </p>
        </div>
      )}

      {/* Business Logo & Brand Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          
          <div className="flex items-center gap-3">
            {/* Live Active Logo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner shrink-0 relative">
                {(() => {
                  const liveLogo = business.docLogo;
                  const logoSrc = typeof liveLogo === 'string' ? liveLogo : (liveLogo?.content || liveLogo?.url);
                  return logoSrc ? (
                    <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-gray-400">{business.name?.charAt(0) || '🏢'}</span>
                  );
                })()}
              </div>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Live Logo</span>
            </div>

            {/* Pending Updated Logo (if submitted) */}
            {business.pendingDocs?.docLogo && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center overflow-hidden shadow-sm shrink-0 relative ring-2 ring-amber-400/50 animate-pulse">
                  {(() => {
                    const pendingLogo = business.pendingDocs.docLogo;
                    const pendingSrc = typeof pendingLogo === 'string' ? pendingLogo : (pendingLogo?.content || pendingLogo?.url);
                    return pendingSrc ? (
                      <img src={pendingSrc} alt="Pending Update" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">⏳</span>
                    );
                  })()}
                </div>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1 uppercase tracking-wider">Pending</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{business.name}</h3>
              {business.isVerified && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-black uppercase rounded-full tracking-wider">
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {business.docLogo ? 'Official Business Logo active' : 'No custom logo uploaded yet'}
            </p>
            {business.pendingDocs?.docLogo && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  ⚡ New Logo Update is Pending Admin Approval. Old logo remains live until approved.
                </span>
              </div>
            )}
          </div>
        </div>

        <Link
          to="/business/documents"
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors text-sm shadow-sm"
        >
          <FiImage className="w-4 h-4 text-blue-500" />
          Update Logo / Documents
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiBriefcase className="text-blue-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 text-lg">Business Details</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Business Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white">
                <option value="">Select Category...</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Banking">Banking</option>
                <option value="Retail">Retail</option>
                <option value="Government">Government</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiMapPin className="text-red-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 text-lg">Location</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-bold text-gray-700">Street Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">State / Province</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">ZIP / PIN Code</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiClock className="text-orange-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 text-lg">Operating Hours & Queue Setup</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Opening Time</label>
              <input type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Closing Time</label>
              <input type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Working Days</label>
              <select name="workingDays" value={formData.workingDays} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white">
                <option value="Mon-Fri">Monday - Friday</option>
                <option value="Mon-Sat">Monday - Saturday</option>
                <option value="Everyday">Everyday</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Est. Average Service Time (mins)</label>
              <input type="number" name="avgServiceTime" value={formData.avgServiceTime} onChange={handleChange} required min="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <FiUser className="text-green-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 text-lg">Owner / Admin Contact</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input type="tel" name="ownerMobile" value={formData.ownerMobile} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium" />
            </div>
          </div>
        </div>
        
      </form>
    </div>
  );
};

export default BusinessProfile;
