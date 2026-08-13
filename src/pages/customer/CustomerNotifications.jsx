import { useState, useEffect } from 'react';
import { FiBell, FiAlertCircle, FiTrash2, FiCheckSquare, FiCalendar, FiClock } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';

const CustomerNotifications = () => {
  const { announcements } = useDatabase();
  const { notifications, markAllRead, clearAll, deleteOne } = useLiveNotifications();
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'announcements'
  const [deleteTarget, setDeleteTarget] = useState(null); // null, 'all', or notification item object

  // Filter for Customer announcements
  const customerAnnouncements = announcements.filter(
    a => a.targetAudience === 'All' || a.targetAudience === 'Customers'
  );

  const { markAsRead } = useUnreadNotifications('Customers');

  // Mark announcements as read
  useEffect(() => {
    if (activeTab === 'announcements') {
      markAsRead();
    }
  }, [activeTab, markAsRead, customerAnnouncements.length]);

  // Mark live notifications as read when tab is open
  useEffect(() => {
    if (activeTab === 'live') {
      markAllRead();
    }
  }, [activeTab, markAllRead, notifications.length]);

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
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiBell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Stay up to date with platform alerts and updates
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center justify-between border-b border-gray-100">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('live')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'live' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Live Status Updates
            {notifications.some(n => !n.read) && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
            {activeTab === 'live' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'announcements' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Platform Announcements
            {activeTab === 'announcements' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === 'live' && notifications.length > 0 && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <FiCheckSquare className="w-3.5 h-3.5" /> Mark read
            </button>
            <button
              onClick={() => setDeleteTarget('all')}
              className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors ml-2"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 min-h-[500px]">
        {activeTab === 'live' ? (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-20 animate-fadeIn">
                <FiBell className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No live alerts</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto">
                  Updates on your appointments, approvals, and queues will show up here.
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div 
                  key={notif.id} 
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    !notif.read ? 'bg-indigo-50/20 border-indigo-100 shadow-sm' : 'bg-gray-50/20 border-gray-100'
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${
                    notif.type?.includes('reject') || notif.type?.includes('miss')
                      ? 'bg-red-50 text-red-500'
                      : notif.type?.includes('approve') || notif.type?.includes('complete')
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-indigo-50 text-indigo-500'
                  }`}>
                    {notif.type?.includes('appointment') ? <FiCalendar className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      <span className="text-indigo-600 font-bold mr-2">{idx + 1}.</span>
                      {notif.message}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>{new Date(notif.time).toLocaleString()}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block ml-1" />
                        )}
                      </div>
                      <button 
                        onClick={() => setDeleteTarget(notif)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {customerAnnouncements.length === 0 ? (
              <div className="text-center py-20">
                <FiBell className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No announcements</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto">
                  You don't have any announcements at the moment.
                </p>
              </div>
            ) : (
              customerAnnouncements.map((announcement) => (
                <div 
                  key={announcement._id} 
                  className={`p-6 rounded-2xl border ${
                    announcement.priority === 'High' 
                      ? 'border-red-100 bg-red-50/30' 
                      : 'border-indigo-100 bg-indigo-50/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {announcement.priority === 'High' && <FiAlertCircle className="text-red-500" />}
                      {announcement.title}
                    </h3>
                    {announcement.priority === 'High' && (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                    {announcement.message}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-gray-400">
                    Received on {new Date(announcement.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Glassmorphic Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              {deleteTarget === 'all' ? 'Clear All Notifications?' : 'Delete Notification?'}
            </h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
              {deleteTarget === 'all'
                ? 'Are you sure you want to permanently clear all notifications? This action cannot be undone.'
                : 'Are you sure you want to delete this notification from your inbox?'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 text-sm transition-colors"
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

export default CustomerNotifications;
