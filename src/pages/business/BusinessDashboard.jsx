import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiClock, FiCalendar, FiSmile, FiList, FiTrendingUp,
  FiRefreshCw, FiCheckCircle, FiAlertCircle, FiActivity, FiShield,
  FiPlay, FiPause, FiSlash
} from 'react-icons/fi';
import BusinessStatCard from '../../components/business/BusinessStatCard';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BusinessDashboard = () => {
  const { businesses, fetchBusinesses, socket } = useDatabase();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const business = businesses.find(b => 
    b._id === currentUser?.businessId || 
    b.userId === currentUser?._id || 
    b.email === currentUser?.email || 
    b.ownerEmail === currentUser?.email
  );

  // Fetch appointments for this business
  const fetchAppointments = async () => {
    if (!business?._id) return;
    try {
      const res = await fetch(`${API_URL}/businesses/${business._id}/appointments`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments for dashboard:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBusinesses();
    if (business?._id) {
      fetchAppointments();
    }
  }, [business?._id]);

  // Real-time socket sync & polling fallback
  useEffect(() => {
    if (!socket) return;
    const handleLiveUpdate = () => {
      fetchBusinesses();
      if (business?._id) {
        fetchAppointments();
      }
    };

    const handleNotification = (notif) => {
      if (notif && notif.type === 'appointment_new') {
        if (business?._id) fetchAppointments();
      }
    };

    socket.on('queueUpdated', handleLiveUpdate);
    socket.on('businessUpdated', handleLiveUpdate);
    socket.on('verificationUpdated', handleLiveUpdate);
    socket.on('appointmentUpdated', handleLiveUpdate);
    socket.on('reviewAdded', handleLiveUpdate);
    socket.on('notification', handleNotification);

    const interval = setInterval(handleLiveUpdate, 4000);

    return () => {
      socket.off('queueUpdated', handleLiveUpdate);
      socket.off('businessUpdated', handleLiveUpdate);
      socket.off('verificationUpdated', handleLiveUpdate);
      socket.off('appointmentUpdated', handleLiveUpdate);
      socket.off('reviewAdded', handleLiveUpdate);
      socket.off('notification', handleNotification);
      clearInterval(interval);
    };
  }, [socket, business?._id]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchBusinesses(), fetchAppointments()]);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live dashboard data synchronized!', { icon: '⚡' });
    }, 400);
  };

  const handleSetQueueStatus = async (newStatus) => {
    if (!business?._id) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const msg = newStatus === 'open' 
          ? '🟢 Queue is now OPEN and accepting customers!' 
          : newStatus === 'paused' 
          ? '⏸️ Queue is now PAUSED (New joins temporarily stopped)' 
          : '🛑 Queue is now CLOSED for today';
        toast.success(msg, { id: 'biz-dash-queue-status' });
        fetchBusinesses();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to update queue status');
      }
    } catch (error) {
      toast.error('Server error updating queue status');
    }
  };

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-950/40 text-orange-500 rounded-full flex items-center justify-center mb-6">
          <FiClock className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Pending Review</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Your business registration is currently under review by our admin team. You will receive an email once approved.
        </p>
      </div>
    );
  }
  
  if (!business.isVerified && business.verificationStatus === 'Rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center mb-6">
          <FiAlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Rejected</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Please check your documents or contact support to re-apply for verification.
        </p>
      </div>
    );
  }

  // Calculate 100% true live metrics
  const waitingCount = Number(business.waiting) || 0;
  const completedToday = Number(business.completedToday) || 0;
  const totalVisitorsToday = waitingCount + completedToday;
  const currentToken = business.currentToken && business.currentToken !== '-' ? business.currentToken : '-';
  
  // Avg wait time calculation (dynamic based on queue size and avg service time)
  const avgServiceTimeMin = Number(business.avgServiceTime) || 5;
  const estimatedWaitMin = waitingCount > 0 ? (business.waitTime || (waitingCount * avgServiceTimeMin)) : 0;
  
  // Real appointments for today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => {
    if (!a.date) return false;
    try {
      const aptDateStr = new Date(a.date).toISOString().split('T')[0];
      return aptDateStr === todayDateStr;
    } catch {
      return false;
    }
  });

  const ratingScore = Math.min(5, Math.max(0, Number(business.rating) || 0));
  const reviewCount = Number(business.reviewCount) || 0;

  const stats = [
    { 
      title: "Today's Visitors", 
      value: totalVisitorsToday.toString(), 
      icon: FiUsers, 
      trend: totalVisitorsToday > 0 ? "up" : "neutral", 
      trendValue: `${completedToday} served • ${waitingCount} waiting`, 
      colorClass: { bg: "bg-blue-50", text: "text-blue-600", chart: "bg-blue-200" } 
    },
    { 
      title: "Customers Waiting", 
      value: waitingCount.toString(), 
      icon: FiList, 
      trend: waitingCount > 0 ? "up" : "neutral",
      trendValue: waitingCount > 0 ? "Active in line" : "Queue empty",
      colorClass: { bg: "bg-orange-50", text: "text-orange-600", chart: "bg-orange-200" } 
    },
    { 
      title: "Current Token", 
      value: currentToken, 
      icon: FiTrendingUp, 
      trend: currentToken !== '-' ? "up" : "neutral",
      trendValue: currentToken !== '-' ? "Now serving" : "Ready for next",
      colorClass: { bg: "bg-purple-50", text: "text-purple-600", chart: "bg-purple-200" } 
    },
    { 
      title: "Average Wait Time", 
      value: `${estimatedWaitMin}m`, 
      icon: FiClock, 
      trend: estimatedWaitMin > 15 ? "up" : "down", 
      trendValue: `~${avgServiceTimeMin}m per customer`, 
      colorClass: { bg: "bg-green-50", text: "text-green-600", chart: "bg-green-200" } 
    },
    { 
      title: "Appointments Today", 
      value: todayAppointments.length.toString(), 
      icon: FiCalendar, 
      trend: todayAppointments.length > 0 ? "up" : "neutral", 
      trendValue: `${todayAppointments.filter(a => a.status === 'approved' || a.status === 'confirmed').length} confirmed • ${appointments.length} total`, 
      colorClass: { bg: "bg-indigo-50", text: "text-indigo-600", chart: "bg-indigo-200" } 
    },
    { 
      title: "Customer Rating", 
      value: `${ratingScore.toFixed(1)}/5.0`, 
      icon: FiSmile, 
      trend: "up", 
      trendValue: `${reviewCount} verified ${reviewCount === 1 ? 'review' : 'reviews'}`, 
      colorClass: { bg: "bg-amber-50", text: "text-amber-600", chart: "bg-amber-200" } 
    },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 pb-10 text-gray-900 dark:text-gray-100 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-blue-200 dark:border-slate-600">
            {(() => {
              const logoObj = business.docLogo;
              const logoSrc = typeof logoObj === 'string' ? logoObj : (logoObj?.content || logoObj?.url);
              return logoSrc ? (
                <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black">{business.name?.charAt(0).toUpperCase() || 'B'}</span>
              );
            })()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Welcome back, {business.name} 👋
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-sm sm:text-base">
              Today is {currentDate} • Category: <strong className="text-gray-800 dark:text-gray-200">{business.category || 'General Service'}</strong>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl border border-gray-200/80 dark:border-slate-600 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            title="Sync Live Metrics"
          >
            <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <button 
            onClick={() => navigate('/business/staff')}
            className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Add Staff
          </button>
          <button 
            onClick={() => navigate('/business/announcements')}
            className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Create Announcement
          </button>
          <button 
            onClick={() => navigate('/business/reports')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            View Reports
          </button>
        </div>
      </div>

      {/* Queue Status Control Bar */}
      {(() => {
        const currentQueueStatus = business?.queueStatus || (business?.queueActive !== false ? 'open' : 'closed');
        return (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                currentQueueStatus === 'open' ? 'bg-emerald-500 animate-pulse' : currentQueueStatus === 'paused' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
              }`} />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Queue Status</div>
                <div className="text-sm font-extrabold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                  {currentQueueStatus === 'open' && <span className="text-emerald-600 dark:text-emerald-400">🟢 Active / Open (Customers Can Join)</span>}
                  {currentQueueStatus === 'paused' && <span className="text-amber-600 dark:text-amber-400">⏸️ Paused (New Joins Temporarily Paused)</span>}
                  {currentQueueStatus === 'closed' && <span className="text-rose-600 dark:text-rose-400">🛑 Closed for Today</span>}
                </div>
              </div>
            </div>

            {/* 3-State Queue Status Switcher */}
            <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner">
              <button 
                onClick={() => handleSetQueueStatus('open')}
                title="Open queue"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentQueueStatus === 'open' 
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <FiPlay className="w-3 h-3" /> Open
              </button>

              <button 
                onClick={() => handleSetQueueStatus('paused')}
                title="Pause queue"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentQueueStatus === 'paused' 
                    ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <FiPause className="w-3 h-3" /> Pause
              </button>

              <button 
                onClick={() => handleSetQueueStatus('closed')}
                title="Close queue"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentQueueStatus === 'closed' 
                    ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <FiSlash className="w-3 h-3" /> Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* 100% True Real-Time Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <BusinessStatCard key={index} {...stat} delay={index * 0.05} />
        ))}
      </div>
    </div>
  );
};

export default BusinessDashboard;
