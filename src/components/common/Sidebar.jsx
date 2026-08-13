import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ links, role }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">
          Queue<span className="text-gray-900 dark:text-white">Less</span>
        </Link>
      </div>
      
      <div className="px-6 py-4">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {role} Panel
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                isActive 
                  ? 'text-primary bg-blue-50 dark:bg-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center mr-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {role.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white">{role} User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary cursor-pointer">Sign out</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
