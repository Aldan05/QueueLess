import { FiRadio, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';

const BusinessAnnouncements = () => {
  const { announcements } = useDatabase();
  
  // Filter for Business announcements
  const businessAnnouncements = announcements.filter(
    a => a.targetAudience === 'All' || a.targetAudience === 'Businesses'
  );

  const { markAsRead } = useUnreadNotifications('Businesses');

  useEffect(() => {
    markAsRead();
  }, [markAsRead, businessAnnouncements.length]);

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100/80 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiRadio className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Platform Announcements
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Important updates and notifications from QueueLess Admin
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100/80 min-h-[500px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiClock className="text-blue-600" /> Recent Updates
        </h2>

        <div className="space-y-4">
          {businessAnnouncements.length === 0 ? (
            <div className="text-center py-20">
              <FiRadio className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-500 font-medium max-w-md mx-auto">
                You're all caught up! When the admin sends out platform updates, they will appear right here.
              </p>
            </div>
          ) : (
            businessAnnouncements.map((announcement) => (
              <div 
                key={announcement._id} 
                className={`p-6 rounded-2xl border ${
                  announcement.priority === 'High' 
                    ? 'border-red-100 bg-red-50/30' 
                    : 'border-gray-100 bg-gray-50/50'
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
      </div>
    </div>
  );
};

export default BusinessAnnouncements;
