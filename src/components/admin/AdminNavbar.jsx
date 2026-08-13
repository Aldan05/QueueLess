import { FiMenu, FiSearch, FiBell, FiMoon, FiUser } from 'react-icons/fi';
import NotificationDropdown from '../common/NotificationDropdown';

const AdminNavbar = ({ onOpenSidebar }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="h-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
      
      {/* Left side */}
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        
        {/* Date Display */}
        <div className="hidden lg:block text-sm font-bold text-gray-500 dark:text-gray-400">
          {currentDate}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-end space-x-2 sm:space-x-4 flex-1">
        
        {/* Global Search */}
        <div className="hidden md:flex items-center relative group">
          <FiSearch className="absolute left-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search businesses, users, logs..." 
            className="w-72 pl-10 pr-4 py-2 bg-gray-50/80 dark:bg-slate-800 border border-transparent focus:border-gray-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-gray-100 dark:focus:ring-slate-800 rounded-lg text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block mx-2"></div>

        {/* Action Buttons */}
        <button className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <FiMoon className="w-5 h-5" />
        </button>

        <NotificationDropdown audienceRole="Admin" />

        {/* Profile Dropdown Trigger */}
        <button className="flex items-center space-x-2 p-1.5 ml-1 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
          <div className="w-9 h-9 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center font-bold shadow-sm">
            <FiUser className="w-4 h-4" />
          </div>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">Super Admin</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Platform Control</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
