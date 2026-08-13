import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlayCircle, FiPauseCircle, FiSkipForward, 
  FiRefreshCw, FiAlertTriangle, FiCheckSquare, FiClock 
} from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';

const LiveQueueManagerWidget = () => {
  const { businesses, businessCallNext, issueEmergencyToken } = useDatabase();
  const { currentUser } = useAuth();
  
  const [activeCounter, setActiveCounter] = useState('Counter 1');
  
  const business = businesses.find(b => b._id === currentUser?.businessId);

  if (!business) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${business.queueActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${business.queueActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Live Queue Control</h2>
        </div>
        <div className="flex gap-2">
          <select 
            value={activeCounter}
            onChange={(e) => setActiveCounter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Counter 1">Counter 1</option>
            <option value="Counter 2">Counter 2</option>
            <option value="Counter 3">Counter 3</option>
          </select>
          <button className="flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <FiPauseCircle className="mr-1.5" /> Pause
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 relative">
        <div className="text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Current Token</p>
          <motion.p 
            key={business.currentToken}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-gray-900"
          >
            {business.currentToken}
          </motion.p>
          <p className="text-sm font-medium text-gray-500 mt-2">Serving {activeCounter}</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Next Token</p>
          <p className="text-4xl font-black text-gray-400">
            {business.currentToken.split('-')[0]}-{String(parseInt(business.currentToken.split('-')[1]) + 1).padStart(3, '0')}
          </p>
          <p className="text-sm font-medium text-gray-400 mt-2">Up Next</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Waiting</p>
          <p className="text-4xl font-black text-gray-700">{business.waiting}</p>
          <p className="text-sm font-medium text-gray-400 mt-2">People in line</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Est. Wait</p>
          <div className="flex items-center justify-center text-4xl font-black text-gray-700">
            {business.waitTime || (business.waiting * 5)}<span className="text-xl ml-1 text-gray-400">min</span>
          </div>
          <p className="text-sm font-medium text-gray-400 mt-2">Average time</p>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="px-8 pb-6">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (business.waiting / 50) * 100)}%` }}
            transition={{ duration: 1 }}
            className={`h-full rounded-full relative ${business.waiting > 40 ? 'bg-red-500' : business.waiting > 20 ? 'bg-orange-500' : 'bg-blue-500'}`}
          />
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mt-2">
          <span>0 (Empty)</span>
          <span>{business.waiting} Waiting</span>
          <span>50 (Max Cap)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-auto">
        <button 
          onClick={() => businessCallNext(business._id)}
          disabled={business.waiting === 0}
          className="flex flex-col items-center justify-center py-4 px-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
        >
          <FiPlayCircle className="w-6 h-6 mb-2" />
          Call Next
        </button>
        <button className="flex flex-col items-center justify-center py-4 px-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold rounded-xl transition-all shadow-sm">
          <FiRefreshCw className="w-6 h-6 mb-2 text-gray-400" />
          Recall
        </button>
        <button 
          onClick={() => businessCallNext(business._id)}
          disabled={business.waiting === 0}
          className="flex flex-col items-center justify-center py-4 px-2 bg-white hover:bg-orange-50 disabled:bg-gray-50 disabled:cursor-not-allowed text-orange-700 border border-orange-200 font-bold rounded-xl transition-all shadow-sm"
        >
          <FiSkipForward className="w-6 h-6 mb-2 text-orange-400" />
          Skip
        </button>
        <button 
          onClick={() => issueEmergencyToken(business._id)}
          className="flex flex-col items-center justify-center py-4 px-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold rounded-xl transition-all shadow-sm"
        >
          <FiAlertTriangle className="w-6 h-6 mb-2 text-red-400" />
          Emergency
        </button>
      </div>
    </div>
  );
};

export default LiveQueueManagerWidget;
