import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBriefcase, FiShield, FiCheckCircle, 
  FiUsers, FiActivity, FiTrendingUp,
  FiFileText, FiSettings, FiRadio, FiClock,
  FiPlay, FiPause, FiLock, FiSun, FiMoon,
  FiChevronRight, FiRefreshCw, FiExternalLink,
  FiDownload
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminVerificationWidget from '../../components/admin/AdminVerificationWidget';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { generateBusinessQueueReport } from '../../utils/generateBusinessQueueReport';
import toast from 'react-hot-toast';

// Helper to parse time string like "09:00 AM" into minutes from midnight
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

  let isWithinHours = false;
  if (closeMins > openMins) {
    isWithinHours = currentMinutes >= openMins && currentMinutes <= closeMins;
  } else {
    isWithinHours = currentMinutes >= openMins || currentMinutes <= closeMins;
  }

  if (isWithinHours) {
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { businesses, users, fetchBusinesses, fetchUsers, updateBusinessQueueStatus, socket } = useDatabase();
  const { currentUser } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchBusinesses();
      fetchUsers();
    };
    socket.on('queueUpdated', handleUpdate);
    socket.on('businessUpdated', handleUpdate);
    socket.on('verificationUpdated', handleUpdate);

    return () => {
      socket.off('queueUpdated', handleUpdate);
      socket.off('businessUpdated', handleUpdate);
      socket.off('verificationUpdated', handleUpdate);
    };
  }, [socket]);

  const handleSetQueueStatus = async (businessId, businessName, newStatus) => {
    try {
      setUpdatingId(businessId);
      await updateBusinessQueueStatus(businessId, newStatus);
      const icon = newStatus === 'open' ? '🟢' : newStatus === 'paused' ? '⏸️' : '🛑';
      const label = newStatus === 'open' ? 'OPEN' : newStatus === 'paused' ? 'PAUSED' : 'CLOSED';
      toast.success(`${businessName} is now ${label}!`, { icon });
      await fetchBusinesses();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchBusinesses();
    await fetchUsers();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live dashboard data updated!', { icon: '⚡' });
    }, 400);
  };

  const handleDownloadReport = () => {
    try {
      setIsGeneratingPdf(true);
      toast.loading('Generating Executive PDF Report...', { id: 'pdf-toast-dash' });
      setTimeout(() => {
        const filename = generateBusinessQueueReport(businesses, currentUser);
        toast.success(`Report downloaded: ${filename}`, { id: 'pdf-toast-dash', icon: '📄' });
        setIsGeneratingPdf(false);
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report', { id: 'pdf-toast-dash' });
      setIsGeneratingPdf(false);
    }
  };
  
  const pendingCount = businesses.filter(b => 
    b.verificationStatus === 'Pending Review' || 
    b.verificationStatus === 'Pending Update Review' || 
    b.verificationStatus === 'Documents Missing' ||
    (b.pendingDocs && typeof b.pendingDocs === 'object' && Object.keys(b.pendingDocs).length > 0)
  ).length;

  const approvedCount = businesses.filter(b => b.isVerified).length;
  const openCount = businesses.filter(b => (b.queueStatus === 'open') || (b.queueActive && b.queueStatus !== 'closed' && b.queueStatus !== 'paused')).length;
  const pausedCount = businesses.filter(b => b.queueStatus === 'paused').length;
  const closedCount = businesses.filter(b => b.queueStatus === 'closed' || (!b.queueActive && b.queueStatus !== 'paused' && b.queueStatus !== 'open')).length;
  const totalWaiting = businesses.reduce((acc, b) => acc + (Number(b.waiting) || 0), 0);
  const totalCompleted = businesses.reduce((acc, b) => acc + (Number(b.completedToday) || 0), 0);
  const customerCount = users.filter(u => u.role === 'Customer').length;

  const stats = [
    { title: "Total Businesses", value: businesses.length.toString(), icon: FiBriefcase, trend: "up", trendValue: "12%" },
    { title: "🟢 Live Open Queues", value: openCount.toString(), icon: FiActivity, trend: "up", trendValue: "Real-time" },
    { title: "⏸️ Paused Queues", value: pausedCount.toString(), icon: FiPause, trend: pausedCount > 0 ? "up" : "down", trendValue: "Live" },
    { title: "👥 In Line (Waiting)", value: totalWaiting.toString(), icon: FiUsers, trend: "up", trendValue: "Tokens" },
    { title: "✅ Served Today", value: totalCompleted.toString(), icon: FiCheckCircle, trend: "up", trendValue: "Finished" },
    { title: "⏳ Pending Verification", value: pendingCount.toString(), icon: FiShield, trend: pendingCount > 0 ? "up" : "down", trendValue: pendingCount.toString() },
  ];

  const quickActions = [
    { title: 'Business Monitoring', icon: FiActivity, path: '/admin/businesses', colorClass: 'bg-emerald-50 text-emerald-600' },
    { title: 'Verify Business', icon: FiShield, path: '/admin/verification', colorClass: 'bg-blue-50 text-blue-600' },
    { title: 'Create Announcement', icon: FiRadio, path: '/admin/announcements', colorClass: 'bg-purple-50 text-purple-600' },
    { title: 'View Reports', icon: FiFileText, path: '/admin/analytics', colorClass: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-8 pb-10 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations Monitoring
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome Back, {currentUser?.name || 'Super Admin'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-base sm:text-lg">
            QueueLess Real-Time Platform & Queue Overview
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:flex gap-3 relative z-10">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 cursor-pointer"
            >
              <action.icon className={action.colorClass.split(' ')[1]} />
              <span className="text-gray-700 dark:text-gray-200 text-sm">{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <AdminStatCard key={index} {...stat} delay={index * 0.05} />
        ))}
      </div>

      {/* REAL-TIME BUSINESS MONITORING & TIMINGS WIDGET */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FiActivity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Live Business & Queue Monitoring
                </h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time tracking of opening & closing hours, live queue statuses, serving tokens, and instant controls.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              title="Download Comprehensive Business & Queue PDF Report"
            >
              <FiDownload className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
              <span className="sm:hidden">Report PDF</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 dark:border-slate-600 cursor-pointer"
              title="Refresh Live Metrics"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            
            <button
              onClick={() => navigate('/admin/businesses')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-sm rounded-xl border border-blue-200/80 dark:border-slate-600 transition-all cursor-pointer"
            >
              <span>Manage All ({businesses.length})</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Business-Wise Live Monitoring Grid */}
        {businesses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No registered businesses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.slice(0, 6).map((business) => {
              const queueStatus = business.queueStatus || (business.queueActive !== false ? 'open' : 'closed');
              const isOpen = queueStatus === 'open';
              const isPaused = queueStatus === 'paused';
              const isClosed = queueStatus === 'closed';

              const openingTime = business.openingTime || '09:00 AM';
              const closingTime = business.closingTime || '06:00 PM';
              const scheduleStatus = getBusinessScheduleStatus(openingTime, closingTime);
              const waitingCount = Number(business.waiting) || 0;
              const currentToken = business.currentToken && business.currentToken !== '-' ? business.currentToken : 'None';
              const isUpdatingThis = updatingId === business._id;

              return (
                <div 
                  key={business._id}
                  className="bg-gray-50/70 dark:bg-slate-700/40 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                >
                  {/* Top: Business Info & Live Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-slate-600 text-blue-600 dark:text-blue-300 font-black text-base flex items-center justify-center shrink-0">
                        {business.name?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-base truncate">
                          {business.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-bold uppercase truncate">
                          {business.category || 'General'} • {business.city || 'Metropolis'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isOpen && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPEN
                        </span>
                      )}
                      {isPaused && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> PAUSED
                        </span>
                      )}
                      {isClosed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> CLOSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Schedule Timings */}
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200/70 dark:border-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <FiClock className="text-blue-500" /> Hours:
                      </span>
                      <span className="font-mono text-gray-900 dark:text-white">{openingTime} - {closingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${scheduleStatus.badgeClass}`}>
                        {scheduleStatus.label}
                      </span>
                      <span className="text-gray-400">{business.workingDays || 'Mon - Sat'}</span>
                    </div>
                  </div>

                  {/* Live Queue Numbers */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Now Serving</p>
                      <p className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{currentToken}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">In Line</p>
                      <p className={`font-mono font-black text-sm ${waitingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                        {waitingCount} waiting
                      </p>
                    </div>
                  </div>

                  {/* Real-time Admin Quick Action Toggle */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200/80 dark:border-slate-600 shadow-sm">
                    <button
                      onClick={() => handleSetQueueStatus(business._id, business.name, 'open')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isOpen ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-emerald-600'
                      }`}
                      title="Set Open"
                    >
                      <FiPlay className="w-3 h-3" /> Open
                    </button>

                    <button
                      onClick={() => handleSetQueueStatus(business._id, business.name, 'paused')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isPaused ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-amber-600'
                      }`}
                      title="Set Paused"
                    >
                      <FiPause className="w-3 h-3" /> Pause
                    </button>

                    <button
                      onClick={() => handleSetQueueStatus(business._id, business.name, 'closed')}
                      disabled={isUpdatingThis}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isClosed ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-rose-600'
                      }`}
                      title="Set Closed"
                    >
                      <FiLock className="w-3 h-3" /> Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: Verifications + Platform Health */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Verifications) */}
        <div className="xl:col-span-2">
          <AdminVerificationWidget />
        </div>

        {/* Right Column (Platform Health) */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-8 rounded-3xl shadow-sm text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FiActivity className="w-32 h-32" />
            </div>
            <h2 className="text-lg font-bold text-gray-100 mb-6 relative z-10">Platform Infrastructure</h2>
            
            <div className="space-y-5 relative z-10">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-gray-400">API Socket Gateway</span>
                  <span className="text-green-400">Operational (Real-time)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-green-400 h-1.5 rounded-full w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-gray-400">Queue Processing Engine</span>
                  <span className="text-emerald-400">Healthy</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full w-[94%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-gray-400">Database Synchronization</span>
                  <span className="text-blue-400">Connected</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full w-[100%]"></div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/admin/logs')}
              className="mt-8 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer"
            >
              View System Logs
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
