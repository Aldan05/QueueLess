import { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiChevronDown, FiMonitor } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StaffSidebar from '../components/staff/StaffSidebar';
import { useLiveNotifications } from '../hooks/useLiveNotifications';
import { useDatabase } from '../context/DatabaseContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const StaffLayout = () => {
  const [currentStaff, setCurrentStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [counterStatus, setCounterStatus] = useState('Closed');
  const navigate = useNavigate();

  const { notifications, unreadCount } = useLiveNotifications();
  const { addLiveNotification } = useDatabase();
  const hasFetchedAnnouncements = useRef(false);

  useEffect(() => {
    const staffData = localStorage.getItem('currentStaff');

    if (staffData) {
      const parsed = JSON.parse(staffData);
      setCurrentStaff(parsed);
      setCounterStatus(parsed.counter?.status || 'Closed');
      
      if (!hasFetchedAnnouncements.current) {
        hasFetchedAnnouncements.current = true;
        // Fetch persisted announcements from DB
        fetch(`${API_URL}/businesses/${parsed.businessId}/announcements/staff`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              data.forEach(ann => {
                const alreadyExists = (notifications || []).some(n => n.message === ann.message);
                if (!alreadyExists) {
                  addLiveNotification('staff_announcement', ann.message, '📢');
                }
              });
            }
          })
          .catch(err => console.error('Failed to fetch notifications', err));
      }
    }
    setLoading(false);
  }, [addLiveNotification, notifications]);

  // Listen to custom DOM events for real-time staff announcements
  useEffect(() => {
    const handler = (e) => {
      const notif = e.detail;
      if (notif && notif.type === 'staff_announcement') {
        toast((t) => (
          <div>
            <p className="font-bold mb-1 text-amber-400">Business Announcement</p>
            <p className="text-sm">{notif.message}</p>
          </div>
        ), {
          icon: '📢',
          duration: 10000,
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        });
      }
    };
    window.addEventListener('liveNotificationReceived', handler);
    return () => window.removeEventListener('liveNotificationReceived', handler);
  }, []);

  if (loading) return null;

  if (!currentStaff) {
    return <Navigate to="/staff/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('currentStaff');
    window.dispatchEvent(new Event('auth_state_changed'));
    toast.success('Logged out successfully');
    navigate('/staff/login');
  };

  const toggleStatus = async (newStatus) => {
    if (!currentStaff.counter) return toast.error('You are not assigned to a counter');
    try {
      const response = await fetch(`${API_URL}/counters/${currentStaff.counter._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setCounterStatus(newStatus);
        
        // Update local storage to persist visual state
        const updatedStaff = { ...currentStaff, counter: { ...currentStaff.counter, status: newStatus } };
        localStorage.setItem('currentStaff', JSON.stringify(updatedStaff));
        setCurrentStaff(updatedStaff);
        
        toast.success(`Counter marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update counter status');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex">
      {/* Sidebar Component */}
      <StaffSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:pl-72 w-full">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between px-4 sm:px-8">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-white dark:bg-gray-800 shadow-sm rounded-xl text-gray-500 hover:text-blue-600 transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight hidden sm:block">
              Staff Portal
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Global Counter Status Toggle */}
            {currentStaff.counter ? (
              <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="hidden sm:flex text-xs font-bold text-gray-400 px-3 uppercase tracking-wider items-center gap-1.5">
                  <FiMonitor /> {currentStaff.counter.name}
                </span>
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm border border-gray-100 dark:border-slate-800 sm:ml-1">
                  <button 
                    onClick={() => toggleStatus('Open')}
                    className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-md transition-all ${counterStatus === 'Open' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => toggleStatus('Break')}
                    disabled={!currentStaff.permissions?.canStartBreak}
                    className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-md transition-all disabled:opacity-30 ${counterStatus === 'Break' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  >
                    Break
                  </button>
                  <button 
                    onClick={() => toggleStatus('Closed')}
                    className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-md transition-all ${counterStatus === 'Closed' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  >
                    Closed
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-red-50 dark:bg-red-900/20 p-2 px-3 rounded-xl border border-red-100 dark:border-red-800/50">
                <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <FiMonitor /> No Counter Assigned
                </span>
              </div>
            )}

            <Link to="/staff/notifications" className="relative p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors">
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></span>
              )}
            </Link>
            
            <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                {currentStaff.fullName?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-gray-900 dark:text-white">{currentStaff.fullName || 'Staff Member'}</p>
                <p className="text-gray-500 text-xs">{currentStaff.employeeId}</p>
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto">
          <Outlet context={{ toggleStatus, counterStatus, notifications }} />
        </main>
        
      </div>
    </div>
  );
};

export default StaffLayout;
