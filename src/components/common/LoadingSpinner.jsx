import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
};

export default LoadingSpinner;
