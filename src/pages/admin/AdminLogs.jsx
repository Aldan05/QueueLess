import { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { FiActivity, FiUserPlus, FiBriefcase, FiCheckCircle, FiSearch, FiFilter } from 'react-icons/fi';

const AdminLogs = () => {
  const { users, businesses } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Generate synthetic activity logs from users and businesses
  const activities = useMemo(() => {
    let logs = [];

    // User registrations
    users.forEach(user => {
      if (user.createdAt) {
        logs.push({
          id: `user-${user._id}`,
          type: 'User Registration',
          title: `New ${user.role} Registered`,
          description: `${user.name} (${user.email}) joined the platform.`,
          date: new Date(user.createdAt),
          icon: FiUserPlus,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
        });
      }
    });

    // Business registrations & updates
    businesses.forEach(business => {
      if (business.createdAt) {
        logs.push({
          id: `biz-reg-${business._id}`,
          type: 'Business Registration',
          title: `New Business Registered`,
          description: `${business.name} submitted registration for the ${business.category || 'General'} category.`,
          date: new Date(business.createdAt),
          icon: FiBriefcase,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30',
        });
      }

      // If updated recently and status is not pending, log a verification event
      if (business.updatedAt && business.updatedAt !== business.createdAt && business.verificationStatus !== 'Pending Review') {
        let actionColor = 'text-green-500 bg-green-50 dark:bg-green-900/30';
        if (business.verificationStatus === 'Rejected') {
          actionColor = 'text-red-500 bg-red-50 dark:bg-red-900/30';
        }

        logs.push({
          id: `biz-upd-${business._id}-${business.updatedAt}`,
          type: 'Verification Update',
          title: `Business Verification: ${business.verificationStatus}`,
          description: `Admin updated verification status for ${business.name}.`,
          date: new Date(business.updatedAt),
          icon: FiCheckCircle,
          color: actionColor,
        });
      }
    });

    // Sort by date descending
    return logs.sort((a, b) => b.date - a.date);
  }, [users, businesses]);

  // Filter and search
  const filteredActivities = activities.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || log.type.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-100 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiActivity className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Activity Logs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Track all platform activities across admins, users, and businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700">
        <div className="relative w-full sm:max-w-md flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search activity logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FiFilter className="text-gray-400 w-5 h-5" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 sm:w-48 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="All">All Activities</option>
            <option value="User">User Events</option>
            <option value="Business">Business Events</option>
            <option value="Verification">Verifications</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiActivity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No activities found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="relative border-l border-gray-200 dark:border-slate-700 ml-3 md:ml-4 space-y-8 pb-4">
            {filteredActivities.map((log, index) => (
              <div key={log.id} className="relative pl-8 md:pl-10">
                {/* Timeline Dot */}
                <span className={`absolute -left-[18px] top-1 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-800 ${log.color}`}>
                  <log.icon className="w-4 h-4" />
                </span>
                
                {/* Content */}
                <div className="bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 mb-2">
                        {log.type}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{log.title}</h3>
                    </div>
                    <time className="text-xs font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {log.date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {log.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminLogs;
