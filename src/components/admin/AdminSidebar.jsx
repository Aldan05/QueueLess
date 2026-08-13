import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiShield, FiBriefcase, FiUsers, FiRadio, 
  FiPieChart, FiFolder, FiAlertCircle, FiActivity, 
  FiSettings, FiUser, FiLogOut, FiX 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const primaryNavItems = [
  { path: '/admin/dashboard', name: 'Dashboard', icon: FiHome },
  { path: '/admin/verification', name: 'Business Verification', icon: FiShield },
  { path: '/admin/businesses', name: 'Business Monitoring', icon: FiBriefcase },
  { path: '/admin/customers', name: 'Customer Management', icon: FiUsers },
];

const secondaryNavItems = [
  { path: '/admin/announcements', name: 'Announcements', icon: FiRadio },
  { path: '/admin/analytics', name: 'Reports & Analytics', icon: FiPieChart },
  { path: '/admin/documents', name: 'Document Verification', icon: FiFolder },
  { path: '/admin/complaints', name: 'Complaints & Support', icon: FiAlertCircle },
  { path: '/admin/logs', name: 'Activity Logs', icon: FiActivity },
];

const systemNavItems = [
  { path: '/admin/settings', name: 'Platform Settings', icon: FiSettings },
  { path: '/admin/profile', name: 'Admin Profile', icon: FiUser },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { businesses } = useDatabase();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const pendingCount = businesses.filter(b => b.verificationStatus === 'Pending Review' || b.verificationStatus === 'Documents Missing').length;

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-sm w-72">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white dark:text-gray-900 font-bold text-xl leading-none">Q</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Queue<span className="text-gray-500 dark:text-gray-400">Less</span>
          </span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase shadow-sm">
            Admin
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        
        <div>
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Core Operations
          </p>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.name}
                    {item.name === 'Business Verification' && pendingCount > 0 && (
                      <span className="ml-auto bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-[10px] font-black">
                        {pendingCount}
                      </span>
                    )}
                    {item.name === 'Business Monitoring' && (
                      <span className="ml-auto bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 py-0.5 px-2 rounded-full text-[10px] font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {businesses.filter(b => b.queueStatus === 'open' || (b.queueActive && b.queueStatus !== 'closed' && b.queueStatus !== 'paused')).length} Live
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Platform Management
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div>
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            System
          </p>
          <nav className="space-y-1">
            {systemNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {item.name}
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
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

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

      <div className="hidden lg:block fixed inset-y-0 left-0 z-0">
        {SidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;
