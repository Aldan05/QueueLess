import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiClock, FiAlertCircle, FiCheckCircle, FiPlay, FiPause, FiSkipForward, FiRefreshCw, FiShield, FiXCircle, FiPhone, FiFileText, FiX, FiCalendar, FiSend, FiTrash2, FiSlash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import RejectReasonModal from '../../components/common/RejectReasonModal';

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

const parseTimeIntoTodayDate = (timeStr, baseDate) => {
  if (!timeStr) return null;
  try {
    const clean = timeStr.trim();
    if (clean.includes(':')) {
      const parts = clean.split(' ');
      const timeParts = parts[0].split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (parts[1] && parts[1].toUpperCase() === 'PM' && hours < 12) hours += 12;
      else if (parts[1] && parts[1].toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      const d = baseDate ? new Date(baseDate) : new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
  } catch (e) {}
  return null;
};

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/40">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Customer Verification Details</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Token: {customer.token} • {customer.customerId?.name || 'Customer'}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-sm">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Customer Name</span>
                <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{customer.customerId?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Phone</span>
                <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{customer.customerId?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Service Requested</span>
                <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">{customer.service || 'General Service'}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Join Time</span>
                <p className="font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {new Date(customer.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Verification Documents</h4>
              {customer.documents && customer.documents.length > 0 ? (
                <div className="space-y-4">
                  {customer.documents.map((doc, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <p className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase mb-2">ID Type: {doc.type}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doc.frontImage && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-gray-400">Front Document Photo</span>
                            <div className="h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center">
                              <img src={doc.frontImage} alt="Front ID" className="max-w-full max-h-full object-contain" />
                            </div>
                          </div>
                        )}
                        {doc.backImage && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-gray-400">Back Document Photo</span>
                            <div className="h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center">
                              <img src={doc.backImage} alt="Back ID" className="max-w-full max-h-full object-contain" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 text-center text-xs font-bold text-gray-400">
                  No documents attached
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => { onClose(); onOpenSuggest(customer); }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-sm"
            >
              <FiClock className="w-4 h-4" /> Suggest Another Slot
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { onClose(); onReject(customer._id, customer.customerId?.name, customer.token); }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-300 font-bold rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer"
              >
                <FiXCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => { onApprove(customer._id); onClose(); }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md text-xs flex items-center gap-1"
              >
                <FiCheckCircle className="w-4 h-4" /> Approve into Queue
              </button>
            </div>
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
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
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
                    className="py-2 px-3 text-xs font-bold bg-gray-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors text-center"
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
                placeholder="e.g. Queue is congested right now. Please come at this suggested slot."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !time.trim()}
                className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSend className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Suggestion'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BusinessQueue = () => {
  const { businesses, socket, fetchBusinesses, suggestQueueTime } = useDatabase();
  const { currentUser } = useAuth();
  
  const [activeQueue, setActiveQueue] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [historyQueue, setHistoryQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting' | 'verification' | 'history'
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [suggestingCustomer, setSuggestingCustomer] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Professional Delete and Reject Modals State
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    itemDetails: null,
    confirmText: 'Delete',
    onConfirm: null
  });
  const [rejectModalConfig, setRejectModalConfig] = useState({
    isOpen: false,
    customerName: '',
    token: '',
    queueId: null
  });

  const business = businesses.find(b => b._id === currentUser?.businessId) || (businesses.length > 0 ? businesses[0] : null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const requiresVerification = business?.verificationSettings?.requireVerification || pendingQueue.length > 0;

  const fetchActiveQueue = async () => {
    if (!business) return;
    try {
      const [activeRes, histRes] = await Promise.all([
        fetch(`${API_URL}/businesses/${business._id}/queue/active`),
        fetch(`${API_URL}/businesses/${business._id}/queue/history`)
      ]);
      if (activeRes.ok) {
        const data = await activeRes.json();
        const waitingOnly = data.filter(q => ['waiting', 'suggested_time'].includes(q.status));
        const pendingOnly = data.filter(q => ['pending_verification', 'info_requested'].includes(q.status));
        setActiveQueue(waitingOnly);
        setPendingQueue(pendingOnly);
      }
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistoryQueue(histData.filter(q => ['completed', 'cancelled', 'missed', 'rejected'].includes(q.status)));
      }
    } catch (error) {
      console.error('Failed to fetch active queue and history', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteQueueModal = (queueId, token, customerName) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Remove from Queue',
      description: 'Are you sure you want to remove this customer from the active queue? Their token will be permanently cancelled.',
      itemDetails: {
        token: token || 'TK',
        name: customerName || 'Customer',
        status: 'Waiting'
      },
      confirmText: 'Remove Customer',
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          const response = await fetch(`${API_URL}/businesses/${business._id}/queue/${queueId}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            toast.success(`Removed ${token || 'customer'} from queue`);
            fetchActiveQueue();
            fetchBusinesses();
          } else {
            const data = await response.json();
            toast.error(data.message || 'Failed to remove queue item');
          }
        } catch (error) {
          toast.error('Server error deleting queue item');
        } finally {
          setIsProcessing(false);
          setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openDeleteHistoryModal = (record) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Delete History Record',
      description: 'Are you sure you want to permanently delete this past queue history record? This record will be removed from your database.',
      itemDetails: {
        token: record.token || 'TK',
        name: record.customerId?.name || 'Customer',
        status: record.status,
        time: `Joined ${new Date(record.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      },
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history/${record._id}`, {
            method: 'DELETE'
          });
          if (response.ok) {
            toast.success('History record deleted');
            fetchActiveQueue();
          } else {
            toast.error('Failed to delete record');
          }
        } catch (error) {
          toast.error('Server error deleting record');
        } finally {
          setIsProcessing(false);
          setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openClearAllHistoryModal = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Clear All Queue History',
      description: `Are you sure you want to permanently purge all ${historyQueue.length} customer history records? All completed, missed, and cancelled entries will be permanently removed.`,
      itemDetails: null,
      confirmText: 'Clear All History',
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history`, {
            method: 'DELETE'
          });
          if (response.ok) {
            toast.success('All history cleared successfully');
            fetchActiveQueue();
          } else {
            toast.error('Failed to clear history');
          }
        } catch (error) {
          toast.error('Server error clearing history');
        } finally {
          setIsProcessing(false);
          setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openRejectModal = (queueId, customerName, token) => {
    setRejectModalConfig({
      isOpen: true,
      queueId,
      customerName: customerName || 'Customer',
      token: token || ''
    });
  };

  const handleExecuteReject = async (reason) => {
    if (!rejectModalConfig.queueId) return;
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${business._id}/queue/${rejectModalConfig.queueId}/verify/reject`, { 
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
    } catch (e) { toast.error('Server error'); } finally { 
      setIsProcessing(false); 
      setRejectModalConfig({ isOpen: false, customerName: '', token: '', queueId: null });
    }
  };

  useEffect(() => {
    fetchActiveQueue();
  }, [business, API_URL]);

  useEffect(() => {
    if (!socket) return;
    const handleQueueUpdate = () => {
      fetchActiveQueue();
      fetchBusinesses(); // Refresh business stats like wait time and current token
    };
    socket.on('queueUpdated', handleQueueUpdate);
    return () => socket.off('queueUpdated', handleQueueUpdate);
  }, [socket]);

  const handleSetQueueStatus = async (newStatus) => {
    const bId = business?._id || business?.userId || currentUser?.businessId || currentUser?._id;
    if (!bId) {
      toast.error('Business details not found. Please refresh the page.');
      return;
    }
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${bId}/queue/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        const msg = newStatus === 'open' 
          ? '🟢 Queue is now OPEN and accepting customers!' 
          : newStatus === 'paused' 
          ? '⏸️ Queue is now PAUSED (New joins temporarily stopped)' 
          : '🛑 Queue is now CLOSED for today';
        toast.success(msg, { id: 'queue-status-toast' });
        await fetchBusinesses();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Failed to update queue status');
      }
    } catch (error) {
      console.error('Queue status update error:', error);
      toast.error('Server error updating queue status');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleQueue = async () => {
    const currentQueueStatus = business?.queueStatus || (business?.queueActive !== false ? 'open' : 'closed');
    const nextStatus = currentQueueStatus === 'open' ? 'paused' : 'open';
    await handleSetQueueStatus(nextStatus);
  };

  const callNextPerson = async (target = null) => {
    if (!business) return;
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
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/next`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const calledLabel = payload.token ? `Called token ${payload.token}!` : 'Next customer called!';
        toast.success(calledLabel);
        fetchActiveQueue();
        fetchBusinesses();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to call next person');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!business || !business.currentToken || business.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/skip`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: business.currentToken })
      });
      if (response.ok) {
        toast.success(`Skipped token ${business.currentToken}`);
        fetchActiveQueue();
        fetchBusinesses();
      } else {
        toast.error('Failed to skip token');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleComplete = async () => {
    if (!business || !business.currentToken || business.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: business.currentToken })
      });
      if (response.ok) {
        toast.success(`Completed token ${business.currentToken}`);
        fetchActiveQueue();
        fetchBusinesses();
      } else {
        toast.error('Failed to complete token');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRecall = async () => {
    if (!business) return;
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/recall-last-missed`, {
        method: 'PATCH',
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Recalled token ${data.token}`);
        fetchActiveQueue();
        fetchBusinesses();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to recall token');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleApproveVerification = async (queueId) => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${business._id}/queue/${queueId}/verify/approve`, { method: 'PATCH' });
      if (res.ok) { 
        toast.success('Approved customer and added to queue!'); 
        fetchActiveQueue(); 
        fetchBusinesses(); 
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Error approving'); 
      }
    } catch (e) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRejectVerification = async (queueId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return; // cancelled
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_URL}/businesses/${business._id}/queue/${queueId}/verify/reject`, { 
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

  const handleSendSuggestion = async (queueId, payload) => {
    if (suggestQueueTime) {
      await suggestQueueTime(business._id, queueId, payload);
    } else {
      const res = await fetch(`${API_URL}/businesses/${business._id}/queue/${queueId}/suggest-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(`Suggested slot ${payload.suggestedTime} sent!`);
      } else {
        toast.error('Failed to send suggestion');
      }
    }
    fetchActiveQueue();
  };

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-bold">Loading Queue Details...</p>
      </div>
    );
  }

  const currentQueueStatus = business?.queueStatus || (business?.queueActive !== false ? 'open' : 'closed');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Queue Management</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Control your active counter and manage waiting customers.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => toast('Priority issuing active from front desk', { icon: '🚨' })}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold rounded-xl border border-gray-200 dark:border-slate-700 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm text-xs sm:text-sm cursor-pointer"
          >
            <FiAlertCircle /> Priority Token
          </button>
          
          {/* 3-State Queue Status Switcher */}
          <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800/90 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-inner">
            <button 
              onClick={() => handleSetQueueStatus('open')}
              disabled={isProcessing}
              title="Open queue - allow customer joins and calling"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                currentQueueStatus === 'open' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-700'
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700'
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700'
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2.5 transition-colors duration-300 ${
              currentQueueStatus === 'open' ? 'bg-emerald-500' : currentQueueStatus === 'paused' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></div>
            
            {currentQueueStatus === 'open' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                QUEUE ACTIVE / OPEN
              </div>
            ) : currentQueueStatus === 'paused' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                QUEUE PAUSED
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-8 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                QUEUE CLOSED
              </div>
            )}

            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Currently Serving</p>
            <h2 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
              {!business.currentToken || business.currentToken === '-' ? 'None' : business.currentToken}
            </h2>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={callNextPerson}
                disabled={isProcessing || currentQueueStatus !== 'open' || activeQueue.length === 0}
                className={`col-span-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isProcessing || currentQueueStatus !== 'open' || activeQueue.length === 0
                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5'
                }`}
              >
                <FiPlay className="w-5 h-5" /> Call Next Person
              </button>
              
              <button 
                onClick={handleComplete}
                disabled={isProcessing || !business.currentToken || business.currentToken === '-'}
                className="py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiCheckCircle className="w-5 h-5" /> <span className="text-sm">Complete</span>
              </button>

              <button 
                onClick={handleSkip}
                disabled={isProcessing || !business.currentToken || business.currentToken === '-'}
                className="py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiSkipForward className="w-5 h-5" /> <span className="text-sm">Skip</span>
              </button>

              <button 
                onClick={handleRecall}
                disabled={isProcessing || (business.currentToken && business.currentToken !== '-')}
                className="col-span-2 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" /> Recall Missed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 text-center shadow-sm">
              <FiUsers className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{business.waiting}</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Waiting</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 text-center shadow-sm">
              <FiClock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{business.avgWaitTime}m</p>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1">Est. Wait</p>
            </div>
          </div>
        </div>

        {/* Right Column: Up Next List & History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden h-full flex flex-col">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/40">
              <div className="flex gap-4 sm:gap-6 w-full items-center justify-between flex-wrap">
                <div className="flex gap-3 sm:gap-6 items-center flex-wrap">
                  <button 
                    onClick={() => setActiveTab('waiting')}
                    className={`font-extrabold text-base sm:text-lg transition-colors flex items-center gap-2 ${activeTab === 'waiting' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Up Next 
                    <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'waiting' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>{activeQueue.length}</span>
                  </button>
                  {requiresVerification && (
                    <button 
                      onClick={() => setActiveTab('verification')}
                      className={`font-extrabold text-base sm:text-lg transition-colors flex items-center gap-2 ${activeTab === 'verification' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Verifications
                      {pendingQueue.length > 0 && (
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-xs shadow-sm animate-pulse">{pendingQueue.length}</span>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`font-extrabold text-base sm:text-lg transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    History
                    <span className={`px-2 py-0.5 rounded-md text-xs ${activeTab === 'history' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>{historyQueue.length}</span>
                  </button>
                </div>

                {activeTab === 'history' && historyQueue.length > 0 && (
                  <button
                    onClick={openClearAllHistoryModal}
                    disabled={isProcessing}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" /> Clear All History
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400 font-medium">Loading queue...</div>
              ) : activeTab === 'waiting' ? (
                (() => {
                  const sortedWaitingQueue = sortQueueByRealTime(activeQueue, currentTime);
                  if (sortedWaitingQueue.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                          <FiUsers className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Queue is Empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">There are currently no customers waiting.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {sortedWaitingQueue.map((customer, index) => {
                          const timing = getCustomerTimingInfo(customer, currentTime);
                          const isNextUp = index === 0;

                          return (
                            <motion.div 
                              key={customer._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: index * 0.04 }}
                              className={`flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ${
                                isNextUp 
                                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm ring-1 ring-blue-400/30' 
                                  : customer.isPriority
                                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                                    : timing.isSuggested && !timing.isReady
                                      ? 'bg-indigo-50/30 dark:bg-indigo-950/15 border-indigo-100 dark:border-indigo-900/30'
                                      : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
                              }`}
                            >
                              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shrink-0 mt-0.5 ${
                                  isNextUp 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                    : customer.isPriority
                                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                }`}>
                                  #{index + 1}
                                </div>
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg">{customer.token}</h4>
                                    
                                    {/* Real-time Status Badge */}
                                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${timing.badgeClass}`}>
                                      {timing.badgeText}
                                    </span>

                                    {isNextUp && (
                                      <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse">
                                        Next Up
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                    <span className="font-bold text-gray-900 dark:text-white">{customer.customerId?.name || 'Customer'}</span>
                                    {customer.service && ` • ${customer.service}`}
                                  </p>

                                  {/* Prominent Visualized Suggested Time Section */}
                                  {timing.isSuggested ? (
                                    <div className="mt-2 p-2.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs space-y-1 max-w-xl">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                          <FiClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                          Suggested Slot: <span className="text-amber-700 dark:text-amber-300 font-extrabold underline">{timing.suggestedTime}</span>
                                        </span>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                          timing.isAccepted 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/40' 
                                            : 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50'
                                        }`}>
                                          {timing.isAccepted ? '✅ Slot Confirmed' : '⏳ Awaiting Acceptance'}
                                        </span>
                                      </div>
                                      {timing.arriveBy && (
                                        <p className="text-amber-800 dark:text-amber-300 font-medium text-[11px]">
                                          🚶 10-Min Early Arrival: <span className="font-bold">{timing.arriveBy}</span>
                                        </p>
                                      )}
                                      {timing.note && (
                                        <p className="text-gray-500 dark:text-gray-400 italic text-[11px]">
                                          💬 Note: "{timing.note}"
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                                      {timing.timeDetail}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 self-stretch sm:self-end md:self-center justify-end flex-wrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                                {/* Direct Call Now Action */}
                                <button
                                  onClick={() => callNextPerson(customer)}
                                  disabled={isProcessing}
                                  title={`Call ${customer.token} now`}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                  <FiPlay className="w-3.5 h-3.5 fill-current" />
                                  <span>Call Now</span>
                                </button>

                                <button
                                  onClick={() => setSuggestingCustomer(customer)}
                                  className="px-2.5 sm:px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  <FiClock className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">{customer.status === 'suggested_time' || customer.suggestedTime ? 'Update Time' : 'Suggest Time'}</span>
                                </button>

                                <button
                                  onClick={() => openDeleteQueueModal(customer._id, customer.token, customer.customerId?.name)}
                                  title="Delete / Remove from queue"
                                  className="px-2.5 py-1.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  );
                })()
              ) : activeTab === 'verification' ? (
                pendingQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <FiShield className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Pending Verifications</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">All clear! No customers are waiting for verification.</p>
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
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                        >
                          <div className="mb-4 sm:mb-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{customer.customerId?.name || 'Customer'}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                              Service: {customer.service} | Joined {new Date(customer.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            
                            {customer.documents && customer.documents.length > 0 ? (
                              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm mt-2 mb-3">
                                {customer.documents.map((doc, idx) => (
                                  <div key={idx} className="mb-2 last:mb-0">
                                    <p><strong>ID Type:</strong> {doc.type}</p>
                                    <div className="flex gap-4 mt-2">
                                      {doc.frontImage && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 mb-1">Front Image</span>
                                          <img src={doc.frontImage} alt="Front ID" className="h-16 w-auto object-contain rounded border border-gray-300 dark:border-slate-600" />
                                        </div>
                                      )}
                                      {doc.backImage && (
                                        <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 mb-1">Back Image</span>
                                          <img src={doc.backImage} alt="Back ID" className="h-16 w-auto object-contain rounded border border-gray-300 dark:border-slate-600" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <button 
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <button 
                              onClick={() => setSuggestingCustomer(customer)}
                              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm text-sm cursor-pointer"
                            >
                              <FiClock /> Suggest Time
                            </button>
                            <button 
                              onClick={() => handleApproveVerification(customer._id)}
                              className="px-3.5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm text-sm cursor-pointer"
                            >
                              <FiCheckCircle /> Approve
                            </button>
                            <button 
                              onClick={() => openRejectModal(customer._id, customer.customerId?.name, customer.token)}
                              className="px-3.5 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 text-sm cursor-pointer"
                            >
                              <FiXCircle /> Reject
                            </button>
                            <button 
                              onClick={() => openDeleteQueueModal(customer._id, customer.token || 'Pending', customer.customerId?.name)}
                              title="Delete Verification Request"
                              className="px-3 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-xl font-bold transition-colors flex items-center justify-center gap-1 text-sm cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                historyQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                      <FiClock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Queue History</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Completed, missed, or cancelled queue records will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {historyQueue.map((record) => (
                        <motion.div
                          key={record._id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-2 sm:mb-0">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-gray-600 dark:text-gray-300">
                              {record.token || 'TK'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                                  {record.customerId?.name || 'Customer'}
                                </h4>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                  record.status === 'completed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                    : record.status === 'missed'
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                      : record.status === 'cancelled'
                                        ? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 font-medium mt-0.5">
                                Token: {record.token} • Joined {new Date(record.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {record.completeTime && ` • Finished ${new Date(record.completeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => openDeleteHistoryModal(record)}
                            className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-bold transition-all self-end sm:self-center flex items-center gap-1 cursor-pointer"
                            title="Delete this history record"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
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
      
      {/* Customer Full Details Modal */}
      <CustomerDetailsModal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onApprove={handleApproveVerification}
        onReject={openRejectModal}
        onOpenSuggest={(cust) => setSuggestingCustomer(cust)}
      />

      {/* Suggest Time Modal with 10-Minute Prior Rule */}
      <SuggestQueueModal
        isOpen={!!suggestingCustomer}
        onClose={() => setSuggestingCustomer(null)}
        customer={suggestingCustomer}
        onSuggest={handleSendSuggestion}
      />

      {/* Professional Confirmation Modal for Deletions */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalConfig.onConfirm}
        title={deleteModalConfig.title}
        description={deleteModalConfig.description}
        itemDetails={deleteModalConfig.itemDetails}
        confirmText={deleteModalConfig.confirmText}
        isLoading={isProcessing}
      />

      {/* Professional Reject Modal */}
      <RejectReasonModal
        isOpen={rejectModalConfig.isOpen}
        onClose={() => setRejectModalConfig({ isOpen: false, customerName: '', token: '', queueId: null })}
        onConfirm={handleExecuteReject}
        customerName={rejectModalConfig.customerName}
        token={rejectModalConfig.token}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default BusinessQueue;
