import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const features = [
  "Skip Long Queues",
  "Live Queue Tracking",
  "Smart Notifications",
  "Digital Token System"
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Left Section - 40% */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl filter mix-blend-screen"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-3xl filter mix-blend-screen"></div>
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Queue<span className="text-blue-400">Less</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              "Skip the Line. Save Your Time."
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center my-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto aspect-square bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col justify-center shadow-2xl relative"
          >
             <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
               Live Status
             </div>
             <div className="space-y-6">
                {features.map((feature, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                      <FiCheckCircle />
                    </div>
                    <span className="font-medium text-blue-50">{feature}</span>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-blue-200/80 text-sm"
          >
            &copy; {new Date().getFullYear()} QueueLess Inc. Empowering modern businesses.
          </motion.p>
        </div>
      </div>

      {/* Right Section - 60% */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[60%] xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md lg:max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
