import { motion } from 'framer-motion';

const EmptyStatePage = ({ title, description, icon: Icon, actionText, onAction }) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm w-full bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-blue-50/80 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner text-primary/80 transform -rotate-3 hover:rotate-0 transition-transform">
          {Icon ? <Icon className="w-10 h-10" /> : <span className="text-4xl">📭</span>}
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
          {title}
        </h2>
        
        <p className="text-gray-500 font-medium mb-8">
          {description}
        </p>
        
        {actionText && (
          <button 
            onClick={onAction}
            className="w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5"
          >
            {actionText}
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default EmptyStatePage;
