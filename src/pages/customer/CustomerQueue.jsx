import { FiList, FiClock, FiSearch } from 'react-icons/fi';
import ActiveQueueWidget from '../../components/customer/ActiveQueueWidget';
import { useDatabase } from '../../context/DatabaseContext';

const CustomerQueue = () => {
  const { activeCustomerQueue } = useDatabase();

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-50 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <FiList className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Queue
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Track your real-time position in the line.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiClock className="text-blue-500" />
            Current Status
          </h2>
          {activeCustomerQueue && activeCustomerQueue.status === 'waiting' && (
             <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wide">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               Live Tracking Active
             </span>
          )}
        </div>

        {/* We reuse the beautiful ActiveQueueWidget which handles everything (including the empty state if they aren't in a queue) */}
        <ActiveQueueWidget />
        
        {(!activeCustomerQueue || ['completed', 'cancelled', 'rejected'].includes(activeCustomerQueue.status)) ? (
          <div className="mt-6 text-center">
             <a 
                href="/customer/find"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5"
             >
                <FiSearch className="w-5 h-5" /> Find Businesses to Join
             </a>
          </div>
        ) : null}
      </div>

    </div>
  );
};

export default CustomerQueue;
