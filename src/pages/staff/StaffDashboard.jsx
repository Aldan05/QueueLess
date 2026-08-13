import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  FiPlay, FiPause, FiSlash, FiRefreshCw, FiSkipForward, FiCheck, FiCheckCircle,
  FiCoffee, FiUsers, FiUser, FiClock, FiActivity, FiX, FiRadio,
  FiSend, FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import QRScanner from './QRScanner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

// Helper to calculate 10 minutes prior arrival time
const calculate10MinBefore = (timeStr) => {
  if (!timeStr) return '';
  try {
    let hours = 0;
    let minutes = 0;
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      const d = new Date();
      d.setHours(hours, minutes - 10, 0, 0);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    console.error('Error calculating arrive time:', e);
  }
  return timeStr;
};

// Helper to convert time string to today's Date object
const parseTimeIntoTodayDate = (timeStr, baseDate) => {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
      } else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      const d = baseDate ? new Date(baseDate) : new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
  } catch (e) {
    console.error('Error parsing time:', e);
  }
  return null;
};

// Real-time helper for timing badges
const getCustomerTimingInfo = (customer, currentTime = new Date()) => {
  const nowMs = currentTime.getTime();

  if (customer.isPriority) {
    return {
      isReady: true,
      badgeText: '🚨 Priority',
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-300 dark:border-red-800/50',
      timeDetail: `Emergency • Joined ${new Date(customer.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      suggestedTime: null,
      arriveBy: null,
      isSuggested: false,
      isAccepted: false,
      note: null
    };
  }

  if (customer.suggestedTime) {
    const targetDate = parseTimeIntoTodayDate(customer.suggestedTime, customer.suggestedDate || customer.createdAt);
    const arriveBy = customer.suggestedArriveBy || calculate10MinBefore(customer.suggestedTime);
    const isAccepted = Boolean(customer.suggestionAccepted);
    const note = customer.suggestedNote || null;

    if (targetDate) {
      const diffMins = Math.round((targetDate.getTime() - nowMs) / 60000);
      if (diffMins <= 5) {
        return {
          isReady: true,
          badgeText: `🟢 Ready (Slot: ${customer.suggestedTime})`,
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50',
          timeDetail: `Slot ${customer.suggestedTime} ready`,
          suggestedTime: customer.suggestedTime,
          arriveBy,
          isSuggested: true,
          isAccepted,
          diffMins,
          note
        };
      } else {
        return {
          isReady: false,
          badgeText: `⏳ Slot: ${customer.suggestedTime}`,
          badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
          timeDetail: `In ~${diffMins} min`,
          suggestedTime: customer.suggestedTime,
          arriveBy,
          isSuggested: true,
          isAccepted,
          diffMins,
          note
        };
      }
    }

    return {
      isReady: true,
      badgeText: `Slot: ${customer.suggestedTime}`,
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
      timeDetail: `Slot: ${customer.suggestedTime}`,
      suggestedTime: customer.suggestedTime,
      arriveBy,
      isSuggested: true,
      isAccepted,
      note
    };
  }

  const joinTimeStr = customer.bookedTime || new Date(customer.joinTime || customer.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    isReady: true,
    badgeText: '🟢 Ready',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    timeDetail: `Joined ${joinTimeStr}`,
    suggestedTime: null,
    arriveBy: null,
    isSuggested: false,
    isAccepted: false,
    note: null
  };
};

// Sort queue by chronological ascending order of time
const sortQueueByRealTime = (queueList, currentTime = new Date()) => {
  return [...queueList].sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (b.isPriority && !a.isPriority) return 1;

    const getScore = (item) => {
      if (item.suggestedTime) {
        const targetDate = parseTimeIntoTodayDate(item.suggestedTime, item.suggestedDate || item.createdAt);
        if (targetDate) return targetDate.getTime();
      }
      if (item.bookedTime) {
        const bookedDate = parseTimeIntoTodayDate(item.bookedTime, item.createdAt);
        if (bookedDate) return bookedDate.getTime();
      }
      return new Date(item.joinTime || item.createdAt || Date.now()).getTime();
    };

    return getScore(a) - getScore(b);
  });
};

const BreakModal = ({ isOpen, onClose, onStartBreak }) => {
  const [reason, setReason] = useState('Lunch');
  const [duration, setDuration] = useState('15');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
        >
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <FiCoffee className="text-amber-500" /> Start Break
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer">
              <FiX />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Reason</label>
              <div className="flex flex-col gap-2">
                {['Lunch', 'Tea Break', 'Personal'].map(opt => (
                  <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${reason === opt ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                    <input type="radio" name="reason" value={opt} checked={reason === opt} onChange={() => setReason(opt)} className="text-amber-500 focus:ring-amber-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Duration (Minutes)</label>
              <input 
                type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-amber-500 outline-none dark:text-white"
              />
            </div>
            <button 
              onClick={() => onStartBreak(reason, duration)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Start Break
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const SuggestQueueModal = ({ isOpen, onClose, customer, onSuggest }) => {
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      const d = new Date(Date.now() + 30 * 60000);
      const defaultTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTime(customer.suggestedTime || defaultTimeStr);
      setNote(customer.suggestedNote || '');
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const arriveBy = calculate10MinBefore(time);

  const handleQuickAdd = (minutes) => {
    const d = new Date(Date.now() + minutes * 60000);
    setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!time.trim()) {
      toast.error('Please specify a suggested time.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSuggest(customer._id, { suggestedTime: time.trim(), note: note.trim() });
      onClose();
    } catch (err) {
      toast.error('Failed to send suggestion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
        >
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Suggest Queue Slot</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">For: {customer.customerId?.name || 'Customer'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Quick Select Options
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleQuickAdd(mins)}
                    className="py-2 px-3 text-xs font-bold bg-gray-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors text-center cursor-pointer"
                  >
                    +{mins < 60 ? `${mins}m` : '1 hr'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Suggested Time Slot
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/40 text-xs space-y-1">
              <div className="flex justify-between items-center text-blue-900 dark:text-blue-200 font-bold">
                <span>Customer Arrival Requirement (10 min before):</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{arriveBy || '--:--'}</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-[11px]">
                The customer will be notified to arrive 10 minutes prior ({arriveBy}) to enter the line directly.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Note / Reason (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. High rush right now. Please come at this suggested slot."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !time.trim()}
                className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <FiSend className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Suggestion'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const StaffDashboard = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const [businessData, setBusinessData] = useState(null);
  const [activeTokens, setActiveTokens] = useState([]);
  const [servingCustomerData, setServingCustomerData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCustomer, setScannedCustomer] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [suggestingCustomer, setSuggestingCustomer] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toggleStatus, counterStatus, notifications } = useOutletContext();
  
  const [stats, setStats] = useState({
    completed: 0,
    missed: 0,
    avgServiceTime: 0,
    breakTimeUsed: 0,
    workingHours: '0h 0m'
  });

  // Keep currentTime ticking every 10s
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBusiness();
    fetchAnalytics();
    
    // Poll analytics every minute to update working hours
    const interval = setInterval(fetchAnalytics, 60000);
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('joinBusinessRoom', currentStaff.businessId);
    });

    newSocket.on('queueUpdated', (data) => {
      if (data.business) {
        setBusinessData(data.business);
        fetchActiveQueue(data.business);
      } else {
        fetchActiveQueue(businessData);
      }
      fetchAnalytics();
    });

    return () => {
      newSocket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses`);
      const allBusinesses = await response.json();
      const myBusiness = allBusinesses.find(b => b._id === currentStaff.businessId);
      setBusinessData(myBusiness);
      fetchActiveQueue(myBusiness);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActiveQueue = async (bizData) => {
    try {
      const bData = bizData || businessData;
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/active`);
      if (response.ok) {
        const queue = await response.json();
        const waiting = queue.filter(q => ['waiting', 'suggested_time'].includes(q.status));
        setActiveTokens(waiting);
        if (bData?.currentToken) {
          const serving = queue.find(q => q.status === 'serving' && q.token === bData.currentToken);
          setServingCustomerData(serving || null);
        } else {
          setServingCustomerData(null);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    if (!currentStaff._id) return;
    try {
      const response = await fetch(`${API_URL}/staff-analytics/today/${currentStaff._id}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          completed: data.customersServed,
          missed: data.missedCustomers,
          avgServiceTime: data.avgServiceTime,
          breakTimeUsed: data.breakTimeUsed,
          workingHours: data.workingHours
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const callNext = async (target = null) => {
    try {
      const sortedWaiting = sortQueueByRealTime(activeTokens, currentTime);
      const resolvedTarget = target || (sortedWaiting.length > 0 ? sortedWaiting[0] : null);

      const payload = {};
      if (typeof resolvedTarget === 'string') {
        payload.token = resolvedTarget;
      } else if (resolvedTarget && resolvedTarget.token) {
        payload.queueId = resolvedTarget._id;
        payload.token = resolvedTarget.token;
      }

      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/next`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const label = payload.token ? `Called token ${payload.token}` : 'Called next token';
        toast.success(label);
        fetchBusiness();
        fetchAnalytics();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to call next');
      }
    } catch (error) { toast.error('Server error'); }
  };

  const handleSuggestTime = async (queueId, { suggestedTime, note }) => {
    try {
      const res = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/${queueId}/suggest-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedTime, note })
      });
      if (res.ok) {
        toast.success(`Suggested slot ${suggestedTime} sent!`);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to suggest time');
      }
    } catch (e) {
      toast.error('Server error');
    }
  };

  const handleComplete = async () => {
    if (!businessData?.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(`Completed token ${businessData.currentToken}`);
        fetchBusiness();
        fetchAnalytics();
      } else {
        toast.error('Failed to complete token');
      }
    } catch (error) { toast.error('Server error'); }
  };

  const handleSkip = async () => {
    if (!businessData?.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/skip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(`Skipped token ${businessData.currentToken}`);
        fetchBusiness();
        fetchAnalytics();
      } else {
        toast.error('Failed to skip token');
      }
    } catch (error) { toast.error('Server error'); }
  };

  const handleRecall = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/recall-last-missed`, {
        method: 'PATCH',
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Recalled missed token ${data.token}`);
        fetchBusiness();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to recall token');
      }
    } catch (error) { toast.error('Server error'); }
  };

  const handleStartBreak = (reason, duration) => {
    toggleStatus('Break');
    setIsBreakModalOpen(false);
    toast.success(`${reason} break started for ${duration} mins`);
  };

  const handleScanSuccess = async (qrData) => {
    try {
      const response = await fetch(`${API_URL}/staff/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: qrData.appointmentId,
          verificationCode: qrData.verificationCode,
          businessId: currentStaff.businessId
        })
      });
      if (response.ok) {
        const apt = await response.json();
        setIsScannerOpen(false);
        setScannedCustomer(apt);
        toast.success('Customer Verified!');
      } else {
        const err = await response.json();
        toast.error(err.message || 'Verification failed');
      }
    } catch (err) {
      toast.error('Server error during scan');
    }
  };

  const handleAssignCounter = async () => {
    if (!selectedCounter) return toast.error('Select a counter');
    try {
      const response = await fetch(`${API_URL}/staff/assign-counter`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: scannedCustomer._id,
          counterNumber: selectedCounter,
          businessId: currentStaff.businessId
        })
      });
      if (response.ok) {
        toast.success(`Assigned to ${selectedCounter}`);
        setScannedCustomer(null);
        setSelectedCounter('');
      } else {
        toast.error('Failed to assign counter');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const handleSetQueueStatus = async (newStatus) => {
    if (!currentStaff.businessId) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const msg = newStatus === 'open' 
          ? '🟢 Queue is now OPEN and accepting customers!' 
          : newStatus === 'paused' 
          ? '⏸️ Queue is now PAUSED (New joins temporarily stopped)' 
          : '🛑 Queue is now CLOSED for today';
        toast.success(msg, { id: 'staff-dash-queue-status' });
        fetchBusiness();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to update queue status');
      }
    } catch (error) {
      toast.error('Server error updating queue status');
    }
  };

  const sortedActiveTokens = sortQueueByRealTime(activeTokens, currentTime);
  const waitingCount = sortedActiveTokens.length;
  const currentCustomer = businessData?.currentToken && businessData.currentToken !== '-' ? {
    token: businessData.currentToken,
    name: servingCustomerData?.customerId?.name || 'Walk-in Customer',
    service: servingCustomerData?.purpose || 'General Service',
    bookedTime: servingCustomerData?.joinedAt ? new Date(servingCustomerData.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
    estTime: '-'
  } : null;

  const currentQueueStatus = businessData?.queueStatus || (businessData?.queueActive !== false ? 'open' : 'closed');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Queue Status & Quick Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            currentQueueStatus === 'open' ? 'bg-emerald-500 animate-pulse' : currentQueueStatus === 'paused' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
          }`} />
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Queue Status</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white capitalize flex items-center gap-2">
              {currentQueueStatus === 'open' && <span className="text-emerald-600 dark:text-emerald-400">🟢 Active / Open (Accepting Customers)</span>}
              {currentQueueStatus === 'paused' && <span className="text-amber-600 dark:text-amber-400">⏸️ Paused (New Joins Paused)</span>}
              {currentQueueStatus === 'closed' && <span className="text-rose-600 dark:text-rose-400">🛑 Closed</span>}
            </div>
          </div>
        </div>

        {/* 3-State Queue Status Switcher */}
        <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner">
          <button 
            onClick={() => handleSetQueueStatus('open')}
            title="Open queue"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentQueueStatus === 'open' 
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <FiPlay className="w-3 h-3" /> Open
          </button>

          <button 
            onClick={() => handleSetQueueStatus('paused')}
            title="Pause queue"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentQueueStatus === 'paused' 
                ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <FiPause className="w-3 h-3" /> Pause
          </button>

          <button 
            onClick={() => handleSetQueueStatus('closed')}
            title="Close queue"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentQueueStatus === 'closed' 
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500' 
                : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <FiSlash className="w-3 h-3" /> Close
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl"><FiUsers /></div>
            <div><p className="text-sm font-semibold text-gray-500">Waiting</p><p className="text-2xl font-bold dark:text-white">{waitingCount}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl"><FiPlay /></div>
            <div><p className="text-sm font-semibold text-gray-500">Serving</p><p className="text-2xl font-bold dark:text-white">{currentCustomer?.token || '-'}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl"><FiCheck /></div>
            <div><p className="text-sm font-semibold text-gray-500">Completed</p><p className="text-2xl font-bold dark:text-white">{stats.completed}</p></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl"><FiX /></div>
            <div><p className="text-sm font-semibold text-gray-500">Missed</p><p className="text-2xl font-bold dark:text-white">{stats.missed}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Current Customer + Actions) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><FiUser className="w-48 h-48" /></div>
            <h2 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-6">Current Customer</h2>
            
            {currentCustomer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div>
                  <div className="text-6xl font-black mb-2 tracking-tight">{currentCustomer.token}</div>
                  <div className="text-xl font-medium text-blue-100">{currentCustomer.name}</div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between border-b border-blue-500/50 pb-2">
                    <span className="text-blue-200 font-medium">Service</span>
                    <span className="font-bold">{currentCustomer.service}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-500/50 pb-2">
                    <span className="text-blue-200 font-medium">Booked Time</span>
                    <span className="font-bold">{currentCustomer.bookedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200 font-medium">Est. Time</span>
                    <span className="font-bold">{currentCustomer.estTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-blue-200 relative z-10">
                <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium">No customer currently being served</p>
                <p className="mt-2 text-blue-300">Call the next person in line to begin.</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button onClick={() => setIsScannerOpen(true)} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer">
                <FiRadio className="w-6 h-6" /> Scan QR
              </button>
              <button onClick={() => callNext()} disabled={currentStaff.permissions?.canCallNext === false || sortedActiveTokens.length === 0} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <FiPlay className="w-6 h-6" /> Call Next
              </button>
              <button onClick={handleRecall} disabled={currentStaff.permissions?.canRecall === false || (businessData?.currentToken && businessData.currentToken !== '-')} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-900/50 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <FiRefreshCw className="w-6 h-6" /> Recall Missed
              </button>
              <button onClick={handleSkip} disabled={currentStaff.permissions?.canSkip === false || !businessData?.currentToken || businessData.currentToken === '-'} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-900/50 dark:text-gray-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <FiSkipForward className="w-6 h-6" /> Skip
              </button>
              <button onClick={handleComplete} disabled={currentStaff.permissions?.canComplete === false || !businessData?.currentToken || businessData.currentToken === '-'} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                <FiCheck className="w-6 h-6" /> Complete
              </button>
              {counterStatus === 'Break' ? (
                <button onClick={() => toggleStatus('Open')} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all md:col-span-2 cursor-pointer">
                  <FiPlay className="w-6 h-6" /> Resume Work
                </button>
              ) : (
                <button disabled={currentStaff.permissions?.canStartBreak === false} onClick={() => setIsBreakModalOpen(true)} className="flex flex-col items-center gap-3 p-5 rounded-2xl font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-500 transition-colors md:col-span-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  <FiCoffee className="w-6 h-6" /> Start Break
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Upcoming Queue + Activity) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Upcoming Queue</h3>
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-xs font-bold rounded-lg text-gray-600 dark:text-gray-300">
                {sortedActiveTokens.length} in line
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {sortedActiveTokens.slice(0, 8).map((q, idx) => {
                const timingInfo = getCustomerTimingInfo(q, currentTime);
                return (
                  <div key={q._id || idx} className="p-3.5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 transition-all space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-900 dark:text-white text-base">#{idx + 1} {q.token}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${timingInfo.badgeClass}`}>
                            {timingInfo.badgeText}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {q.customerId?.name || 'Customer'} • {q.service || 'General'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => setSuggestingCustomer(q)}
                          className="text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title={q.status === 'suggested_time' || q.suggestedTime ? 'Update time slot' : 'Suggest time slot'}
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => callNext(q)}
                          className="text-blue-600 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Call this customer"
                        >
                          <FiPlay className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {timingInfo.isSuggested ? (
                      <div className="p-2 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-[11px] space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-amber-900 dark:text-amber-200">
                            Slot: {timingInfo.suggestedTime}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${timingInfo.isAccepted ? 'bg-green-100 text-green-800' : 'bg-amber-200 text-amber-900'}`}>
                            {timingInfo.isAccepted ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                        {timingInfo.arriveBy && (
                          <div className="text-amber-800 dark:text-amber-300 font-medium">
                            Arrive by: {timingInfo.arriveBy}
                          </div>
                        )}
                        {timingInfo.note && (
                          <div className="text-gray-500 italic truncate">
                            "{timingInfo.note}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 font-medium">
                        {timingInfo.timeDetail}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {sortedActiveTokens.length === 0 && (
                <div className="text-center text-gray-400 py-16 italic text-sm">
                  The queue is currently empty.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiActivity className="text-indigo-500" /> Today's Activity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Customers Served</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Service Time</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.avgServiceTime} min</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Break Time Used</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.breakTimeUsed} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Working Hours</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.workingHours}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      <BreakModal 
        isOpen={isBreakModalOpen} 
        onClose={() => setIsBreakModalOpen(false)} 
        onStartBreak={handleStartBreak}
      />
      
      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />

      <SuggestQueueModal
        isOpen={!!suggestingCustomer}
        onClose={() => setSuggestingCustomer(null)}
        customer={suggestingCustomer}
        onSuggest={handleSuggestTime}
      />

      {/* Customer Verified Modal */}
      <AnimatePresence>
        {scannedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-green-50 dark:bg-green-900/20">
                <h2 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <FiCheckCircle className="w-6 h-6" /> Customer Verified
                </h2>
                <button onClick={() => setScannedCustomer(null)} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-xl transition-colors cursor-pointer">
                  <FiX />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{scannedCustomer.customerId?.name || 'Unknown'}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Token Number</p>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{scannedCustomer.tokenNumber}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2">{scannedCustomer.service || 'General Service'}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Assign to Counter</label>
                  <select 
                    value={selectedCounter} 
                    onChange={e => setSelectedCounter(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white font-bold"
                  >
                    <option value="" disabled>Select a counter...</option>
                    <option value="1">Counter 1</option>
                    <option value="2">Counter 2</option>
                    <option value="3">Counter 3</option>
                    <option value="4">Counter 4</option>
                    <option value="5">Counter 5</option>
                  </select>
                </div>

                <button 
                  onClick={handleAssignCounter}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiPlay className="w-5 h-5" /> Assign and Start Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDashboard;
