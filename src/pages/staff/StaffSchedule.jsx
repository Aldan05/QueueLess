import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCoffee, FiSun } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getDaysArray = (workingDaysString) => {
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  switch (workingDaysString) {
    case 'Everyday': return allDays;
    case 'Monday - Friday': return allDays.slice(0, 5);
    case 'Monday - Saturday': return allDays.slice(0, 6);
    case 'Monday - Thursday': return allDays.slice(0, 4);
    case 'Tuesday - Sunday': return allDays.slice(1, 7);
    case 'Tuesday - Saturday': return allDays.slice(1, 6);
    case 'Wednesday - Sunday': return allDays.slice(2, 7);
    case 'Thursday - Monday': return ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
    case 'Weekends Only (Sat-Sun)': return ['Saturday', 'Sunday'];
    case 'Monday, Wednesday, Friday': return ['Monday', 'Wednesday', 'Friday'];
    case 'Tuesday, Thursday, Saturday': return ['Tuesday', 'Thursday', 'Saturday'];
    default: return allDays.slice(0, 5); // Fallback to Mon-Fri
  }
};

const StaffSchedule = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`${API_URL}/businesses`);
        if (response.ok) {
          const businesses = await response.json();
          const myBusiness = businesses.find(b => b._id === currentStaff.businessId);
          setBusiness(myBusiness);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setLoading(false);
      }
    };
    if (currentStaff.businessId) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [currentStaff.businessId]);

  const days = business ? getDaysArray(business.workingDays) : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const startTime = business?.openingTime || '09:00 AM';
  const endTime = business?.closingTime || '05:00 PM';
  const weeklyHours = days.length * 8; // Approximation
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FiCalendar className="text-indigo-600" /> My Schedule
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">View your working hours and upcoming shifts.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold">
          Standard Shift
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading schedule...</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Weekly Overview</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {days.map(day => (
                  <div key={day} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-colors ${day === today ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${day === today ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'}`}>
                        {day.substring(0, 3)}
                      </div>
                      <div>
                        <p className={`font-bold ${day === today ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-200'}`}>{day}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5"><FiSun /> Standard Day Shift</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-semibold pl-16 sm:pl-0">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FiClock className="text-gray-400" /> {startTime} - {endTime}
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <FiCoffee className="text-gray-400" /> 1 Hr Break
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
            <h3 className="font-bold text-indigo-100 mb-6">Shift Details</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Assigned Counter</p>
                <p className="font-bold text-xl">{currentStaff.counter?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Weekly Hours</p>
                <p className="font-bold text-xl">~{weeklyHours} Hours</p>
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Timezone</p>
                <p className="font-bold text-xl">IST (Asia/Kolkata)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default StaffSchedule;
