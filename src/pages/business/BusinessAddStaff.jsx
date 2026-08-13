import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiBriefcase, FiLock, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BusinessAddStaff = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const businessId = currentUser.businessId?._id || currentUser.businessId;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    counterId: '',
    username: '',
    password: '',
    confirmPassword: '',
    permissions: {
      canCallNext: true,
      canSkip: true,
      canRecall: true,
      canComplete: true,
      canStartBreak: true,
      canViewQueue: true
    }
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      if (!payload.counterId) delete payload.counterId;

      const response = await fetch(`${API_URL}/staff/business/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Staff created! Employee ID: ${data.employeeId}`);
        navigate('/business/staff');
      } else {
        toast.error(data.message || 'Failed to create staff');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <button 
          onClick={() => navigate('/business/staff')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Staff</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create a new staff account and assign their counter.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Employment Info */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiUser className="text-primary" /> Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Employment Info */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiBriefcase className="text-primary" /> Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Designation</label>
              <input type="text" name="designation" placeholder="e.g. Cashier, Consultant" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Login Details */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiLock className="text-primary" /> Login Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username *</label>
              <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password *</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiShield className="text-primary" /> Staff Permissions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(formData.permissions).map(key => (
              <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                <input 
                  type="checkbox" 
                  name={key}
                  checked={formData.permissions[key]} 
                  onChange={handlePermissionChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/business/staff')} className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Staff Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessAddStaff;
