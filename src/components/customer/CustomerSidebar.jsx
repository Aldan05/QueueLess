import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiSearch, FiList, FiCalendar, FiClock, 
  FiHeart, FiBell, FiUser, FiSettings, FiLogOut, FiX, FiHelpCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { useNavBadges } from '../../hooks/useNavBadges';
import NavBadge from '../common/NavBadge';

const navItems = [
  { path: '/customer/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/customer/find', name: 'Find Businesses', icon: FiSearch },
  { path: '/customer/queue', name: 'My Queue', icon: FiList },
  { path: '/customer/appointments', name: 'Appointments', icon: FiCalendar },
  { path: '/customer/history', name: 'Queue History', icon: FiClock },
];

const bottomNavItems = [
  { path: '/customer/notifications', name: 'Notifications', icon: FiBell },
  { path: '/customer/profile', name: 'My Profile', icon: FiUser },
  { path: '/customer/settings', name: 'Settings', icon: FiSettings },
  { path: '/customer/support', name: 'Help & Support', icon: FiHelpCircle },
];

const CustomerSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { unreadCount: announcementCount } = useUnreadNotifications('Customers');
  const { unreadCount: liveNotifCount } = useLiveNotifications();
  const badges = useNavBadges();

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 shadow-sm w-72">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl leading-none">Q</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Queue<span className="text-primary">Less</span>
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50/80 dark:bg-blue-900/30 text-primary' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.name}
                    {item.name === 'Appointments' && <NavBadge count={badges.appointments} />}
                    {item.name === 'My Queue' && <NavBadge count={badges.queue} />}
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
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
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Account
          </p>
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50/80 dark:bg-blue-900/30 text-primary' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.name}
                    {item.name === 'Notifications' && liveNotifCount > 0 && (
                      <NavBadge count={liveNotifCount} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
        >
          <FiLogOut className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={logout} 
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
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
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

export default CustomerSidebar;
