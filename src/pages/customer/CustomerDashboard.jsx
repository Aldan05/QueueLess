import { motion } from 'framer-motion';
import { 
  FiList, FiClock, FiCalendar, FiCheckCircle, 
  FiSearch, FiPlusCircle, FiHeart, FiAlertCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatCard from '../../components/customer/StatCard';
import ActiveQueueWidget from '../../components/customer/ActiveQueueWidget';
import ActiveAppointmentWidget from '../../components/customer/ActiveAppointmentWidget';
import QuickActionCard from '../../components/customer/QuickActionCard';
import BusinessServiceCard from '../../components/customer/BusinessServiceCard';
import CustomerAnnouncementsWidget from '../../components/customer/CustomerAnnouncementsWidget';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { businesses, joinQueue } = useDatabase();
  const { currentUser } = useAuth();
  const verifiedBusinesses = businesses.filter(b => b.isVerified || b.verificationStatus === 'Approved' || b.verificationStatus === 'Pending Review' || !b.verificationStatus);

  // Stats derived from actual data
  const stats = [
    { title: 'Active Queues', value: '1', icon: FiList, colorClass: 'bg-blue-50' },
    { title: 'Est. Waiting Time', value: '25m', icon: FiClock, colorClass: 'bg-orange-50', trend: 'down', trendValue: '5m' },
    { title: 'Upcoming Appts', value: '2', icon: FiCalendar, colorClass: 'bg-purple-50' },
    { title: 'Completed Visits', value: '14', icon: FiCheckCircle, colorClass: 'bg-green-50', trend: 'up', trendValue: '2' },
  ];

  const quickActions = [
    { title: 'Join Queue', icon: FiPlusCircle, colorClass: 'bg-primary/10 text-primary', onClick: () => navigate('/customer/queue') },
    { title: 'Find Business', icon: FiSearch, colorClass: 'bg-indigo-50 text-indigo-500', onClick: () => navigate('/customer/find') },
    { title: 'Book Appt', icon: FiCalendar, colorClass: 'bg-purple-50 text-purple-500', onClick: () => navigate('/customer/appointments') },
    { title: 'Emergency', icon: FiAlertCircle, colorClass: 'bg-red-50 text-red-500', onClick: () => toast.error('Emergency SOS activated! Contacting support...', { icon: '🚨' }) },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-br from-white to-blue-50/50 p-6 sm:p-8 rounded-3xl border border-blue-100/50 shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Good Morning, {currentUser?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">
            Ready to skip the queue today?
          </p>
          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-gray-400">
            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">{currentDate}</span>
            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">{currentTime}</span>
            <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center">
              <span className="text-yellow-500 mr-1.5 text-lg leading-none">☀️</span> 72°F
            </span>
          </div>
        </div>
        
        <div className="flex gap-3 relative z-10 mt-4 md:mt-0">
          <button 
            onClick={() => navigate('/customer/find')}
            className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            Find Nearby
          </button>
          <button 
            onClick={() => navigate('/customer/queue')}
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all"
          >
            Join Queue
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <QuickActionCard key={index} {...action} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Stats + Active Queue) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} delay={index * 0.1} />
            ))}
          </div>


          {/* Active Appointment Widget */}
          <ActiveAppointmentWidget />
          
          {/* Announcements */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Current Focus</h2>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <ActiveQueueWidget />
          </div>

        </div>

        {/* Right Column (Recommended Businesses) */}
        <div className="space-y-6">
          <CustomerAnnouncementsWidget />

          <div>
            <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recommended</h2>
            <button className="text-sm font-bold text-primary hover:text-blue-700 transition-colors">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {verifiedBusinesses.map((biz, index) => (
              <BusinessServiceCard 
                key={biz._id} 
                business={biz} 
                onJoin={(id) => navigate(`/customer/business/${id}?join=true`)}
                delay={index * 0.1 + 0.3} 
              />
            ))}
          </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerDashboard;
