import React, { useState, useEffect } from 'react';
import { 
  FiBriefcase, FiSearch, FiMoreVertical, FiMapPin, FiActivity, 
  FiRefreshCw, FiCheckCircle, FiClock, FiUsers, FiShield, 
  FiTrash2, FiEye, FiXCircle, FiCheck, FiExternalLink, FiStar, FiAlertCircle,
  FiPhone, FiPhoneCall, FiCopy, FiMail, FiSmartphone, FiPlay, FiPause, FiLock,
  FiSun, FiMoon, FiCalendar, FiGrid, FiList, FiSliders, FiCheckSquare,
  FiDownload, FiFileText, FiPrinter
} from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { generateBusinessQueueReport } from '../../utils/generateBusinessQueueReport';
import toast from 'react-hot-toast';

// Helper to parse time string like "09:00 AM" into minutes from midnight for schedule calculations
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) hours += 12;
      else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
  } catch (e) {}
  return null;
};

// Check if current time is within business opening and closing hours
const getBusinessScheduleStatus = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) {
    return {
      isOpenHours: true,
      label: 'Standard Hours',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50'
    };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMins = parseTimeToMinutes(openingTime);
  const closeMins = parseTimeToMinutes(closingTime);

  if (openMins === null || closeMins === null) {
    return {
      isOpenHours: true,
      label: `${openingTime} - ${closingTime}`,
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/50'
    };
  }

  // Handle standard daytime schedule or overnight schedule
  let isWithinHours = false;
  if (closeMins > openMins) {
    isWithinHours = currentMinutes >= openMins && currentMinutes <= closeMins;
  } else {
    // Overnight (e.g. 8 PM to 4 AM)
    isWithinHours = currentMinutes >= openMins || currentMinutes <= closeMins;
  }

  if (isWithinHours) {
    // Check if closing soon (within 30 mins)
    const minsUntilClose = closeMins > currentMinutes ? closeMins - currentMinutes : (1440 - currentMinutes + closeMins);
    if (minsUntilClose <= 30 && minsUntilClose > 0) {
      return {
        isOpenHours: true,
        label: `Closing in ~${minsUntilClose}m`,
        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 animate-pulse'
      };
    }
    return {
      isOpenHours: true,
      label: 'Open Now (In Hours)',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50'
    };
  } else {
    return {
      isOpenHours: false,
      label: 'Off Hours',
      badgeClass: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 border-gray-200/50'
    };
  }
};

const AdminBusinesses = () => {
  const { 
    businesses, 
    fetchBusinesses, 
    adminApproveBusiness, 
    adminRejectBusiness, 
    deleteBusiness,
    updateBusinessQueueStatus,
    socket 
  } = useDatabase();

  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingQueueId, setUpdatingQueueId] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock for opening/closing countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial & handle real-time sync
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Socket listener for instant updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchBusinesses();
    };
    socket.on('queueUpdated', handleUpdate);
    socket.on('businessUpdated', handleUpdate);
    socket.on('verificationUpdated', handleUpdate);
    socket.on('businessDeleted', handleUpdate);

    return () => {
      socket.off('queueUpdated', handleUpdate);
      socket.off('businessUpdated', handleUpdate);
      socket.off('verificationUpdated', handleUpdate);
      socket.off('businessDeleted', handleUpdate);
    };
  }, [socket]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinesses();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live business metrics synchronized!', { icon: '⚡' });
    }, 400);
  };

  const handleDownloadReport = () => {
    try {
      setIsGeneratingPdf(true);
      toast.loading('Generating Executive PDF Report...', { id: 'pdf-toast' });
      setTimeout(() => {
        const filename = generateBusinessQueueReport(businesses, currentUser);
        toast.success(`Report downloaded: ${filename}`, { id: 'pdf-toast', icon: '📄' });
        setIsGeneratingPdf(false);
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report', { id: 'pdf-toast' });
      setIsGeneratingPdf(false);
    }
  };

  const handleSetStatus = async (businessId, businessName, newStatus) => {
    try {
      setUpdatingQueueId(businessId);
      await updateBusinessQueueStatus(businessId, newStatus);
      const icon = newStatus === 'open' ? '🟢' : newStatus === 'paused' ? '⏸️' : '🛑';
      const label = newStatus === 'open' ? 'OPEN' : newStatus === 'paused' ? 'PAUSED' : 'CLOSED';
      toast.success(`${businessName} queue is now ${label}!`, { icon });
      await fetchBusinesses();
    } catch (err) {
      toast.error('Failed to update business queue status');
    } finally {
      setUpdatingQueueId(null);
    }
  };

  const handleApprove = async (id, name) => {
    try {
      await adminApproveBusiness(id);
      toast.success(`Business '${name}' approved successfully!`, { icon: '✅' });
    } catch (err) {
      toast.error('Failed to approve business');
    }
  };

  const handleReject = async (id, name) => {
    try {
      await adminRejectBusiness(id);
      toast.success(`Business '${name}' rejected.`, { icon: 'ℹ️' });
    } catch (err) {
      toast.error('Failed to reject business');
    }
  };

  const confirmDelete = async () => {
    if (!businessToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBusiness(businessToDelete._id);
      setBusinessToDelete(null);
    } catch (err) {
      // Handled in context
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text, label = 'Phone number') => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied: ${text}`, { icon: '📋' });
  };

  // Helper to extract clean phone number
  const getBusinessPhone = (b) => {
    return b?.phone || b?.ownerMobile || b?.contactNumber || b?.businessPhone || '+1 (555) 234-5678';
  };

  const getOwnerMobile = (b) => {
    return b?.ownerMobile || b?.phone || '+1 (555) 839-2041';
  };

  // Live Calculations
  const totalBusinesses = businesses.length;
  const openBusinessesCount = businesses.filter(b => (b.queueStatus === 'open') || (b.queueActive && b.queueStatus !== 'closed' && b.queueStatus !== 'paused')).length;
  const pausedBusinessesCount = businesses.filter(b => b.queueStatus === 'paused').length;
  const closedBusinessesCount = businesses.filter(b => b.queueStatus === 'closed' || (!b.queueActive && b.queueStatus !== 'paused' && b.queueStatus !== 'open')).length;
  const totalWaiting = businesses.reduce((acc, b) => acc + (Number(b.waiting) || 0), 0);
  const totalCompletedToday = businesses.reduce((acc, b) => acc + (Number(b.completedToday) || 0), 0);
  const pendingCount = businesses.filter(b => 
    b.verificationStatus === 'Pending Review' || 
    b.verificationStatus === 'Pending Update Review' || 
    b.verificationStatus === 'Documents Missing'
  ).length;

  // Filter logic
  const filteredBusinesses = businesses.filter(b => {
    const phoneStr = getBusinessPhone(b);
    const matchesSearch = 
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phoneStr?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const bStatus = b.queueStatus || (b.queueActive !== false ? 'open' : 'closed');

    if (statusFilter === 'Open Queues') {
      return bStatus === 'open';
    }
    if (statusFilter === 'Paused Queues') {
      return bStatus === 'paused';
    }
    if (statusFilter === 'Closed Queues') {
      return bStatus === 'closed';
    }
    if (statusFilter === 'Approved') {
      return b.verificationStatus === 'Approved';
    }
    if (statusFilter === 'Pending Review') {
      return b.verificationStatus === 'Pending Review' || b.verificationStatus === 'Pending Update Review';
    }
    if (statusFilter === 'Rejected') {
      return b.verificationStatus === 'Rejected';
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12 animate-fadeIn text-gray-900 dark:text-gray-100 max-w-7xl mx-auto">
      
      {/* Header with Live Status & Real-Time Sync Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <FiActivity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Business & Queue Monitoring
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Real-Time Sync
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-sm sm:text-base">
              Real-time monitoring of business operating schedules, opening/closing hours, live waiting counts, and instant queue controls.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {/* Download PDF Report Button */}
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            title="Download PDF Queue & Timings Report"
          >
            <FiDownload className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>

          <div className="flex items-center bg-gray-100 dark:bg-slate-700/80 p-1 rounded-xl border border-gray-200/70 dark:border-slate-600">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
              title="Live Monitoring Cards View"
            >
              <FiGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <FiList className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold border border-blue-200/80 dark:border-blue-800/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Live Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Registered */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Businesses</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-sm">
              <FiBriefcase />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{totalBusinesses}</p>
          <p className="text-[11px] text-gray-400 mt-1">Platform establishments</p>
        </div>

        {/* Live Open */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-5 rounded-2xl shadow-sm border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">🟢 Live Open</p>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">{openBusinessesCount}</p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Accepting customers</p>
        </div>

        {/* Paused */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 rounded-2xl shadow-sm border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">⏸️ Paused</p>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center font-bold text-sm">
              <FiPause />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">{pausedBusinessesCount}</p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Temporarily on hold</p>
        </div>

        {/* Closed */}
        <div className="bg-rose-50/40 dark:bg-rose-950/20 p-4 sm:p-5 rounded-2xl shadow-sm border border-rose-200/60 dark:border-rose-800/40">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">🛑 Closed</p>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-sm">
              <FiLock />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-2">{closedBusinessesCount}</p>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Queues closed</p>
        </div>

        {/* Total In Line */}
        <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 sm:p-5 rounded-2xl shadow-sm border border-purple-200/60 dark:border-purple-800/40 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">👥 Total Waiting</p>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-sm">
              <FiUsers />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-2">{totalWaiting}</p>
          <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-1">Live queue tokens</p>
        </div>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search businesses, category, location, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm"
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All Businesses', count: totalBusinesses },
            { id: 'Open Queues', label: '🟢 Open', count: openBusinessesCount },
            { id: 'Paused Queues', label: '⏸️ Paused', count: pausedBusinessesCount },
            { id: 'Closed Queues', label: '🛑 Closed', count: closedBusinessesCount },
            { id: 'Pending Review', label: '⏳ Pending', count: pendingCount }
          ].map((item) => {
            const isActive = statusFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200/80 dark:border-slate-700'
                }`}
              >
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* No Businesses Found State */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No establishments found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
            {searchTerm ? "No establishments match your search criteria. Try modifying your search query." : "There are currently no businesses in this selected view."}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* LIVE MONITORING CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => {
            const queueStatus = business.queueStatus || (business.queueActive !== false ? 'open' : 'closed');
            const isOpen = queueStatus === 'open';
            const isPaused = queueStatus === 'paused';
            const isClosed = queueStatus === 'closed';

            const openingTime = business.openingTime || '09:00 AM';
            const closingTime = business.closingTime || '06:00 PM';
            const workingDays = business.workingDays || 'Mon - Sat';
            const scheduleStatus = getBusinessScheduleStatus(openingTime, closingTime);
            
            const waitingCount = Number(business.waiting) || 0;
            const completedCount = Number(business.completedToday) || 0;
            const currentToken = business.currentToken && business.currentToken !== '-' ? business.currentToken : 'None';
            const phone = getBusinessPhone(business);
            const isUpdatingThis = updatingQueueId === business._id;

            return (
              <div 
                key={business._id}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col justify-between"
              >
                {/* Top Accent Strip based on Status */}
                <div className={`h-2 w-full ${
                  isOpen ? 'bg-emerald-500' : isPaused ? 'bg-amber-500' : 'bg-rose-500'
                }`} />

                <div className="p-6 space-y-5 flex-1">
                  
                  {/* Business Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-xl overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700 shadow-sm">
                        {(() => {
                          const logoObj = business.docLogo;
                          const logoSrc = typeof logoObj === 'string' ? logoObj : (logoObj?.content || logoObj?.url);
                          return logoSrc ? (
                            <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
                          ) : (
                            business.name?.charAt(0).toUpperCase() || 'B'
                          );
                        })()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg truncate leading-snug">
                          {business.name}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                          {business.category || 'General Service'} • {business.city || 'Metropolis'}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {isOpen && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          OPEN
                        </span>
                      )}
                      {isPaused && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          PAUSED
                        </span>
                      )}
                      {isClosed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          CLOSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operating Hours Box */}
                  <div className="bg-gray-50/80 dark:bg-slate-700/40 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FiClock className="text-blue-500" /> Operating Schedule
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${scheduleStatus.badgeClass}`}>
                        {scheduleStatus.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                        <FiSun className="text-amber-500 shrink-0 w-3.5 h-3.5" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Opens</p>
                          <p className="font-black text-gray-800 dark:text-gray-200">{openingTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                        <FiMoon className="text-indigo-500 shrink-0 w-3.5 h-3.5" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Closes</p>
                          <p className="font-black text-gray-800 dark:text-gray-200">{closingTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5 px-1">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" /> {workingDays}
                      </span>
                      <span>Avg: {business.avgServiceTime || '10 mins'}</span>
                    </div>
                  </div>

                  {/* Live Queue Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Serving</p>
                      <p className="text-base font-black text-blue-700 dark:text-blue-300 font-mono mt-0.5">{currentToken}</p>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Waiting</p>
                      <p className="text-base font-black text-amber-700 dark:text-amber-300 mt-0.5">{waitingCount}</p>
                    </div>

                    <div className="bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">Served</p>
                      <p className="text-base font-black text-purple-700 dark:text-purple-300 mt-0.5">{completedCount}</p>
                    </div>
                  </div>

                  {/* Contact Snippet */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{business.ownerEmail || business.email || 'No email'}</span>
                    </span>

                    {phone && (
                      <a 
                        href={`tel:${phone}`}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        <FiPhone className="w-3 h-3" />
                        <span>{phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer: Real-Time Admin Queue Control Bar */}
                <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-xl border border-gray-200/80 dark:border-slate-600 shadow-sm flex-1">
                    {/* Open Button */}
                    <button
                      onClick={() => handleSetStatus(business._id, business.name, 'open')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isOpen 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                      title="Set Queue to Open"
                    >
                      <FiPlay className="w-3 h-3" /> Open
                    </button>

                    {/* Pause Button */}
                    <button
                      onClick={() => handleSetStatus(business._id, business.name, 'paused')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isPaused 
                          ? 'bg-amber-500 text-white shadow-sm' 
                          : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      }`}
                      title="Pause Queue Joins"
                    >
                      <FiPause className="w-3 h-3" /> Pause
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => handleSetStatus(business._id, business.name, 'closed')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isClosed 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      }`}
                      title="Close Queue"
                    >
                      <FiLock className="w-3 h-3" /> Close
                    </button>
                  </div>

                  {/* More Details & Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedBusiness(business)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Inspect Full Business Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setBusinessToDelete(business)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Delete Establishment"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-slate-900/60 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Establishment</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule & Hours</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Queue Activity</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Status</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Real-Time Control</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/80">
                {filteredBusinesses.map(business => {
                  const queueStatus = business.queueStatus || (business.queueActive !== false ? 'open' : 'closed');
                  const isOpen = queueStatus === 'open';
                  const isPaused = queueStatus === 'paused';
                  const isClosed = queueStatus === 'closed';

                  const openingTime = business.openingTime || '09:00 AM';
                  const closingTime = business.closingTime || '06:00 PM';
                  const scheduleStatus = getBusinessScheduleStatus(openingTime, closingTime);
                  const waitingCount = Number(business.waiting) || 0;
                  const completedCount = Number(business.completedToday) || 0;
                  const currentToken = business.currentToken && business.currentToken !== '-' ? business.currentToken : '-';
                  const businessPhone = getBusinessPhone(business);

                  return (
                    <tr 
                      key={business._id} 
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      {/* Business Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-base overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700 shadow-sm">
                            {business.name?.charAt(0).toUpperCase() || 'B'}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 dark:text-white text-sm leading-snug">
                              {business.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {business.category || 'General'} • {business.city || 'Metropolis'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Schedule Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <FiClock className="text-blue-500 w-3.5 h-3.5" />
                            <span>{openingTime} - {closingTime}</span>
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${scheduleStatus.badgeClass}`}>
                            {scheduleStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Live Queue Activity */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-black">
                            <span className="text-amber-600 dark:text-amber-400">{waitingCount} waiting</span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-purple-600 dark:text-purple-400">{completedCount} served</span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-mono">
                            Serving: <span className="font-bold text-blue-600 dark:text-blue-400">{currentToken}</span>
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isOpen && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPEN
                          </span>
                        )}
                        {isPaused && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> PAUSED
                          </span>
                        )}
                        {isClosed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> CLOSED
                          </span>
                        )}
                      </td>

                      {/* Admin Real-Time Control */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-xl border border-gray-200/80 dark:border-slate-600">
                          <button
                            onClick={() => handleSetStatus(business._id, business.name, 'open')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isOpen ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-emerald-600'
                            }`}
                            title="Open Queue"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleSetStatus(business._id, business.name, 'paused')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isPaused ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-amber-600'
                            }`}
                            title="Pause Queue"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleSetStatus(business._id, business.name, 'closed')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isClosed ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-rose-600'
                            }`}
                            title="Close Queue"
                          >
                            Close
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setSelectedBusiness(business)}
                            title="View Business Details"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>

                          <button 
                            onClick={() => setBusinessToDelete(business)}
                            title="Delete Business"
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Business Details & Schedule Modal */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {selectedBusiness.name?.charAt(0).toUpperCase() || 'B'}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {selectedBusiness.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {selectedBusiness.category || 'General Service'} • {selectedBusiness.city || 'Metropolis'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBusiness(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live Queue Status Switcher Inside Modal */}
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-400">Live Queue Status</span>
                <span className="text-xs font-bold text-blue-600">Admin Control</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSetStatus(selectedBusiness._id, selectedBusiness.name, 'open')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    (selectedBusiness.queueStatus === 'open' || (selectedBusiness.queueActive && selectedBusiness.queueStatus !== 'closed' && selectedBusiness.queueStatus !== 'paused'))
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50'
                  }`}
                >
                  <FiPlay className="w-3.5 h-3.5" /> Open Queue
                </button>

                <button
                  onClick={() => handleSetStatus(selectedBusiness._id, selectedBusiness.name, 'paused')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedBusiness.queueStatus === 'paused'
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-amber-50'
                  }`}
                >
                  <FiPause className="w-3.5 h-3.5" /> Pause Queue
                </button>

                <button
                  onClick={() => handleSetStatus(selectedBusiness._id, selectedBusiness.name, 'closed')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedBusiness.queueStatus === 'closed' || (!selectedBusiness.queueActive && selectedBusiness.queueStatus !== 'paused')
                      ? 'bg-rose-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50'
                  }`}
                >
                  <FiLock className="w-3.5 h-3.5" /> Close Queue
                </button>
              </div>
            </div>

            {/* Operating Schedule Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase">Opening Time</p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{selectedBusiness.openingTime || '09:00 AM'}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase">Closing Time</p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{selectedBusiness.closingTime || '06:00 PM'}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase">Working Days</p>
                <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{selectedBusiness.workingDays || 'Mon - Sat'}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-gray-400 uppercase">Counters</p>
                <p className="text-sm font-black text-blue-600 mt-0.5">{selectedBusiness.serviceCounters || '1 Counter'}</p>
              </div>
            </div>

            {/* Phone & Contact Cards */}
            <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-slate-700/60 dark:to-slate-700/40 p-4 sm:p-5 rounded-2xl border border-blue-100/80 dark:border-slate-600 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <FiPhoneCall className="w-4 h-4" /> Verified Contact Channels
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-gray-200/70 dark:border-slate-600 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Business Phone</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white font-mono">
                        {getBusinessPhone(selectedBusiness)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${getBusinessPhone(selectedBusiness)}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <FiPhoneCall className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(getBusinessPhone(selectedBusiness), 'Business Phone')}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-gray-200/70 dark:border-slate-600 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FiSmartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Owner Mobile</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white font-mono">
                        {getOwnerMobile(selectedBusiness)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${getOwnerMobile(selectedBusiness)}`}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <FiPhoneCall className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(getOwnerMobile(selectedBusiness), 'Owner Mobile')}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="font-bold text-gray-500 flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-gray-400" /> Owner / Contact Email
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedBusiness.ownerEmail || selectedBusiness.email || 'N/A'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="font-bold text-gray-500 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" /> Full Address
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs">{selectedBusiness.address || 'Address pending verification'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="font-bold text-gray-500">Verification Status</span>
                <span className="font-bold uppercase text-blue-600">{selectedBusiness.verificationStatus || 'APPROVED'}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              <FiAlertCircle />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Establishment?</h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">"{businessToDelete.name}"</strong>? All associated queue entries, staff, and tokens will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBusinessToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Business'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBusinesses;
