import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <FiLogOut className="w-8 h-8 ml-1" />
                </div>
                
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Ready to leave?</h3>
                <p className="text-gray-500 font-medium mb-8">
                  Are you sure you want to log out of your account? You will need to sign back in to access your dashboard.
                </p>
                
                <div className="flex w-full gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Stay
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(modalContent, document.body);
};

export default LogoutConfirmModal;
