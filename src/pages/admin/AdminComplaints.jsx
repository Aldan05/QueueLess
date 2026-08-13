import { useState, useEffect } from 'react';
import { FiAlertCircle, FiSearch, FiFilter, FiMessageCircle, FiCheckCircle, FiClock, FiMoreVertical } from 'react-icons/fi';

import { useDatabase } from '../../context/DatabaseContext';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const { complaints, updateComplaintStatus, fetchAllComplaints } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  useEffect(() => {
    fetchAllComplaints();
  }, []);
  
  const tickets = complaints || [];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <FiAlertCircle className="w-4 h-4" />;
      case 'In Progress': return <FiClock className="w-4 h-4" />;
      case 'Resolved': return <FiCheckCircle className="w-4 h-4" />;
      default: return <FiMessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
      case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400 font-bold';
      case 'Medium': return 'text-amber-600 dark:text-amber-400 font-bold';
      case 'Low': return 'text-green-600 dark:text-green-400 font-bold';
      default: return 'text-gray-600 dark:text-gray-400 font-bold';
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateComplaintStatus(id, newStatus);
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center shadow-sm">
            <FiAlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Complaints & Support
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage and resolve user complaints and support tickets.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700">
        <div className="relative w-full sm:max-w-md flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search tickets by ID, user, or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl text-sm font-medium transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FiFilter className="text-gray-400 w-5 h-5" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:w-48 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tickets found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {searchTerm ? "Try adjusting your search or filter criteria." : "Great job! There are no pending complaints right now."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredTickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{ticket.subject}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-400">#{ticket.ticketId}</span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(ticket.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{ticket.reporterName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.reporterType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-xs rounded-lg px-2 py-1 outline-none focus:border-primary text-gray-700 dark:text-gray-300"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
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

export default AdminComplaints;
