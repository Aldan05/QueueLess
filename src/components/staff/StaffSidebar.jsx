import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiList, FiUsers, FiCalendar, 
  FiBell, FiUser, FiSettings, FiLogOut, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import { useNavBadges } from '../../hooks/useNavBadges';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import NavBadge from '../common/NavBadge';

const navItems = [
  { path: '/staff/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/staff/queue', name: 'Queue Management', icon: FiList },
  { path: '/staff/appointments', name: 'Appointments', icon: FiCalendar },
  { path: '/staff/customers', name: 'Customer History', icon: FiUsers },
  { path: '/staff/schedule', name: 'My Schedule', icon: FiCalendar },
];

const bottomNavItems = [
  { path: '/staff/notifications', name: 'Notifications', icon: FiBell },
  { path: '/staff/profile', name: 'My Profile', icon: FiUser },
  { path: '/staff/settings', name: 'Settings', icon: FiSettings },
];

const StaffSidebar = ({ isOpen, onClose, onLogout }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { unreadCount: liveNotifCount } = useLiveNotifications();
  const badges = useNavBadges();

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#0B0F19] text-gray-700 dark:text-gray-300 w-72 shadow-2xl border-r border-gray-200 dark:border-gray-800">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800/50 sticky top-0 z-10 bg-white dark:bg-[#0B0F19]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl leading-none">Q</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Queue<span className="text-blue-600">Less</span>
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        
        <div>
          <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                    {item.name}
                    {item.name === 'Appointments' && <NavBadge count={badges.appointments} />}
                    {item.name === 'Queue Management' && <NavBadge count={badges.queue} />}
                    {isActive && (
                      <motion.div 
                        layoutId="staff-sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div>
          <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Account
          </p>
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                    {item.name}
                    {item.name === 'Notifications' && liveNotifCount > 0 && <NavBadge count={liveNotifCount} />}
                    {isActive && (
                      <motion.div 
                        layoutId="staff-sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1.5 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors group"
        >
          <FiLogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          onLogout();
        }} 
      />
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            {SidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-0">
        {SidebarContent}
      </div>
    </>
  );
};

export default StaffSidebar;
