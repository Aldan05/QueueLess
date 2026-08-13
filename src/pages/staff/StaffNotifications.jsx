import React, { useState, useEffect } from 'react';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { FiBell, FiCheck, FiInfo, FiAlertCircle, FiCalendar, FiUser, FiClock, FiTrash2, FiCheckSquare, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const StaffNotifications = () => {
  const { notifications, markAllRead, clearAll, deleteOne } = useLiveNotifications();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    // Mark all as read when opening page
    markAllRead();
  }, [markAllRead]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget === 'all') {
      clearAll();
    } else {
      deleteOne(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const getIcon = (type) => {
    if (type?.includes('appointment')) return <FiCalendar className="text-blue-500" />;
    if (type?.includes('queue') || type === 'queue') return <FiUser className="text-emerald-500" />;
    if (type === 'priority_added') return <FiAlertCircle className="text-red-500" />;
    if (type === 'staff_announcement') return <FiInfo className="text-amber-500" />;
    return <FiBell className="text-gray-500" />;
  };

  const getBgColor = (type) => {
    if (type?.includes('appointment')) return 'bg-blue-50 dark:bg-blue-500/10';
    if (type?.includes('queue') || type === 'queue') return 'bg-emerald-50 dark:bg-emerald-500/10';
    if (type === 'priority_added') return 'bg-red-50 dark:bg-red-500/10';
    if (type === 'staff_announcement') return 'bg-amber-50 dark:bg-amber-500/10';
    return 'bg-gray-50 dark:bg-slate-800/50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBell className="text-blue-600" /> Staff Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time alerts, queue joins, appointments, and announcements.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-bold text-gray-700 dark:text-gray-200 rounded-xl transition-all"
              >
                <FiCheckSquare className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={() => setDeleteTarget('all')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 rounded-xl transition-all"
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </>
          )}
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-extrabold">
            {notifications.length} Total
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FiCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">You're all caught up!</h3>
            <p className="text-gray-500">No new notifications to display.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`flex gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all ${
                  notif.read 
                    ? 'border-gray-100 dark:border-slate-700/60' 
                    : 'border-blue-200 dark:border-blue-900/60 shadow-md bg-blue-50/10 dark:bg-blue-950/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                      <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                      {(notif.type || 'notification').replace(/_/g, ' ')}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        {new Date(notif.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => setDeleteTarget(notif)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{notif.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Glassmorphic Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-4">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
              {deleteTarget === 'all' ? 'Clear All Notifications?' : 'Delete Notification?'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6">
              {deleteTarget === 'all'
                ? 'Are you sure you want to permanently clear all staff notifications? This action cannot be undone.'
                : 'Are you sure you want to delete this notification from your inbox?'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm shadow-md shadow-red-500/20 transition-colors"
              >
                {deleteTarget === 'all' ? 'Yes, Clear All' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffNotifications;
