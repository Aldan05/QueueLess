import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiClock, FiCalendar, FiUsers, FiChevronRight, FiLock, FiPause } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const getCategoryIcon = (category) => {
  if (!category) return '🏢';
  const c = category.toLowerCase();
  if (c.includes('bank') || c.includes('finance')) return '🏦';
  if (c.includes('hospital') || c.includes('health') || c.includes('clinic') || c.includes('medical')) return '🏥';
  if (c.includes('restaurant') || c.includes('food') || c.includes('cafe')) return '🍽️';
  if (c.includes('salon') || c.includes('beauty') || c.includes('spa')) return '💇';
  if (c.includes('service') || c.includes('repair')) return '🔧';
  if (c.includes('gov') || c.includes('public')) return '🏛️';
  if (c.includes('pharmacy')) return '💊';
  if (c.includes('education') || c.includes('school')) return '🎓';
  return '🏢';
};

const renderStarIcons = (rating = 0) => {
  const num = Number(rating) || 0;
  return [1, 2, 3, 4, 5].map((starValue) => {
    if (num >= starValue) {
      return <FaStar key={starValue} className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm" />;
    } else if (num >= starValue - 0.5) {
      return <FaStarHalfAlt key={starValue} className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-sm" />;
    }
    return <FaRegStar key={starValue} className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />;
  });
};

const BusinessServiceCard = ({ business, onJoin, delay = 0 }) => {
  const navigate = useNavigate();

  const rating = Math.min(5, Math.max(0, Number(business.rating) || 0));
  const reviewCount = Number(business.reviewCount) || 0;
  const waitMinutes = business.waitTime || (business.waitStatus === 'Fast' ? 10 : business.waitStatus === 'Moderate' ? 20 : business.waitStatus === 'High' ? 45 : 15);
  
  const currentQueueStatus = business.queueStatus || (business.queueActive !== false && business.queueActive !== 'false' ? 'open' : 'closed');
  const isOpen = currentQueueStatus === 'open';
  const isPaused = currentQueueStatus === 'paused';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => navigate(`/customer/business/${business._id}`)}
      className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-300 flex flex-col justify-between relative cursor-pointer hover:-translate-y-1 overflow-hidden"
    >
      {/* Top Background Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

      {/* Card Header: Logo/Icon + Name + Category + Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              {(() => {
                const logoObj = business.docLogo;
                const logoSrc = typeof logoObj === 'string' ? logoObj : (logoObj?.content || logoObj?.url);
                return logoSrc ? (
                  <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{business.icon || getCategoryIcon(business.category)}</span>
                );
              })()}
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {business.name}
              </h3>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-400 mt-0.5 uppercase tracking-wider">
                {business.category || 'Service'}
              </p>
            </div>
          </div>

          {/* Open / Paused / Closed Status Pill */}
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shrink-0 bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Closed
            </span>
          )}
        </div>

        {/* ⭐ Overall Rating & Reviews Display */}
        <div className="flex items-center justify-between bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-2xl px-3.5 py-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStarIcons(rating)}
            </div>
            <span className="font-black text-amber-900 dark:text-amber-300 text-sm">
              {Number(rating).toFixed(1)}
            </span>
          </div>

          <span className="text-xs font-bold text-amber-800/80 dark:text-amber-400/80">
            {reviewCount === 0 ? '0 Reviews' : `${reviewCount.toLocaleString()} ${reviewCount === 1 ? 'Review' : 'Reviews'}`}
          </span>
        </div>

        {/* Location & Wait Time details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
            <FiMapPin className="text-gray-400 mr-2 w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {business.address && business.city 
                ? `${business.address}, ${business.city}`
                : business.address || business.city || 'Location available on map'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiClock className="text-blue-500 mr-2 w-3.5 h-3.5 shrink-0" />
              <span className="font-bold text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg">
                {waitMinutes} min Wait
              </span>
            </div>

            {business.waiting > 0 && (
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[11px] font-bold">
                <FiUsers className="w-3 h-3" />
                {business.waiting} waiting
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Book Appointment + Join Queue */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-700/80 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customer/business/${business._id}#appointment`);
          }}
          className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FiCalendar className="w-3.5 h-3.5 text-indigo-500" />
          Book Appointment
        </button>

        {isOpen ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onJoin) {
                onJoin(business._id);
              } else {
                navigate(`/customer/business/${business._id}?join=true`);
              }
            }}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FiClock className="w-3.5 h-3.5" />
            Join Queue
          </button>
        ) : isPaused ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast('Queue is temporarily paused. Please check back shortly.', { icon: '⏸️' });
            }}
            className="flex-1 py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-xs border border-amber-200 dark:border-amber-800/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Queue is temporarily paused"
          >
            <FiPause className="w-3.5 h-3.5" />
            Queue Paused
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.error(`${business.name} is currently closed. Queue joining is unavailable.`, { icon: '🔒' });
            }}
            className="flex-1 py-2.5 px-3 bg-gray-200/70 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 font-bold rounded-xl text-xs opacity-60 cursor-not-allowed select-none flex items-center justify-center gap-1.5 border border-dashed border-gray-300 dark:border-slate-600 transition-all"
            title="Business is currently closed"
          >
            <FiLock className="w-3.5 h-3.5" />
            Closed
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BusinessServiceCard;
