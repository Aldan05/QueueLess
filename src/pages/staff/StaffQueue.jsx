import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiClock, FiAlertCircle, FiCheckCircle, FiPlay, FiPause, 
  FiSkipForward, FiRefreshCw, FiShield, FiXCircle, FiPhone, FiFileText, 
  FiX, FiList, FiSend, FiTrash2, FiCalendar, FiSlash 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

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

// Helper to convert time string e.g. "11:56 am" to today's Date object for real-time comparison
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

// Real-time helper to evaluate badge & timing status
const getCustomerTimingInfo = (customer, currentTime = new Date()) => {
  const nowMs = currentTime.getTime();

  if (customer.isPriority) {
    return {
      isReady: true,
      badgeText: '🚨 Emergency Priority',
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
          badgeText: `🟢 Ready Now (Slot: ${customer.suggestedTime})`,
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50',
          timeDetail: `Slot: ${customer.suggestedTime} • Ready to call`,
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
          timeDetail: `In ~${diffMins} min (Slot: ${customer.suggestedTime})`,
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
    badgeText: '🟢 Ready Now',
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

const CustomerDetailsModal = ({ isOpen, onClose, customer, onApprove, onReject, onOpenSuggest }) => {
  if (!isOpen || !customer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
        >
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50 dark:bg-slate-800/50">
            <div>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">Token {customer.token || 'PENDING'}</span>
              <h2 className="text-xl font-bold dark:text-white">{customer.customerId?.name || 'Walk-in Customer'}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
              <FiX />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                <FiPhone />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                <p className="font-semibold text-gray-900 dark:text-gray-200">{customer.customerId?.phone || '********45'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                <FiFileText />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Service</p>
                <p className="font-semibold text-gray-900 dark:text-gray-200">{customer.service || customer.purpose || 'General'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
                <FiClock />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Booked / Joined Time</p>
                <p className="font-semibold text-gray-900 dark:text-gray-200">{customer.bookedTime || new Date(customer.joinTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs text-amber-600 dark:text-amber-500 font-bold uppercase mb-1">Remarks / Notes</p>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{customer.notes || customer.remarks || 'No notes provided'}</p>
            </div>

            {customer.documents && customer.documents.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ID Verification</p>
                {customer.documents.map((doc, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{doc.type}</p>
                    <div className="flex gap-4">
                      {doc.frontImage && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Front Image</span>
                          <img src={doc.frontImage} alt="Front ID" className="h-24 w-auto object-contain rounded border border-gray-300 dark:border-slate-600" />
                        </div>
                      )}
                      {doc.backImage && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">Back Image</span>
                          <img src={doc.backImage} alt="Back ID" className="h-24 w-auto object-contain rounded border border-gray-300 dark:border-slate-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { onApprove(customer._id); onClose(); }}
                className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer text-sm"
              >
                <FiCheckCircle /> Approve
              </button>
              <button 
                onClick={() => { onReject(customer._id); onClose(); }}
                className="flex items-center justify-center gap-2 py-3 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                <FiXCircle /> Reject
              </button>
            </div>
            {onOpenSuggest && (
              <button
                onClick={() => { onClose(); onOpenSuggest(customer); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold rounded-xl transition-colors border border-amber-200 dark:border-amber-800/40 text-xs cursor-pointer"
              >
                <FiClock /> Suggest Alternate Time Slot
              </button>
            )}
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
      // Default to 30 mins from now
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
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Suggest Live Queue Slot</h2>
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

            {/* 10-Minute Prior Rule Calculation Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/40 text-xs space-y-1">
              <div className="flex justify-between items-center text-blue-900 dark:text-blue-200 font-bold">
                <span>Customer Arrival Requirement (10 min before):</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{arriveBy || '--:--'}</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-[11px]">
                The customer will be notified to reach 10 minutes prior ({arriveBy}) to enter the line directly.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Note / Reason (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. High rush now. Please arrive at this slot."
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

const StaffQueue = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  const [businessData, setBusinessData] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [suggestingCustomer, setSuggestingCustomer] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [socket, setSocket] = useState(null);

  // Keep currentTime ticking every 10s for real-time timing & arrive-by countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBusiness();
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('joinBusinessRoom', currentStaff.businessId);
    });

    newSocket.on('queueUpdated', (data) => {
      if (data.business) setBusinessData(data.business);
      fetchActiveQueue();
    });

    return () => newSocket.disconnect();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses`);
      const allBusinesses = await response.json();
      const myBusiness = allBusinesses.find(b => b._id === currentStaff.businessId);
      setBusinessData(myBusiness);
      fetchActiveQueue();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActiveQueue = async () => {
    if (!currentStaff.businessId) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/active`);
      if (response.ok) {
        const data = await response.json();
        const waitingOnly = data.filter(q => ['waiting', 'suggested_time'].includes(q.status));
        const pendingOnly = data.filter(q => ['pending_verification', 'info_requested'].includes(q.status));
        setActiveQueue(waitingOnly);
        setPendingQueue(pendingOnly);
      }
    } catch (error) {
      console.error('Failed to fetch active queue', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetQueueStatus = async (newStatus) => {
    if (!currentStaff.businessId) return;
    try {
      setIsProcessing(true);
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
        toast.success(msg, { id: 'staff-queue-status-toast' });
        fetchBusiness();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to update queue status');
      }
    } catch (error) {
      toast.error('Server error updating queue status');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleQueue = async () => {
    const currentQueueStatus = businessData?.queueStatus || (businessData?.queueActive !== false ? 'open' : 'closed');
    const nextStatus = currentQueueStatus === 'open' ? 'paused' : 'open';
    await handleSetQueueStatus(nextStatus);
  };

  const callNextPerson = async (target = null) => {
    if (!businessData) return;
    try {
      setIsProcessing(true);
      const sortedWaiting = sortQueueByRealTime(activeQueue, currentTime);
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
        const calledLabel = payload.token ? `Called token ${payload.token}!` : 'Next customer called!';
        toast.success(calledLabel);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to call next person');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleSuggestTime = async (queueId, { suggestedTime, note }) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/${queueId}/suggest-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedTime, note })
      });
      if (res.ok) {
        toast.success(`Suggested slot ${suggestedTime} sent to customer!`);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to suggest time');
      }
    } catch (e) {
      toast.error('Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQueueItem = async (queueId, token) => {
    if (!window.confirm(`Are you sure you want to remove token ${token || 'request'} from the queue?`)) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/${queueId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success(`Removed token ${token}`);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to delete token');
      }
    } catch (e) {
      toast.error('Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!businessData || !businessData.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/skip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(`Skipped token ${businessData.currentToken}`);
        fetchActiveQueue();
        fetchBusiness();
      } else toast.error('Failed to skip token');
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleComplete = async () => {
    if (!businessData || !businessData.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(`Completed token ${businessData.currentToken}`);
        fetchActiveQueue();
        fetchBusiness();
      } else toast.error('Failed to complete token');
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRecall = async () => {
    if (!businessData) return;
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/recall-last-missed`, { method: 'PATCH' });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Recalled token ${data.token}`);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to recall token');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleApproveVerification = async (queueId) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/${queueId}/verify/approve`, { method: 'PATCH' });
      if (res.ok) { 
        toast.success('Approved customer and added to queue!'); 
        fetchActiveQueue(); 
        fetchBusiness(); 
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Error approving'); 
      }
    } catch (e) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRejectVerification = async (queueId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${currentStaff.businessId}/queue/${queueId}/verify/reject`, { 
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ reason: reason || 'Documents did not match requirements.' }) 
      });
      if (res.ok) { 
        toast.success('Verification rejected.'); 
        fetchActiveQueue(); 
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Error rejecting'); 
      }
    } catch (e) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  if (!businessData) return <div className="text-center py-20 text-gray-400">Loading business data...</div>;

  const requiresVerification = businessData?.verificationSettings?.requireVerification || pendingQueue.length > 0;
  const sortedWaitingQueue = sortQueueByRealTime(activeQueue, currentTime);

  const currentQueueStatus = businessData?.queueStatus || (businessData?.queueActive !== false ? 'open' : 'closed');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Queue Management</h1>
          <p className="text-gray-500 font-medium mt-1">Control your active counter and manage waiting customers.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => toast('Priority issuing coming soon!', { icon: '🚧' })}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-bold rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm text-xs sm:text-sm cursor-pointer"
          >
            <FiAlertCircle /> Priority Token
          </button>
          
          {/* 3-State Queue Status Switcher */}
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
            <button 
              onClick={() => handleSetQueueStatus('open')}
              disabled={isProcessing}
              title="Open queue - allow customer joins and calling"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentQueueStatus === 'open' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400' 
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-white'
              }`}
            >
              <FiPlay className="w-3.5 h-3.5" /> Open
            </button>

            <button 
              onClick={() => handleSetQueueStatus('paused')}
              disabled={isProcessing}
              title="Pause queue - temporarily pause customer joins"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentQueueStatus === 'paused' 
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400' 
                  : 'text-gray-600 hover:text-amber-600 hover:bg-white'
              }`}
            >
              <FiPause className="w-3.5 h-3.5" /> Pause
            </button>

            <button 
              onClick={() => handleSetQueueStatus('closed')}
              disabled={isProcessing}
              title="Close queue - closed for today"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentQueueStatus === 'closed' 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-500' 
                  : 'text-gray-600 hover:text-rose-600 hover:bg-white'
              }`}
            >
              <FiSlash className="w-3.5 h-3.5" /> Close
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Current Status & Serving */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2.5 transition-colors duration-300 ${
              currentQueueStatus === 'open' ? 'bg-emerald-500' : currentQueueStatus === 'paused' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></div>
            
            {currentQueueStatus === 'open' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                QUEUE ACTIVE / OPEN
              </div>
            ) : currentQueueStatus === 'paused' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                QUEUE PAUSED
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                QUEUE CLOSED
              </div>
            )}

            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Currently Serving</p>
            <h2 className="text-6xl font-black text-gray-900 tracking-tighter mb-6">
              {!businessData.currentToken || businessData.currentToken === '-' ? 'None' : businessData.currentToken}
            </h2>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={() => callNextPerson()}
                disabled={isProcessing || currentQueueStatus !== 'open' || sortedWaitingQueue.length === 0}
                className={`col-span-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isProcessing || currentQueueStatus !== 'open' || sortedWaitingQueue.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5'
                }`}
              >
                <FiPlay className="w-5 h-5" /> Call Next Person
              </button>
              
              <button 
                onClick={handleComplete}
                disabled={isProcessing || !businessData.currentToken || businessData.currentToken === '-'}
                className="py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <FiCheckCircle className="w-5 h-5" /> <span className="text-sm">Complete</span>
              </button>

              <button 
                onClick={handleSkip}
                disabled={isProcessing || !businessData.currentToken || businessData.currentToken === '-'}
                className="py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <FiSkipForward className="w-5 h-5" /> <span className="text-sm">Skip</span>
              </button>

              <button 
                onClick={handleRecall}
                disabled={isProcessing || (businessData.currentToken && businessData.currentToken !== '-')}
                className="col-span-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <FiRefreshCw className="w-5 h-5" /> Recall Missed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <FiUsers className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-gray-900">{businessData.waiting}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Waiting</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <FiClock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-gray-900">{businessData.avgWaitTime}m</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Est. Wait</p>
            </div>
          </div>
        </div>

        {/* Right Column: Up Next List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              {requiresVerification ? (
                <div className="flex gap-6 w-full">
                  <button 
                    onClick={() => setActiveTab('waiting')}
                    className={`font-extrabold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'waiting' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Up Next 
                    <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'waiting' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{sortedWaitingQueue.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('verification')}
                    className={`font-extrabold text-lg transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'verification' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Verifications
                    {pendingQueue.length > 0 && (
                      <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs shadow-sm animate-pulse">{pendingQueue.length}</span>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-extrabold text-gray-900 text-lg">Up Next</h3>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {sortedWaitingQueue.length} in line
                  </span>
                </>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400 font-medium">Loading queue...</div>
              ) : activeTab === 'waiting' ? (
                sortedWaitingQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <FiUsers className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Queue is Empty</h3>
                    <p className="text-gray-500 font-medium">There are currently no customers waiting.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {sortedWaitingQueue.map((customer, index) => {
                        const timingInfo = getCustomerTimingInfo(customer, currentTime);
                        const isNextUp = index === 0 && timingInfo.isReady;

                        return (
                          <motion.div 
                            key={customer._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all gap-4 ${
                              isNextUp
                                ? 'bg-blue-50/60 border-blue-200 shadow-sm ring-1 ring-blue-400/30' 
                                : customer.isPriority
                                  ? 'bg-red-50/30 border-red-100'
                                  : timingInfo.isSuggested && !timingInfo.isReady
                                    ? 'bg-indigo-50/30 border-indigo-100'
                                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 mt-0.5 ${
                                isNextUp 
                                  ? 'bg-blue-600 text-white shadow-md' 
                                  : customer.isPriority
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                #{index + 1}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-gray-900 text-lg">{customer.token}</h4>
                                  
                                  {/* Real-Time Timing Badge */}
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${timingInfo.badgeClass}`}>
                                    {timingInfo.badgeText}
                                  </span>

                                  {customer.isPriority && (
                                    <span className="bg-red-100 text-red-700 text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded">
                                      Priority
                                    </span>
                                  )}

                                  {isNextUp && (
                                    <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse">
                                      Next Up
                                    </span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 font-semibold mt-0.5">
                                  <span className="text-gray-900 font-bold">{customer.customerId?.name || 'Walk-in Customer'}</span>
                                  {customer.service && ` • ${customer.service}`}
                                </p>

                                {/* Prominent Visualized Suggested Time Section */}
                                {timingInfo.isSuggested ? (
                                  <div className="mt-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs space-y-1 max-w-xl">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="font-black text-amber-900 flex items-center gap-1.5">
                                        <FiClock className="w-3.5 h-3.5 text-amber-600" />
                                        Suggested Slot: <span className="text-amber-700 font-extrabold underline">{timingInfo.suggestedTime}</span>
                                      </span>
                                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                        timingInfo.isAccepted 
                                          ? 'bg-green-100 text-green-800 border border-green-200' 
                                          : 'bg-amber-200/70 text-amber-900 border border-amber-300'
                                      }`}>
                                        {timingInfo.isAccepted ? '✅ Slot Confirmed' : '⏳ Awaiting Acceptance'}
                                      </span>
                                    </div>
                                    {timingInfo.arriveBy && (
                                      <p className="text-amber-800 font-medium text-[11px]">
                                        🚶 10-Min Early Arrival: <span className="font-bold">{timingInfo.arriveBy}</span>
                                      </p>
                                    )}
                                    {timingInfo.note && (
                                      <p className="text-gray-500 italic text-[11px]">
                                        💬 Note: "{timingInfo.note}"
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                    <FiClock className="w-3.5 h-3.5" />
                                    {timingInfo.timeDetail}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex-wrap">
                              {/* Direct Call Now Action */}
                              <button
                                onClick={() => callNextPerson(customer)}
                                disabled={isProcessing || !businessData.queueActive}
                                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-40"
                                title="Call this customer right now"
                              >
                                <FiPlay className="w-3.5 h-3.5" /> Call Now
                              </button>

                              {/* Suggest Time Action */}
                              <button
                                onClick={() => setSuggestingCustomer(customer)}
                                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Suggest alternate slot time for this customer"
                              >
                                <FiClock className="w-3.5 h-3.5" /> {customer.status === 'suggested_time' || customer.suggestedTime ? 'Update Time' : 'Suggest Time'}
                              </button>

                              {/* Remove/Delete Action */}
                              <button
                                onClick={() => handleDeleteQueueItem(customer._id, customer.token)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Remove from queue"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                pendingQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <FiShield className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Pending Verifications</h3>
                    <p className="text-gray-500 font-medium">All clear! No customers are waiting for verification.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {pendingQueue.map((customer) => (
                        <motion.div 
                          key={customer._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-100 bg-white shadow-sm"
                        >
                          <div className="mb-4 sm:mb-0">
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{customer.customerId?.name || 'Customer'}</h4>
                            <p className="text-sm text-gray-500 font-medium mb-2">Service: {customer.service} | Joined {new Date(customer.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            
                            {customer.documents && customer.documents.length > 0 ? (
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm mt-2 mb-3">
                                {customer.documents.map((doc, idx) => (
                                  <div key={idx} className="mb-2 last:mb-0">
                                    <p><strong>ID Type:</strong> {doc.type}</p>
                                    <div className="flex gap-4 mt-2">
                                      {doc.frontImage && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 mb-1">Front Image</span>
                                          <img src={doc.frontImage} alt="Front ID" className="h-16 w-auto object-contain rounded border border-gray-300" />
                                        </div>
                                      )}
                                      {doc.backImage && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 mb-1">Back Image</span>
                                          <img src={doc.backImage} alt="Back ID" className="h-16 w-auto object-contain rounded border border-gray-300" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <div className="flex gap-2 items-center">
                              <button 
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => setSuggestingCustomer(customer)}
                                className="text-sm font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <FiClock /> Suggest Time
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <button 
                              onClick={() => handleApproveVerification(customer._id)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <FiCheckCircle /> Approve
                            </button>
                            <button 
                              onClick={() => handleRejectVerification(customer._id)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FiXCircle /> Reject
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onApprove={handleApproveVerification}
        onReject={handleRejectVerification}
        onOpenSuggest={(cust) => setSuggestingCustomer(cust)}
      />

      {/* Suggest Time Modal */}
      <SuggestQueueModal
        isOpen={!!suggestingCustomer}
        onClose={() => setSuggestingCustomer(null)}
        customer={suggestingCustomer}
        onSuggest={handleSuggestTime}
      />
    </div>
  );
};

export default StaffQueue;