import React, { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiShield, FiMonitor, FiMoon, FiSave, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

const BusinessSettings = () => {
  const { currentUser, updateProfile } = useAuth();
  const { businesses } = useDatabase();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoApproveAppointments: true,
    darkMode: false,
    kioskMode: false,
    autoApproveAppointments: true,
    twoFactorAuth: false,
    twoFactorMethod: 'email',
    twoFactorContact: ''
  });

  const [verificationSettings, setVerificationSettings] = useState({
    requireVerification: false,
    requiredDocuments: ['Aadhaar Card'],
    verificationBy: ['Business Owner', 'Manager'],
    verificationMode: 'manual',
    maxVerificationTimeMins: 10,
    autoRejectAfterMins: 30
  });
  const [isSavingVerification, setIsSavingVerification] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.preferences) {
      setSettings(prev => ({
        ...prev,
        ...currentUser.preferences
      }));
    }
    
    if (currentUser?.businessId && businesses) {
      const bizId = currentUser.businessId?._id || currentUser.businessId;
      const business = businesses.find(b => b._id === bizId);
      if (business && business.verificationSettings) {
        setVerificationSettings(prev => ({
          ...prev,
          ...business.verificationSettings
        }));
      }
    }
  }, [currentUser, businesses]);

  // Instantly apply theme when toggled in settings before saving
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVerificationToggle = (key) => {
    setVerificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationSave = async () => {
    const bizId = currentUser?.businessId?._id || currentUser?.businessId;
    if (!bizId) return;
    setIsSavingVerification(true);
    try {
      const response = await fetch(`${API_URL}/businesses/${bizId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationSettings })
      });
      if (response.ok) {
        toast.success('Verification settings saved!');
      } else {
        toast.error('Failed to save verification settings');
      }
    } catch (error) {
      toast.error('Server error while saving verification settings');
    } finally {
      setIsSavingVerification(false);
    }
  };

  const handleSave = async () => {
    if (passwordData.newPassword) {
      if (!passwordData.oldPassword) {
        return toast.error('Current password is required to set a new password');
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return toast.error('New passwords do not match');
      }
      if (passwordData.newPassword.length < 6) {
        return toast.error('New password must be at least 6 characters');
      }
    }

    setIsSaving(true);
    try {
      const payload = { preferences: settings };
      if (passwordData.newPassword) {
        payload.oldPassword = passwordData.oldPassword;
        payload.newPassword = passwordData.newPassword;
      }

      await updateProfile(payload);
      toast.success('Settings saved successfully!');
      
      // Clear password fields on success
      if (passwordData.newPassword) {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl text-gray-900 dark:text-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Configure your dashboard preferences and system settings.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all text-white ${
            isSaving ? 'bg-blue-400 cursor-wait' : 'bg-primary hover:bg-blue-600 hover:shadow-md'
          }`}
        >
          {isSaving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
          ) : (
            <><FiSave /> Save Settings</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-700/50">
            <FiBell className="text-blue-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Notifications</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summaries and alerts via email.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">SMS Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get instant text messages for emergency tokens.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System & Display Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-700/50">
            <FiMonitor className="text-indigo-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">System & Display</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">Dark Mode <FiMoon className="text-gray-400"/></h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme for the business dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Kiosk Mode</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Optimize display for front-desk waiting rooms.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.kioskMode} onChange={() => handleToggle('kioskMode')} />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden md:col-span-2">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-700/50">
            <FiShield className="text-green-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Security & Automation</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Auto-Approve Appointments</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically approve all customer appointment requests during working hours without manual review.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 mt-1">
                <input type="checkbox" className="sr-only peer" checked={settings.autoApproveAppointments} onChange={() => handleToggle('autoApproveAppointments')} />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex flex-col justify-start">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Require an extra security code when logging into your business dashboard.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 mt-1 shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={settings.twoFactorAuth} onChange={() => handleToggle('twoFactorAuth')} />
                  <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {settings.twoFactorAuth && (
                <div className="mt-6 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-100 dark:border-slate-600 animate-fadeIn space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-3">Verification Method</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-white font-medium">
                        <input type="radio" name="twoFactorMethod" value="email" checked={settings.twoFactorMethod === 'email'} onChange={handleSettingChange} className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        Email
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-white font-medium">
                        <input type="radio" name="twoFactorMethod" value="phone" checked={settings.twoFactorMethod === 'phone'} onChange={handleSettingChange} className="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        Phone Number
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">
                      {settings.twoFactorMethod === 'email' ? 'Email Address for 2FA' : 'Phone Number for 2FA'}
                    </label>
                    <input 
                      type={settings.twoFactorMethod === 'email' ? "email" : "tel"}
                      name="twoFactorContact"
                      value={settings.twoFactorContact || ''}
                      onChange={handleSettingChange}
                      placeholder={settings.twoFactorMethod === 'email' ? "e.g., admin@business.com" : "e.g., +1234567890"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Queue Verification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden md:col-span-2">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FiShield className="text-orange-500 w-5 h-5" />
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Queue Verification Settings</h3>
            </div>
            <button 
              onClick={handleVerificationSave}
              disabled={isSavingVerification}
              className={`px-4 py-1.5 rounded-lg font-bold text-sm text-white ${isSavingVerification ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {isSavingVerification ? 'Saving...' : 'Save Verification'}
            </button>
          </div>
          <div className="p-8 space-y-8">
            {/* Enable toggle */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Enable Verification Before Queue Entry</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Require customers to upload ID proof and wait for approval before receiving a token.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4 mt-1 shrink-0">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={verificationSettings.requireVerification} 
                  onChange={() => handleVerificationToggle('requireVerification')} 
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {verificationSettings.requireVerification && (
              <div className="space-y-6 animate-fadeIn">
                {/* Required Documents */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Required Documents</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Employee ID', 'Student ID', 'Other'].map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={verificationSettings.requiredDocuments.includes(doc)}
                          onChange={(e) => {
                            const newDocs = e.target.checked 
                              ? [...verificationSettings.requiredDocuments, doc]
                              : verificationSettings.requiredDocuments.filter(d => d !== doc);
                            setVerificationSettings(prev => ({ ...prev, requiredDocuments: newDocs }));
                          }}
                          className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification By */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Verification By</h4>
                  <div className="flex gap-4">
                    {['Business Owner', 'Manager', 'Staff'].map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={verificationSettings.verificationBy.includes(role)}
                          onChange={(e) => {
                            const newRoles = e.target.checked 
                              ? [...verificationSettings.verificationBy, role]
                              : verificationSettings.verificationBy.filter(r => r !== role);
                            setVerificationSettings(prev => ({ ...prev, verificationBy: newRoles }));
                          }}
                          className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Mode */}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Verification Mode</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="verificationMode" value="manual"
                        checked={verificationSettings.verificationMode === 'manual'}
                        onChange={() => setVerificationSettings(prev => ({ ...prev, verificationMode: 'manual' }))}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500" 
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="verificationMode" value="automatic"
                        checked={verificationSettings.verificationMode === 'automatic'}
                        onChange={() => setVerificationSettings(prev => ({ ...prev, verificationMode: 'automatic' }))}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500" 
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatic</span>
                    </label>
                  </div>
                </div>

                {/* Timers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Maximum Verification Time (Minutes)</label>
                    <input 
                      type="number"
                      value={verificationSettings.maxVerificationTimeMins}
                      onChange={(e) => setVerificationSettings(prev => ({ ...prev, maxVerificationTimeMins: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Auto Reject After (Minutes)</label>
                    <input 
                      type="number"
                      value={verificationSettings.autoRejectAfterMins}
                      onChange={(e) => setVerificationSettings(prev => ({ ...prev, autoRejectAfterMins: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden md:col-span-2">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3 bg-gray-50/50 dark:bg-slate-700/50">
            <FiLock className="text-red-500 w-5 h-5" />
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Change Password</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white" 
                  placeholder="Enter current password"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white" 
                  placeholder="Enter new password"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium bg-white dark:bg-slate-900 text-gray-900 dark:text-white pr-12" 
                  placeholder="Confirm new password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BusinessSettings;
