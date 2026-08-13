import { useState, useEffect } from 'react';
import { FiBell, FiTrash2, FiCheckSquare, FiCalendar, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { useBusinessNotifications } from '../../hooks/useBusinessNotifications';

const BusinessNotifications = () => {
  const { notifications, markAllRead, clearAll, deleteOne } = useBusinessNotifications();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
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

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiBell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Business Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage real-time notifications for bookings and queue activity
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="relative z-10 flex gap-3">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm font-bold text-gray-700 dark:text-gray-200 rounded-xl transition-all"
            >
              <FiCheckSquare className="w-4 h-4" /> Mark all read
            </button>
            <button
              onClick={() => setDeleteTarget('all')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-sm font-bold text-red-600 dark:text-red-400 rounded-xl transition-all"
            >
              <FiTrash2 className="w-4 h-4" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700/80 min-h-[500px]">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <FiBell className="w-16 h-16 mx-auto text-gray-200 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto">
              No new alerts. When customers book appointments or join your queue, notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  !notif.read
                    ? 'bg-blue-50/20 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/60 shadow-sm'
                    : 'bg-gray-50/20 dark:bg-slate-900/10 border-gray-100 dark:border-slate-700/60'
                }`}
              >
                <div className={`p-3 rounded-xl shrink-0 ${
                  notif.type?.includes('reject') || notif.type?.includes('miss') || notif.type?.includes('cancel')
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400'
                    : notif.type?.includes('approve') || notif.type?.includes('complete')
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400'
                      : 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400'
                }`}>
                  {notif.icon === '📅' ? (
                    <FiCalendar className="w-5 h-5" />
                  ) : notif.icon === '👤' ? (
                    <FiUser className="w-5 h-5" />
                  ) : (
                    <FiClock className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
                    <span className="text-indigo-600 font-bold mr-2">{idx + 1}.</span>
                    {notif.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>{new Date(notif.time).toLocaleString()}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block ml-1" />
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteTarget(notif)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                ? 'Are you sure you want to permanently clear all business notifications? This action cannot be undone.'
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

export default BusinessNotifications;
