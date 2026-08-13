import { motion } from 'framer-motion';

const QuickActionCard = ({ title, icon: Icon, colorClass, onClick, delay = 0 }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={`relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group ${colorClass.replace('bg-', 'hover:bg-').replace('-50', '-50/50')}`}
    >
      <div className={`p-4 rounded-2xl mb-3 transition-colors duration-300 ${colorClass} group-hover:bg-white`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-50', '-500')} group-hover:scale-110 transition-transform`} />
      </div>
      <span className="font-bold text-gray-700 text-sm">{title}</span>
    </motion.button>
  );
};

export default QuickActionCard;
