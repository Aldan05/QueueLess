import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMonitor, FiClock, FiCamera, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StaffProfile = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: currentStaff.phone || '********45',
    oldPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      const updates = { phone: formData.phone };
      if (formData.password) {
        if (!formData.oldPassword) {
          return toast.error('Old password is required to change password');
        }
        updates.password = formData.password;
        updates.oldPassword = formData.oldPassword;
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/staff/${currentStaff._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedStaff = await response.json();
        const merged = { ...currentStaff, ...updatedStaff };
        localStorage.setItem('currentStaff', JSON.stringify(merged));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleEditClick = () => {
    setFormData({
      phone: currentStaff.phone || '********45',
      oldPassword: '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUser className="text-blue-600" /> My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">View and update your personal information.</p>
        </div>
        {!isEditing && (
          <button onClick={handleEditClick} className="px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 font-bold rounded-xl transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Photo & Basics */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="relative mt-12 mb-6 inline-block">
            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full p-2 mx-auto relative z-10 shadow-xl">
              <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-black">
                {currentStaff.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStaff.fullName}</h2>
          <p className="text-gray-500 font-medium mb-4">{currentStaff.designation || 'Staff Member'}</p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300">
            ID: {currentStaff.employeeId}
          </div>
        </div>

        {/* Right Col: Details & Form */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4">Edit Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Old Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showOldPassword ? "text" : "password"} placeholder="Required if changing password" value={formData.oldPassword} onChange={(e) => setFormData({...formData, oldPassword: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white" />
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
                    {showOldPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password (optional)</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showNewPassword ? "text" : "password"} placeholder="Leave blank to keep current" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-colors">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4">Employment Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-500">
                    <FiMonitor />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Counter</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentStaff.counter?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-500">
                    <FiClock />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shift Timing</p>
                    <p className="font-semibold text-gray-900 dark:text-white">09:00 AM - 06:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-500">
                    <FiPhone />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-500">
                    <FiMail />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentStaff.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
