import { motion } from 'framer-motion';

const tabs = [
  { id: 'Customer', label: '👤 Customer' },
  { id: 'Business', label: '🏢 Business' },
  { id: 'Super Admin', label: '👨‍💼 Admin' }
];

const RoleTabs = ({ activeRole, onRoleChange }) => {
  return (
    <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl mb-8 relative">
      {tabs.map((tab) => {
        const isActive = activeRole === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onRoleChange(tab.id)}
            className={`relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center z-10 ${
              isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-role-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50 -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleTabs;
