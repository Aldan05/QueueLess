import { FiMenu, FiSearch, FiBell, FiMapPin, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import NotificationDropdown from '../common/NotificationDropdown';

const CustomerNavbar = ({ onOpenSidebar }) => {
  return (
    <div className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      
      {/* Left side */}
      <div className="flex items-center flex-1">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        
        {/* Search Bar - Hidden on small screens */}
        <div className="hidden md:flex items-center max-w-md w-full relative">
          <FiSearch className="absolute left-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search businesses, categories..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 dark:bg-slate-800/80 border-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <div className="absolute right-2 top-2 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-400 dark:text-gray-300 shadow-sm">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-end space-x-3 sm:space-x-4 flex-1">
        
        <div className="hidden sm:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700">
          <FiMapPin className="mr-1.5 text-primary" />
          New York, NY
        </div>

        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <FiMoon className="w-5 h-5" />
        </button>

        <NotificationDropdown audienceRole="Customers" />

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

        {/* Profile Dropdown Trigger */}
        <button className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
          <img 
            src="https://ui-avatars.com/api/?name=Aldan&background=eff6ff&color=3b82f6" 
            alt="User profile" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="hidden md:flex flex-col items-start mr-1 text-left">
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">Aldan</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Premium User</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CustomerNavbar;
