import { useState, useEffect } from 'react';
import { FiSettings, FiMoon, FiSun, FiBell, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StaffSettings = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const [notifications, setNotifications] = useState({
    newCustomer: true,
    breakEnding: true,
    queueExceeds: false,
    managerMessages: true
  });

  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FiSettings className="text-blue-600" /> Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your preferences and application settings.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-8">
        
        {/* Appearance */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            {darkMode ? <FiMoon className="text-indigo-500" /> : <FiSun className="text-amber-500" />} Appearance
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Theme Mode</p>
              <p className="text-sm text-gray-500">Switch between light and dark mode</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <FiBell className="text-red-500" /> Notification Preferences
          </h2>
          <div className="space-y-3">
            {[
              { id: 'newCustomer', label: 'New Customer joined queue' },
              { id: 'breakEnding', label: 'Break time ending in 2 minutes' },
              { id: 'queueExceeds', label: 'Queue waiting time exceeds target' },
              { id: 'managerMessages', label: 'Manager assignments and messages' }
            ].map(item => (
              <label key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 cursor-pointer">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                <input 
                  type="checkbox" 
                  checked={notifications[item.id]} 
                  onChange={(e) => setNotifications({...notifications, [item.id]: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-600 focus:ring-offset-gray-900"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end">
          <button onClick={handleSave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-colors">
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};

export default StaffSettings;
