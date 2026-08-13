import React from 'react';
import { motion } from 'framer-motion';

const BusinessStatCard = ({ title, value, icon: Icon, trendValue, colorClass, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100/90 dark:border-slate-700/80 hover:shadow-lg hover:border-blue-500/20 dark:hover:border-blue-500/30 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top row: Icon & Status Badge */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className={`p-3.5 rounded-2xl ${colorClass.bg} dark:bg-opacity-20 text-opacity-100 transition-transform group-hover:scale-105 shadow-sm`}>
          <Icon className={`w-6 h-6 ${colorClass.text} dark:text-opacity-90`} />
        </div>
        
        {trendValue && (
          <div className="flex items-center">
            <span className={`inline-flex items-center text-xs font-black px-3 py-1 rounded-xl tracking-tight shadow-sm border ${
              trendValue.includes('waiting') || trendValue.includes('Active')
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-900/50'
                : trendValue.includes('serving') || trendValue.includes('confirmed')
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-900/50'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-900/50'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      
      {/* Bottom row: Value & Title */}
      <div className="mt-1">
        <h3 className="text-gray-400 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-1.5">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
      </div>

      {/* Modern ambient accent line */}
      <div className={`mt-5 h-1.5 w-full rounded-full ${colorClass.bg} dark:bg-slate-700/60 overflow-hidden`}>
        <div className={`h-full rounded-full ${colorClass.text?.replace('text-', 'bg-') || 'bg-blue-500'} opacity-75`} style={{ width: '100%' }} />
      </div>
    </motion.div>
  );
};

export default BusinessStatCard;
