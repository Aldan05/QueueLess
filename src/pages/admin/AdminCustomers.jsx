import { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { FiUsers, FiSearch, FiMoreVertical, FiMail, FiCalendar } from 'react-icons/fi';

const AdminCustomers = () => {
  const { users } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only customers and apply search
  const customers = users
    .filter(u => u.role === 'Customer')
    .filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-gray-100 dark:bg-slate-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiUsers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Customer Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              View and manage all registered customers on the platform
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 shadow-sm"
          />
        </div>
        
        <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
          Showing {customers.length} customer(s)
        </div>
      </div>

      {/* Customers List */}
      {customers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No customers found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchTerm ? "Try adjusting your search query." : "There are currently no registered customers on the platform."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {customers.map(customer => (
                  <tr key={customer._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                          {customer.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{customer.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {customer._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        {new Date().toLocaleDateString()} {/* Placeholder since we don't have createdAt in memory */}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <FiMoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
