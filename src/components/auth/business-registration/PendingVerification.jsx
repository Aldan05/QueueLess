import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

const PendingVerification = ({ applicationId = 'QL-2026-000245' }) => {
  return (
    <div className="text-center py-8">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner"
      >
        <FiCheckCircle className="w-10 h-10" />
      </motion.div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
        Registration Submitted
      </h2>
      <p className="text-lg text-gray-500 font-medium mb-8">
        Your business application has been sent to QueueLess Admin.
      </p>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 max-w-sm mx-auto text-left mb-8 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Application ID</p>
          <p className="text-lg font-bold text-gray-900 font-mono bg-white inline-block px-3 py-1 rounded-lg border border-gray-200">
            {applicationId}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
          <div className="inline-flex items-center bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200 font-semibold text-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span>
            Pending Verification
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 text-blue-800 p-4 rounded-xl flex items-start text-sm font-medium mb-8 text-left max-w-sm mx-auto border border-blue-100">
        <FiClock className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500" />
        <p>
          Your documents will be reviewed within 24–48 hours. You will receive an email notification once your account is approved.
        </p>
      </div>

      <Link 
        to="/login"
        className="inline-flex justify-center items-center py-3 px-8 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
};

export default PendingVerification;
