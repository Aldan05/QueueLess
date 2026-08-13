import { motion } from 'framer-motion';

const AdminStatCard = ({ title, value, icon: Icon, trend, trendValue, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-md hover:border-gray-200 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 rounded-xl bg-gray-50 text-gray-700 transition-transform group-hover:scale-110 border border-gray-100 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-black text-gray-900 tracking-tight">
            {value}
          </p>
        </div>
      </div>
      
      {/* Premium Minimalist Mini Chart */}
      <div className="mt-5 h-6 flex items-end gap-[3px] opacity-40 group-hover:opacity-100 transition-opacity relative z-10">
        {[30, 45, 25, 60, 40, 75, 50, 90, 65, 100].map((height, i) => (
          <div 
            key={i} 
            className="w-full rounded-t-sm bg-gray-900 hover:bg-blue-600 transition-colors"
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminStatCard;
