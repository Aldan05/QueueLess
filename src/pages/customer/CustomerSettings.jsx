import { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiShield, FiMoon, FiTrash2, FiSave, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/auth/business-registration/InputField';
import toast from 'react-hot-toast';

const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between mt-4 first:mt-0">
    <div>
      <p className="font-bold text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const CustomerSettings = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    theme: 'light'
  });
  
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.preferences) {
      setPreferences(prev => ({ ...prev, ...currentUser.preferences }));
    }
  }, [currentUser]);

  // Instantly apply theme when toggled in settings before saving
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = { preferences };
      if (passwords.newPassword) {
        if (!passwords.oldPassword) {
          throw new Error('Please enter your current password to set a new one.');
        }
        updateData.oldPassword = passwords.oldPassword;
        updateData.newPassword = passwords.newPassword;
      }
      await updateProfile(updateData);
      setPasswords({ oldPassword: '', newPassword: '' });
      toast.success('Settings saved successfully!', { icon: '⚙️' });
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-100 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
            <FiSettings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage your preferences, security, and account status
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Notifications Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <FiBell className="text-blue-500" /> Notification Preferences
          </h2>
          
          <ToggleSwitch 
            label="Email Alerts" 
            description="Receive queue updates via email"
            checked={preferences.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <ToggleSwitch 
            label="Push Notifications" 
            description="Get browser notifications for updates"
            checked={preferences.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
          />
          <ToggleSwitch 
            label="Marketing Emails" 
            description="Receive promotional offers and news"
            checked={preferences.marketingEmails}
            onChange={() => handleToggle('marketingEmails')}
          />
        </div>

        {/* Appearance & Security Section */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <FiMoon className="text-indigo-500" /> Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme across the app</p>
              </div>
              <button 
                onClick={() => setPreferences(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <FiLock className="text-green-500" /> Change Password
            </h2>
            <div className="space-y-4">
              <InputField
                label="Current Password"
                id="oldPassword"
                type="password"
                placeholder="Enter current password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                icon={FiLock}
              />
              <InputField
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                icon={FiLock}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all
            ${isSaving 
              ? 'bg-primary/70 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
            }
          `}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerSettings;
