import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiClock, FiSettings, 
  FiLogOut, FiX, FiCheckCircle, FiBell, 
  FiUserPlus, FiHelpCircle, FiCalendar
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { useBusinessNotifications } from '../../hooks/useBusinessNotifications';
import { useNavBadges } from '../../hooks/useNavBadges';
import NavBadge from '../common/NavBadge';

const mainNavItems = [
  { path: '/business/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/business/queue', name: 'Queue Management', icon: FiClock },
  { path: '/business/customers', name: 'Customers', icon: FiUsers },
  { path: '/business/appointments', name: 'Appointments', icon: FiCalendar },
];

const workspaceNavItems = [
  { path: '/business/profile', name: 'Business Profile', icon: FiSettings },
  { path: '/business/staff', name: 'Staff Management', icon: FiUserPlus },
  { path: '/business/verification', name: 'Verification', icon: FiCheckCircle },
  { path: '/business/announcements', name: 'Announcements', icon: FiBell },
];

const bottomNavItems = [
  { path: '/business/notifications', name: 'Notifications', icon: FiBell },
  { path: '/business/settings', name: 'Settings', icon: FiSettings },
  { path: '/business/support', name: 'Help & Support', icon: FiHelpCircle },
];

const BusinessSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { unreadCount: announcementCount } = useUnreadNotifications('Businesses');
  const { unreadCount: liveNotifCount } = useBusinessNotifications();
  const badges = useNavBadges();

  const SidebarContent = (
    <div className="h-full flex flex-col bg-[#0B0F19] text-gray-300 w-72 shadow-2xl border-r border-gray-800">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/50 bg-[#0B0F19] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl leading-none">Q</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Queue<span className="text-blue-500">Less</span> <span className="text-xs font-medium text-gray-500 tracking-normal ml-1 border border-gray-700 rounded px-1.5 py-0.5">BIZ</span>
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
        {/* Overview Section */}
        <div>
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Overview
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-semibold' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    {item.name}
                    {item.name === 'Appointments' && <NavBadge count={badges.appointments} variant="dark" />}
                    {item.name === 'Queue Management' && <NavBadge count={badges.queue} variant="dark" />}
                    {isActive && (
                      <motion.div 
                        layoutId="biz-sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Workspace Section */}
        <div>
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Workspace
          </p>
          <nav className="space-y-1">
            {workspaceNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-semibold' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    {item.name}
                    {item.name === 'Announcements' && announcementCount > 0 && (
                      <NavBadge count={announcementCount} variant="dark" />
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="biz-sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Section */}
        <div>
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            System
          </p>
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-semibold' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    {item.name}
                    {item.name === 'Notifications' && liveNotifCount > 0 && (
                      <NavBadge count={liveNotifCount} variant="dark" />
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="biz-sidebar-active"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full"
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
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-500 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors group"
        >
          <FiLogOut className="w-5 h-5 mr-3 text-gray-600 group-hover:text-red-400 transition-colors" />
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

export default BusinessSidebar;
