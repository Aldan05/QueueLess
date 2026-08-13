import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-opacity-100`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-50', '-500')}`} />
        </div>
        
        {trend && (
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-gray-500 font-medium text-sm mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left">
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
