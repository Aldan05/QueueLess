import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiAlertTriangle, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemDetails = null,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false
}) => {
  if (!isOpen && typeof document === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-48 h-48 ${isDestructive ? 'bg-red-500/10 dark:bg-red-500/15' : 'bg-amber-500/10 dark:bg-amber-500/15'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer disabled:opacity-40"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Pulsing Icon */}
              <div className="relative mb-5">
                <div className={`w-16 h-16 rounded-2xl ${isDestructive ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/50' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'} flex items-center justify-center shadow-lg`}>
                  {isDestructive ? <FiTrash2 className="w-8 h-8" /> : <FiAlertTriangle className="w-8 h-8" />}
                </div>
                <div className={`absolute -inset-1 rounded-2xl ${isDestructive ? 'bg-red-500/20' : 'bg-amber-500/20'} blur-sm -z-10 animate-pulse`} />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-4">
                {description}
              </p>

              {/* Optional Item Preview Card */}
              {itemDetails && (
                <div className="w-full bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-800 rounded-2xl p-3.5 mb-6 text-left flex items-center gap-3">
                  {itemDetails.token && (
                    <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-gray-800 dark:text-white shrink-0">
                      {itemDetails.token}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                        {itemDetails.name || 'Customer Record'}
                      </p>
                      {itemDetails.status && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                          {itemDetails.status}
                        </span>
                      )}
                    </div>
                    {itemDetails.time && (
                      <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                        {itemDetails.time}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 ${
                    isDestructive 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25'
                  } font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      <span>{confirmText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default DeleteConfirmModal;
