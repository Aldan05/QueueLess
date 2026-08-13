import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiXCircle, FiX, FiAlertCircle } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const RejectReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  customerName = 'Customer',
  token = '',
  isLoading = false
}) => {
  const [reason, setReason] = useState('Documents did not match requirements.');

  useEffect(() => {
    if (isOpen) {
      setReason('Documents did not match requirements.');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason.trim() || 'Documents did not match requirements.');
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-40"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center justify-center shadow-lg mb-4">
                <FiXCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Reject Verification
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                Provide a reason for rejecting {customerName} {token ? `(${token})` : ''}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Reason for rejection
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why the customer verification was rejected..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiXCircle className="w-4 h-4" />
                      <span>Confirm Reject</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default RejectReasonModal;
