import { useState, useRef, useEffect } from 'react';
import { FiBell, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDatabase } from '../../context/DatabaseContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';

const NotificationDropdown = ({ audienceRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const lastAnnounceRef = useRef(null);
  const { announcements } = useDatabase();
  const { unreadCount, markAsRead } = useUnreadNotifications(audienceRole);
  const { notifications: liveNotifications, unreadCount: liveUnreadCount, markAllRead: markLiveNotificationsRead, clearAll } = useLiveNotifications();

  const filteredAnnouncements = announcements
    .filter(a => a.targetAudience === 'All' || a.targetAudience === audienceRole)
    .slice(0, 5); // Show latest 5

  const totalUnreadCount = unreadCount + liveUnreadCount;

  useEffect(() => {
    if (filteredAnnouncements.length > 0) {
      const latest = filteredAnnouncements[0];
      // Only trigger toast if we already had a previous state (not initial load)
      // and the new latest announcement ID is different from the previous one
      if (lastAnnounceRef.current && lastAnnounceRef.current !== latest._id) {
        if (latest.priority === 'High') {
          toast.error(latest.title, { icon: '🚨', duration: 5000 });
        } else {
          toast.success(latest.title, { icon: '🔔', duration: 4000 });
        }
      }
      lastAnnounceRef.current = latest._id;
    }
  }, [filteredAnnouncements]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            markAsRead();
            markLiveNotificationsRead();
          }
        }}
        className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <FiBell className="w-5 h-5" />
        {totalUnreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {totalUnreadCount > 0 && (
              <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md">
                {totalUnreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {liveNotifications.length === 0 && filteredAnnouncements.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {liveNotifications.slice(0, 5).map((notif, idx) => (
                  <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        <span className="text-indigo-600 mr-2">{idx + 1}.</span>
                        {(notif.type || 'notification').replace(/_/g, ' ').toUpperCase()
                      }
                      </h4>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {notif.message}
                    </p>
                  </div>
                ))}
                {filteredAnnouncements.map((announcement, idx) => (
                  <div key={announcement._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        <span className="text-indigo-600 mr-2">{liveNotifications.length + idx + 1}.</span>
                        {announcement.title}
                      </h4>
                      {announcement.priority === 'High' && (
                        <FiAlertCircle className="text-red-500 shrink-0 w-4 h-4" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {announcement.message}
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 mt-2 block">
                      {new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {liveNotifications.length > 0 && (
                <button
                  onClick={() => {
                    markLiveNotificationsRead();
                  }}
                  className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-indigo-600 rounded-xl transition-colors"
                >
                  Mark live as read
                </button>
              )}
              {liveNotifications.length > 0 && (
                <button
                  onClick={() => {
                    clearAll();
                  }}
                  className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-red-600 rounded-xl transition-colors"
                >
                  Clear live
                </button>
              )}
            </div>
            <button
              onClick={() => {
                markAsRead();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs font-bold text-gray-600 hover:text-indigo-600 rounded-xl transition-colors"
            >
              Mark announcements read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
