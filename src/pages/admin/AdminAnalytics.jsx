import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBriefcase, FiCheckCircle, FiActivity, FiPieChart, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { generateBusinessQueueReport } from '../../utils/generateBusinessQueueReport';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const { users, businesses } = useDatabase();
  const { currentUser } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const totalCustomers = users.filter(u => u.role === 'Customer').length;
  const totalBusinesses = businesses.length;
  const verifiedBusinesses = businesses.filter(b => b.verificationStatus === 'Approved').length;
  const pendingBusinesses = businesses.filter(b => b.verificationStatus === 'Pending Review' || b.verificationStatus === 'Documents Missing').length;
  const rejectedBusinesses = businesses.filter(b => b.verificationStatus === 'Rejected').length;
  
  const totalWaiting = businesses.reduce((sum, b) => sum + (Number(b.waiting) || 0), 0);
  const activeQueues = businesses.filter(b => b.queueStatus === 'open' || (b.queueActive && b.queueStatus !== 'closed' && b.queueStatus !== 'paused')).length;

  const handleDownloadReport = () => {
    try {
      setIsGeneratingPdf(true);
      toast.loading('Generating Executive PDF Report...', { id: 'pdf-toast-analytics' });
      setTimeout(() => {
        const filename = generateBusinessQueueReport(businesses, currentUser);
        toast.success(`Report downloaded: ${filename}`, { id: 'pdf-toast-analytics', icon: '📄' });
        setIsGeneratingPdf(false);
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report', { id: 'pdf-toast-analytics' });
      setIsGeneratingPdf(false);
    }
  };

  const cards = [
    { title: 'Total Customers', value: totalCustomers, icon: FiUsers, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { title: 'Total Businesses', value: totalBusinesses, icon: FiBriefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { title: 'Total People Waiting', value: totalWaiting, icon: FiActivity, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/30' },
    { title: 'Active Live Queues', value: activeQueues, icon: FiTrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-100 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiPieChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Platform-wide performance, opening/closing timings, and live queue analytics
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <button
            onClick={handleDownloadReport}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FiDownload className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Executive Report (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100/80 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">{card.title}</p>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts / Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Business Verification Status */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
            <FiCheckCircle className="text-green-500" /> Business Verification Status
          </h2>
          
          <div className="space-y-6">
            <StatusRow label="Approved & Active" count={verifiedBusinesses} total={totalBusinesses} color="bg-emerald-500" />
            <StatusRow label="Pending Review" count={pendingBusinesses} total={totalBusinesses} color="bg-amber-500" />
            <StatusRow label="Rejected" count={rejectedBusinesses} total={totalBusinesses} color="bg-red-500" />
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
            <FiUsers className="text-blue-500" /> Platform Demographics
          </h2>
          
          <div className="flex items-center justify-center h-48 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900 dark:text-white">{users.length}</span>
              <span className="text-sm font-bold text-gray-500">Total Users</span>
            </div>
            <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
              <path
                className="text-gray-100 dark:text-slate-700"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeDasharray={`${(totalCustomers / (users.length || 1)) * 100}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          
          <div className="mt-8 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Customers ({totalCustomers})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-600"></div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Admins & Business</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const StatusRow = ({ label, count, total, color }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-900 dark:text-white">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
