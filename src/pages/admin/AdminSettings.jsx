import { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiShield, FiMoon, FiSave, FiGlobe, FiTool } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { currentUser, updateProfile } = useAuth();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newBusinessAlerts: true,
    complaintAlerts: true,
    theme: 'light'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.preferences) {
      setPreferences(currentUser.preferences);
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
      await updateProfile({ preferences });
      toast.success('Platform settings saved successfully!', { icon: '⚙️' });
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
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiSettings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Platform Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage global system settings and configurations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Global Notifications Section */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <FiBell className="text-blue-500" /> Admin Notifications
          </h2>
          
          <ToggleSwitch 
            label="System Email Alerts" 
            description="Receive critical system updates via email"
            checked={preferences.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <ToggleSwitch 
            label="New Business Alerts" 
            description="Get notified when a new business registers"
            checked={preferences.newBusinessAlerts}
            onChange={() => handleToggle('newBusinessAlerts')}
          />
          <ToggleSwitch 
            label="Complaint Alerts" 
            description="Get notified of urgent user complaints"
            checked={preferences.complaintAlerts}
            onChange={() => handleToggle('complaintAlerts')}
          />
        </div>

        {/* Appearance & System Section */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <FiMoon className="text-indigo-500" /> Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme across the admin panel</p>
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
              <FiTool className="text-orange-500" /> Maintenance Options
            </h2>
            <ToggleSwitch 
              label="Maintenance Mode" 
              description="Disable public access temporarily (coming soon)"
              checked={false}
              onChange={() => toast('Maintenance mode will be available in v2.0', { icon: '🚧' })}
            />
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

export default AdminSettings;
