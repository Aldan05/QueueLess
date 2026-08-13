import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiStar, FiTrash2, FiX, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';

// ─── Professional Delete Confirmation Modal ───────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Delete', isLoading, itemDetails }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />

            <div className="p-7">
              {/* Icon */}
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/40">
                <FiAlertTriangle className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white text-center mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">{description}</p>

              {/* Item Details Card */}
              {itemDetails && (
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shrink-0">
                      {(itemDetails.token || '?').toString().slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{itemDetails.businessName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {itemDetails.date} · <span className={`font-bold ${itemDetails.statusColor}`}>{itemDetails.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl mb-6">
                <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">This action is permanent and cannot be undone.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting...</>
                  ) : (
                    <><FiTrash2 className="w-4 h-4" /> {confirmText}</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerHistory = () => {
  const { businesses, socket } = useDatabase();
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '', description: '', confirmText: 'Delete', itemDetails: null, onConfirm: null });

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [rating, setRating] = useState(5);
  const [waitTimeRating, setWaitTimeRating] = useState(5);
  const [staffBehaviourRating, setStaffBehaviourRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_URL}/customer/queue/history/${currentUser._id}`);
      if (response.ok) {
        const data = await response.json();
        const enriched = data.map(item => {
          const biz = businesses.find(b => b._id === item.businessId);
          let waitTime = 'N/A';
          if (item.completeTime && item.joinTime) {
            const diffMs = new Date(item.completeTime) - new Date(item.joinTime);
            const diffMins = Math.round(diffMs / 60000);
            waitTime = `${diffMins} mins`;
          }
          return {
            ...item,
            businessName: biz?.name || 'Unknown Business',
            category: biz?.category || 'Service',
            waitTime,
            displayStatus: item.status.charAt(0).toUpperCase() + item.status.slice(1)
          };
        });
        setHistory(enriched);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [businesses, currentUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on('queueUpdated', fetchHistory);
    return () => socket.off('queueUpdated', fetchHistory);
  }, [socket, currentUser]);

  // ── Delete Single Record ──────────────────────────────────────────────────
  const openDeleteModal = (item) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete History Record',
      description: `Remove this queue entry from your history.`,
      confirmText: 'Delete Record',
      itemDetails: {
        token: item.token,
        businessName: item.businessName,
        date: new Date(item.joinTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: item.displayStatus,
        statusColor: item.displayStatus === 'Completed' ? 'text-green-600' : item.displayStatus === 'Rejected' ? 'text-red-600' : 'text-gray-500'
      },
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`${API_URL}/customer/queue/history/${item._id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success('Record deleted');
            setHistory(prev => prev.filter(h => h._id !== item._id));
          } else {
            toast.error('Failed to delete record');
          }
        } catch {
          toast.error('Server error');
        } finally {
          setIsDeleting(false);
          setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // ── Clear All History ──────────────────────────────────────────────────────
  const openClearAllModal = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Clear All History',
      description: `Permanently delete all ${history.length} queue history record${history.length !== 1 ? 's' : ''}? This cannot be undone.`,
      confirmText: 'Clear Everything',
      itemDetails: null,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await fetch(`${API_URL}/customer/queue/history/all/${currentUser._id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success('All history cleared');
            setHistory([]);
          } else {
            toast.error('Failed to clear history');
          }
        } catch {
          toast.error('Server error');
        } finally {
          setIsDeleting(false);
          setDeleteModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // ── Status helpers ─────────────────────────────────────────────────────────
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <FiXCircle className="w-4 h-4" />;
      case 'Skipped':   return <FiClock className="w-4 h-4" />;
      case 'Rejected':  return <FiXCircle className="w-4 h-4" />;
      case 'Missed':    return <FiClock className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Cancelled': return 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
      case 'Skipped':   return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Missed':    return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Rejected':  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  const handleRateVisit = (item) => {
    setSelectedQueue(item);
    setRating(5);
    setWaitTimeRating(5);
    setStaffBehaviourRating(5);
    setFeedback('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedQueue) return;
    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_URL}/customer/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          businessId: selectedQueue.businessId, 
          customerId: currentUser._id, 
          queueId: selectedQueue._id, 
          rating,
          waitTimeRating,
          staffBehaviourRating,
          feedback 
        })
      });
      if (response.ok) {
        toast.success('Thank you! Review submitted successfully ⭐', { icon: '🎉' });
        setIsReviewModalOpen(false);
        fetchHistory();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to submit review');
      }
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <FiClock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Queue History</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-base">Review your past visits and queue experiences.</p>
          </div>
        </div>

        {/* Clear All Button — only when history exists */}
        {history.length > 0 && (
          <button
            onClick={openClearAllModal}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-200 dark:border-red-800/40 transition-all text-sm shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear All History
            <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-black px-2 py-0.5 rounded-full ml-1">
              {history.length}
            </span>
          </button>
        )}
      </div>

      {/* History List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiClock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No queue history</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Once you join and complete queues, they will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Token</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Wait Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {history.map(item => (
                  <React.Fragment key={item._id}>
                    <tr className={`hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors ${item.displayStatus === 'Rejected' ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white text-base">{item.businessName}</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(item.joinTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                            Token: <span className="text-blue-600 dark:text-blue-400">{item.token}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{item.waitTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(item.displayStatus)}`}>
                          {getStatusIcon(item.displayStatus)}
                          {item.displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {item.displayStatus === 'Completed' && item.rating && item.rating > 0 ? (
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                              ))}
                            </div>
                          ) : item.displayStatus === 'Completed' ? (
                            <button onClick={() => handleRateVisit(item)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">Rate Visit</button>
                          ) : (
                            <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                          )}

                          {/* Professional Delete Button */}
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-800/40 rounded-xl transition-all text-xs font-bold cursor-pointer"
                            title="Delete this record"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Rejection Reason inline row */}
                    {item.displayStatus === 'Rejected' && item.rejectionReason && (
                      <tr className="bg-red-50/50 dark:bg-red-950/20">
                        <td colSpan="5" className="px-6 pb-4 pt-1">
                          <div className="inline-flex items-start gap-2.5 bg-white dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl px-4 py-3 max-w-xl">
                            <FiXCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">Rejection Reason: </span>
                              <span className="text-sm text-red-700 dark:text-red-300 font-semibold">"{item.rejectionReason}"</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Professional Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModal.onConfirm}
        title={deleteModal.title}
        description={deleteModal.description}
        confirmText={deleteModal.confirmText}
        itemDetails={deleteModal.itemDetails}
        isLoading={isDeleting}
      />

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedQueue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Rate your visit</h2>
                  <p className="text-sm text-gray-500">How was your experience at {selectedQueue.businessName}?</p>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Overall Rating *
                    </label>
                    <span className="text-xs font-bold text-amber-500">
                      {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent' :
                       rating === 4 ? '⭐⭐⭐⭐☆ Good' :
                       rating === 3 ? '⭐⭐⭐☆☆ Average' :
                       rating === 2 ? '⭐⭐☆☆☆ Poor' : '⭐☆☆☆☆ Very Poor'}
                    </span>
                  </div>
                  <div className="flex justify-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`p-1.5 rounded-xl transition-all ${rating >= star ? 'text-amber-400 hover:scale-125' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`}>
                        <FiStar className="w-7 h-7 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-ratings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Wait Time</span>
                      <span className="text-[11px] font-black text-amber-500">{waitTimeRating}★</span>
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setWaitTimeRating(s)} className={`p-0.5 text-xs ${waitTimeRating >= s ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
                          <FiStar className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">Staff Help</span>
                      <span className="text-[11px] font-black text-amber-500">{staffBehaviourRating}★</span>
                    </div>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setStaffBehaviourRating(s)} className={`p-0.5 text-xs ${staffBehaviourRating >= s ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
                          <FiStar className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">Your Feedback *</label>
                  <textarea
                    required value={feedback} onChange={e => setFeedback(e.target.value)} rows="3"
                    placeholder="Tell us about your experience..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white resize-none text-sm"
                  />
                </div>

                <button type="submit" disabled={isSubmittingReview} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
                  {isSubmittingReview ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><FiStar className="fill-current" /> Submit Verified Review</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerHistory;
