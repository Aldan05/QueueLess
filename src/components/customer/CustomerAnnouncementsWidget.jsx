import { FiRadio, FiAlertCircle } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';

const CustomerAnnouncementsWidget = () => {
  const { announcements } = useDatabase();
  
  // Filter for Customer announcements and take only the latest 3
  const customerAnnouncements = announcements
    .filter(a => a.targetAudience === 'All' || a.targetAudience === 'Customers')
    .slice(0, 3);

  if (customerAnnouncements.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <FiRadio className="w-24 h-24" />
      </div>
      
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
        <FiRadio className="text-indigo-600" /> Platform Updates
      </h2>
      
      <div className="space-y-3 relative z-10">
        {customerAnnouncements.map(announcement => (
          <div 
            key={announcement._id} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50/50"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {announcement.title}
              </h3>
              {announcement.priority === 'High' && (
                <FiAlertCircle className="text-red-500 shrink-0 w-4 h-4" />
              )}
            </div>
            <p className="text-gray-600 text-xs line-clamp-2">
              {announcement.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerAnnouncementsWidget;
