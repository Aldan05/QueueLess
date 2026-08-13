import { motion, AnimatePresence } from 'framer-motion';

/**
 * NavBadge – animated count pill shown on sidebar nav items.
 * count: number   – badge count (0 = hidden)
 * variant: 'dark' | 'light' – colour scheme to match sidebar theme
 */
const NavBadge = ({ count, variant = 'light' }) => {
  if (!count || count <= 0) return null;
  const label = count > 99 ? '99+' : String(count);

  const styles =
    variant === 'dark'
      ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
      : 'bg-red-500 text-white shadow-sm';

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={label}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`ml-auto min-w-[20px] h-5 flex items-center justify-center text-[10px] font-black rounded-full px-1.5 ${styles}`}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
};

export default NavBadge;
