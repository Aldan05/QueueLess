import React from 'react';
import { FiMenu, FiSearch, FiBell, FiCheckCircle, FiClock, FiXCircle, FiShield } from 'react-icons/fi';
import NotificationDropdown from '../common/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

const BusinessNavbar = ({ onOpenSidebar }) => {
  const { currentUser } = useAuth();
  const { businesses } = useDatabase();

  const business = businesses.find(b => 
    b._id === currentUser?.businessId || 
    b.userId === currentUser?._id || 
    b.email === currentUser?.email || 
    b.ownerEmail === currentUser?.email
  );

  const businessName = business?.name || currentUser?.name || 'Business Portal';
  const logoObj = business?.docLogo;
  const logoSrc = typeof logoObj === 'string' ? logoObj : (logoObj?.content || logoObj?.url);

  // Dynamic verification badge
  const renderVerificationBadge = () => {
    if (!business) return null;

    if (business.verificationStatus === 'Approved' || business.isVerified) {
      return (
        <div className="hidden sm:flex items-center bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200/80 text-xs font-black uppercase tracking-wider">
          <FiCheckCircle className="mr-1.5 text-emerald-600 dark:text-emerald-400 w-4 h-4" /> Verified Business
        </div>
      );
    }
    if (business.verificationStatus === 'Pending Review' || business.verificationStatus === 'Pending Update Review') {
      return (
        <div className="hidden sm:flex items-center bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-200/80 text-xs font-black uppercase tracking-wider animate-pulse">
          <FiClock className="mr-1.5 text-amber-600 w-4 h-4" /> Verification Pending
        </div>
      );
    }
    if (business.verificationStatus === 'Rejected') {
      return (
        <div className="hidden sm:flex items-center bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-3 py-1.5 rounded-xl border border-rose-200/80 text-xs font-black uppercase tracking-wider">
          <FiXCircle className="mr-1.5 text-rose-600 w-4 h-4" /> Verification Rejected
        </div>
      );
    }
    return (
      <div className="hidden sm:flex items-center bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1.5 rounded-xl border border-blue-200/80 text-xs font-black uppercase tracking-wider">
        <FiShield className="mr-1.5 text-blue-600 w-4 h-4" /> Registered Business
      </div>
    );
  };

  return (
    <div className="h-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-sm transition-colors">
      
      {/* Left side */}
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        
        {/* Verification Badge */}
        {renderVerificationBadge()}
      </div>

      {/* Right side */}
      <div className="flex items-center justify-end space-x-3 sm:space-x-5 flex-1">
        
        {/* Global Search */}
        <div className="hidden md:flex items-center relative group">
          <FiSearch className="absolute left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search customers, tokens..." 
            className="w-64 pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

        {/* Notifications */}
        <NotificationDropdown audienceRole="Businesses" />

        {/* Dynamic Business User Profile */}
        <div className="flex items-center space-x-3 pl-2 pr-1 py-1 rounded-xl">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
              {businessName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-400 font-semibold mt-1">
              {currentUser?.role === 'Business' ? 'Admin' : (currentUser?.role || 'Admin')}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 overflow-hidden shrink-0 border border-blue-200 dark:border-slate-600">
            {logoSrc ? (
              <img src={logoSrc} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              businessName.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessNavbar;
