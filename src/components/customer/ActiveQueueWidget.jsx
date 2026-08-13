import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiMapPin, FiNavigation, FiX, FiCheckCircle, FiAlertCircle, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import QRCodeDisplay from '../common/QRCodeDisplay';

// --- Self-contained Rejection Card ---
// Has its own local isDismissed state so it vanishes INSTANTLY on click,
// then calls the backend API in the background.
const RejectionCard = ({ queue, business, leaveQueue }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    // 1. Instantly hide the card (no waiting for API)
    setIsDismissed(true);
    // 2. Call the API in the background to mark as cancelled
    leaveQueue();
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          key="rejection-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-red-100 dark:border-red-900/40 overflow-hidden relative mb-8"
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />

          <div className="p-6 sm:p-10 flex flex-col items-center text-center relative z-10">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center border-4 border-red-100 dark:border-red-900/50 shadow-lg mb-5">
              <span className="text-4xl">❌</span>
            </div>

            {/* Business name */}
            <p className="text-xs font-black uppercase tracking-widest text-red-400 dark:text-red-500 mb-1">
              {business.name}
            </p>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Queue Request Rejected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6 max-w-sm">
              Unfortunately, the business has declined your verification request for this queue.
            </p>

            {/* Rejection Reason Card */}
            {queue.rejectionReason && (
              <div className="w-full max-w-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                    Reason for Rejection
                  </span>
                </div>
                <p className="text-red-800 dark:text-red-300 font-semibold text-sm leading-relaxed">
                  "{queue.rejectionReason}"
                </p>
              </div>
            )}

            {/* Token info */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 mb-6 text-sm font-bold text-gray-600 dark:text-gray-300">
              <FiClock className="w-4 h-4 text-gray-400" />
              Token <span className="text-blue-600 dark:text-blue-400 ml-1">{queue.token}</span>
              <span className="text-gray-300 dark:text-gray-600 mx-1">·</span>
              <span className="text-xs text-gray-400">
                {new Date(queue.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* What to do next */}
            <div className="w-full max-w-md bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">What happens next?</p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 font-medium">
                <li>• Your request will be removed from the queue</li>
                <li>• You can search for another business to join</li>
                <li>• This visit will be recorded in your Queue History</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDismiss}
                className="py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiX className="w-5 h-5" /> Dismiss & Leave
              </button>
              <a
                href="/customer/find"
                className="py-3.5 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiArrowRight className="w-5 h-5" /> Find Another Business
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state shown instantly after dismissal */}
      {isDismissed && (
        <motion.div
          key="empty-after-dismiss"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-bold text-lg mb-1">Rejection Dismissed</p>
          <p className="text-gray-400 dark:text-gray-500 font-medium text-sm mb-4">You can now find another business to join.</p>
          <a href="/customer/find" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md">
            <FiArrowRight className="w-4 h-4" /> Find a Business
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ActiveQueueWidget = () => {
  const { activeCustomerQueue, businesses, leaveQueue, acceptQueueSuggestion, declineQueueSuggestion } = useDatabase();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeCustomerQueue || ['completed', 'cancelled'].includes(activeCustomerQueue.status)) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm text-center">
        <p className="text-gray-500 dark:text-gray-400 font-medium">You are not in any queue right now.</p>
        <a href="/customer/find" className="inline-block mt-4 px-6 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 transition-colors">
          Find a Business
        </a>
      </div>
    );
  }

  // Dedicated full-page Rejection State — shown prominently so the customer cannot miss it
  if (activeCustomerQueue.status === 'rejected') {
    const targetBizIdRej = activeCustomerQueue?.businessId?._id || activeCustomerQueue?.businessId;
    const rejectedBusiness = businesses.find(b => b._id === targetBizIdRej) || { name: 'Business', address: '' };

    return (
      <RejectionCard
        queue={activeCustomerQueue}
        business={rejectedBusiness}
        leaveQueue={leaveQueue}
      />
    );
  }

  const targetBizId = activeCustomerQueue?.businessId?._id || activeCustomerQueue?.businessId;
  const business = businesses.find(b => b._id === targetBizId) || (businesses.length > 0 ? businesses[0] : { name: 'Business Queue', address: 'Main Location' });

  // Simple estimated time calculation: 5 mins per person ahead
  const position = activeCustomerQueue.position || 0;
  const estimatedWaitMins = position * 5;
  const joinTime = new Date(activeCustomerQueue.joinTime || Date.now());
  const estTime = new Date(joinTime.getTime() + estimatedWaitMins * 60000);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const progressPercent = Math.max(10, Math.min(100, 100 - (position * 10))); // Rough visual progress

  const renderProgressTracker = () => {
    const isWaiting = activeCustomerQueue.status === 'waiting';
    const isPending = activeCustomerQueue.status === 'pending_verification';
    const isSuggested = activeCustomerQueue.status === 'suggested_time';
    const isRejected = activeCustomerQueue.status === 'rejected';

    return (
      <div className="w-full max-w-md mx-auto mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Booking Progress</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-500"><FiCheckCircle /></span>
            <span className="text-gray-900 dark:text-white">Request Submitted</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {isWaiting ? (
              <span className="text-green-500"><FiCheckCircle /></span>
            ) : isSuggested ? (
              <span className="text-orange-500 animate-bounce">⚡</span>
            ) : isRejected ? (
              <span className="text-red-500">❌</span>
            ) : (
              <span className="text-yellow-500 animate-pulse">🟡</span>
            )}
            <span className={isWaiting ? "text-gray-900 dark:text-white font-medium" : isSuggested ? "text-orange-600 dark:text-orange-400 font-bold" : "text-gray-600 dark:text-gray-400 font-medium"}>
              {isRejected ? 'Verification Rejected' : isSuggested ? 'New Slot Suggested by Business' : isWaiting ? 'Verified & Active' : 'Under Verification'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isWaiting ? (
              <span className="text-green-500"><FiCheckCircle /></span>
            ) : (
              <span className="text-gray-300 dark:text-gray-600">⬜</span>
            )}
            <span className={isWaiting ? "text-gray-900 dark:text-white font-bold" : "text-gray-400"}>Token Generated</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 dark:border-slate-800 overflow-hidden relative mb-8"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <FiClock className="w-32 h-32 -mt-10 -mr-10 text-primary" />
      </div>

      <div className="p-6 sm:p-8 flex flex-col items-center justify-center relative z-10 text-center">
        
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
          {business.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-6 flex items-center justify-center">
          <FiMapPin className="mr-1.5 text-gray-400" />
          {business.address}
        </p>

        {renderProgressTracker()}

        {/* 1. SUGGESTED TIME STATE */}
        {activeCustomerQueue.status === 'suggested_time' && (
          <div className="w-full max-w-lg mx-auto mb-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 p-6 rounded-3xl border-2 border-amber-300 dark:border-amber-700 shadow-xl text-left relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 text-xl shrink-0">
                <FiClock />
              </div>
              <div>
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Action Required
                </span>
                <h4 className="text-lg font-black text-gray-900 dark:text-white leading-snug mt-1">
                  Business Suggested a Time Slot
                </h4>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              The business reviewed your queue request and suggested joining at a specific time:
            </p>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Slot</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    {activeCustomerQueue.suggestedTime}
                  </p>
                </div>
                {activeCustomerQueue.suggestedArriveBy && (
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Arrive By</p>
                    <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                      {activeCustomerQueue.suggestedArriveBy}
                    </p>
                  </div>
                )}
              </div>
              {activeCustomerQueue.suggestedNote && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-bold text-gray-500">Business Note:</span> "{activeCustomerQueue.suggestedNote}"
                </div>
              )}
            </div>

            {/* Crucial 10-Minute Prior Rule Banner */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 rounded-xl border border-blue-200 dark:border-blue-800/50 text-xs font-semibold flex items-start gap-2.5 mb-5 shadow-sm">
              <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-blue-700 dark:text-blue-300 font-bold mb-0.5">
                  10-Minute Early Arrival Policy:
                </strong>
                Please come at least <strong>10 minutes before</strong> ({activeCustomerQueue.suggestedArriveBy || '10 min before'}) to directly join the queue and receive your turn smoothly.
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                disabled={isProcessing}
                onClick={async () => {
                  try {
                    setIsProcessing(true);
                    await acceptQueueSuggestion(activeCustomerQueue.queueId || activeCustomerQueue._id);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="py-3.5 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiCheckCircle className="w-5 h-5" />
                {isProcessing ? 'Joining Queue...' : 'Approve & Enter Queue'}
              </button>
              <button 
                disabled={isProcessing}
                onClick={async () => {
                  try {
                    setIsProcessing(true);
                    await declineQueueSuggestion(activeCustomerQueue.queueId || activeCustomerQueue._id);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Decline & Leave'}
              </button>
            </div>
          </div>
        )}

        {/* 2. WAITING STATE */}
        {activeCustomerQueue.status === 'waiting' && (
          <>
            {/* If suggestion was accepted or time suggested, show top confirmation badge */}
            {activeCustomerQueue.suggestedTime && (
              <div className="w-full max-w-md mx-auto mb-5 p-3.5 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300 rounded-2xl border border-green-200 dark:border-green-800/40 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 w-4 h-4 shrink-0" />
                  <span>Suggested Slot: <strong>{activeCustomerQueue.suggestedTime}</strong></span>
                </div>
                {activeCustomerQueue.suggestedArriveBy && (
                  <span className="bg-green-200 dark:bg-green-800/60 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    Arrive by {activeCustomerQueue.suggestedArriveBy}
                  </span>
                )}
              </div>
            )}

            <div className="relative flex-shrink-0 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-primary to-blue-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-primary/30 border-4 border-white dark:border-slate-800 relative z-10">
                <span className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Your Token</span>
                <span className="text-3xl sm:text-4xl font-black">{activeCustomerQueue.token}</span>
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-slate-700 z-20">
                {position} ahead
              </div>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>Joined ({formatTime(joinTime)})</span>
                <span className="text-primary">Est. Wait: {estimatedWaitMins} mins</span>
                <span>Est. Turn ({formatTime(estTime)})</span>
              </div>
              <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>

              {/* 10-Minute Prior Notice for Live Queue */}
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800/30 text-xs text-center flex items-center justify-center gap-2">
                <FiClock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Reminder:</strong> Please arrive <strong>10 minutes before</strong> your estimated turn to secure your entry.
                </span>
              </div>

              <div className="flex justify-center mb-6">
                <QRCodeDisplay 
                  value={JSON.stringify({ queueId: activeCustomerQueue._id || activeCustomerQueue.queueId, token: activeCustomerQueue.token, businessId: business._id })} 
                  title="Scan to Check-in" 
                />
              </div>
            </div>
          </>
        )}

        {/* 3. PENDING VERIFICATION STATE */}
        {activeCustomerQueue.status === 'pending_verification' && (
          <div className="mb-6 w-full max-w-md mx-auto p-5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-2xl border border-yellow-200 dark:border-yellow-800/50 text-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
              Verification in Progress
            </div>
            <p>Please wait while the business reviews your details. Once approved or a slot is suggested, you will be notified here immediately.</p>
          </div>
        )}

        {/* 4. INFO REQUESTED STATE */}
        {activeCustomerQueue.status === 'info_requested' && (
          <div className="mb-6 w-full max-w-md mx-auto p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-500 rounded-xl border border-orange-200 dark:border-orange-800/50 text-sm text-left">
            <p className="font-bold mb-1">More Information Needed</p>
            <p className="mb-3">The business requested more information: <strong>{activeCustomerQueue.moreInfoReason}</strong></p>
            <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors">
              Resubmit Documents
            </button>
          </div>
        )}

        {/* 5. REJECTED STATE */}
        {activeCustomerQueue.status === 'rejected' && (
          <div className="mb-6 w-full max-w-md mx-auto p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-500 rounded-xl border border-red-200 dark:border-red-800/50 text-sm">
            <p className="font-bold mb-1">Verification Rejected</p>
            <p className="mb-1">Reason: <strong>{activeCustomerQueue.rejectionReason}</strong></p>
            <p>You cannot join this queue. Please cancel your request.</p>
          </div>
        )}

        <div className="w-full max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex items-center justify-center w-full py-3.5 px-4 bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
            <FiNavigation className="mr-2" /> Get Directions
          </button>
          <button 
            onClick={leaveQueue}
            className="flex items-center justify-center w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 font-bold rounded-xl transition-all hover:-translate-y-0.5"
          >
            <FiX className="mr-2" /> Cancel / Leave
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveQueueWidget;
