import React, { useState, useEffect, useCallback } from 'react';
import { FiPieChart, FiBarChart2, FiTrendingUp, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';

const BusinessAnalytics = () => {
  const { businesses, socket } = useDatabase();
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);

  const business = businesses.find(b => b._id === currentUser?.businessId);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchAnalytics = useCallback(async () => {
    if (!business) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history`);
      if (response.ok) {
        const history = await response.json();
        
        const totalVisitors = history.length;
        const completed = history.filter(q => q.status === 'completed');
        
        let totalWaitMs = 0;
        let validWaitCounts = 0;
        
        const hourCounts = {};
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

        history.forEach(q => {
          // Wait time calculation
          if (q.status === 'completed' && q.callTime && q.joinTime) {
            const waitMs = new Date(q.callTime) - new Date(q.joinTime);
            if (waitMs > 0) {
              totalWaitMs += waitMs;
              validWaitCounts++;
            }
          }

          // Busiest hour
          if (q.joinTime) {
            const d = new Date(q.joinTime);
            const hour = d.getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            
            // Day mapping (0 = Sun, 1 = Mon ... JS Date)
            // We want Mon=0 ... Sun=6
            let dayIndex = d.getDay() - 1;
            if (dayIndex === -1) dayIndex = 6; // Sunday
            dayCounts[dayIndex]++;
          }
        });

        const avgWaitTimeMins = validWaitCounts > 0 
          ? Math.round(totalWaitMs / validWaitCounts / 60000) 
          : (business.waiting * 5); // Rough fallback estimation

        // Find busiest hour
        let busiestHr = 12;
        let maxCount = 0;
        Object.keys(hourCounts).forEach(hr => {
          if (hourCounts[hr] > maxCount) {
            maxCount = hourCounts[hr];
            busiestHr = parseInt(hr);
          }
        });
        
        const formatHour = (h) => `${String(h).padStart(2, '0')}:00`;
        const busiestHourStr = maxCount > 0 ? `${formatHour(busiestHr)} - ${formatHour((busiestHr + 1) % 24)}` : 'N/A';

        // Normalize chart data relative to the max day count for percentage heights
        const maxDayCount = Math.max(...dayCounts, 1);
        const normalizedChart = dayCounts.map(count => (count / maxDayCount) * 100);

        setMetrics({
          totalVisitors: totalVisitors,
          completedServices: completed.length,
          averageWaitTime: avgWaitTimeMins,
          busiestHour: busiestHourStr
        });
        setChartData(normalizedChart);
      }
    } catch (error) {
      console.error('Failed to calculate analytics', error);
    }
  }, [business, API_URL]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!socket) return;
    socket.on('queueUpdated', fetchAnalytics);
    return () => socket.off('queueUpdated', fetchAnalytics);
  }, [socket, fetchAnalytics]);

  if (!business) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Queue Analytics</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time insights into your business performance.</p>
        </div>
      </div>

      {metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl"><FiUsers /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Visitors</p>
                <h3 className="text-3xl font-black text-gray-900">{metrics.totalVisitors}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl"><FiCheckCircle /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
                <h3 className="text-3xl font-black text-gray-900">{metrics.completedServices}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl"><FiClock /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Wait Time</p>
                <h3 className="text-3xl font-black text-gray-900">{metrics.averageWaitTime}m</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl"><FiTrendingUp /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Busiest Hour</p>
                <h3 className="text-xl font-black text-gray-900">{metrics.busiestHour}</h3>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">Loading analytics...</div>
      )}
      
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiBarChart2 className="text-blue-500" />
          Weekly Traffic Trends
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-l border-gray-100 pb-2">
          {chartData.map((height, i) => (
            <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end">
              <div 
                className={`w-full rounded-t-lg transition-all duration-1000 ${height > 0 ? 'bg-blue-500' : 'bg-transparent'}`}
                style={{ height: `${height}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-4 mt-2 text-xs font-bold text-gray-400">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

    </div>
  );
};

export default BusinessAnalytics;
