import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const StaffCustomers = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
    
    const newSocket = io(SOCKET_URL);
    newSocket.on('connect', () => {
      newSocket.emit('joinBusinessRoom', currentStaff.businessId);
    });

    newSocket.on('queueUpdated', () => {
      fetchHistory();
    });

    return () => newSocket.disconnect();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      toast.error('Failed to load customer history');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (customer) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customer.token, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(`Approved customer ${customer.token}`);
        fetchHistory();
      } else {
        toast.error('Failed to approve customer');
      }
    } catch (error) {
      toast.error('Server error during approval');
    }
  };

  const handleRestore = async (customer) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/restore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customer.token })
      });
      if (response.ok) {
        toast.success(`Restored customer ${customer.token} to queue`);
        fetchHistory();
      } else {
        toast.error('Failed to restore customer');
      }
    } catch (error) {
      toast.error('Server error during restore');
    }
  };

  const filteredHistory = history.filter(q => 
    q.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerId?.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUsers className="text-blue-600" /> Customer History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">View the history of customers served.</p>
        </div>
        <div className="w-full md:w-auto relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search token or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading customers...</td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FiUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((q, idx) => {
                  const cName = q.customerId?.name || 'Walk-in Customer';
                  const cService = q.purpose || q.service || 'General Service';
                  return (
                    <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-black text-gray-900 dark:text-white text-lg">{q.token}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                            {cName.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-semibold text-gray-900 dark:text-gray-200">{cName}</span>
                            <span className="block text-xs text-gray-500">{q.customerId?.phone || 'No phone number'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{cService}</span>
                      </td>
                      <td className="px-6 py-4">
                        {q.status === 'completed' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500"><FiCheckCircle /> Completed</span>}
                        {q.status === 'missed' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500"><FiXCircle /> Missed</span>}
                        {q.status === 'waiting' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">Waiting</span>}
                        {q.status === 'serving' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500">Serving</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-end gap-3">
                          {q.status === 'waiting' && (
                            <button 
                              onClick={() => handleApprove(q)}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {q.status === 'missed' && (
                            <button 
                              onClick={() => handleRestore(q)}
                              className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                              Recall
                            </button>
                          )}
                          <div className="flex items-center gap-1.5">
                            <FiClock /> 
                            {q.completeTime ? new Date(q.completeTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(q.joinTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffCustomers;
