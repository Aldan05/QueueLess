import React, { useState, useEffect } from 'react';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiSearch, FiX, FiMail, FiPhone, FiCalendar, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const BusinessCustomers = () => {
  const { businesses, socket } = useDatabase();
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState({
    isOpen: false,
    title: '',
    description: '',
    itemDetails: null,
    confirmText: 'Delete',
    onConfirm: null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const business = businesses.find(b => b._id === currentUser?.businessId);

  const fetchCustomers = async () => {
    if (!business) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteRecordModal = (customerRecord) => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Delete Customer Record',
      description: 'Are you sure you want to permanently remove this customer queue record? This cannot be undone.',
      itemDetails: {
        token: customerRecord.token || 'TK',
        name: customerRecord.customerId?.name || 'Customer',
        status: customerRecord.status,
        time: `Joined ${new Date(customerRecord.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      },
      confirmText: 'Delete Record',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history/${customerRecord._id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            toast.success('Record deleted successfully');
            fetchCustomers();
            if (selectedCustomer?._id === customerRecord._id) {
              setSelectedCustomer(null);
            }
          } else {
            toast.error('Failed to delete record');
          }
        } catch (error) {
          toast.error('Server error during deletion');
        } finally {
          setIsDeleting(false);
          setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openClearAllHistoryModal = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Clear All Customer History',
      description: `WARNING: Are you sure you want to permanently delete all ${customers.length} customer records? All history will be wiped out completely.`,
      itemDetails: null,
      confirmText: 'Clear Everything',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const response = await fetch(`${API_URL}/businesses/${business._id}/queue/history`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            toast.success('All history cleared successfully');
            fetchCustomers();
          } else {
            toast.error('Failed to clear history');
          }
        } catch (error) {
          toast.error('Server error during bulk deletion');
        } finally {
          setIsDeleting(false);
          setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleApprove = async (customer) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customer.token })
      });
      if (response.ok) {
        toast.success(`Approved customer ${customer.token}`);
        fetchCustomers();
      } else {
        toast.error('Failed to approve customer');
      }
    } catch (error) {
      toast.error('Server error during approval');
    }
  };

  const handleRestore = async (customer) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/queue/restore`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customer.token })
      });
      if (response.ok) {
        toast.success(`Restored customer ${customer.token} to queue`);
        fetchCustomers();
      } else {
        toast.error('Failed to restore customer');
      }
    } catch (error) {
      toast.error('Server error during restore');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [business]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for real-time updates and refresh the list
    const handleQueueUpdate = () => {
      fetchCustomers();
    };

    socket.on('queueUpdated', handleQueueUpdate);
    return () => socket.off('queueUpdated', handleQueueUpdate);
  }, [socket, business]);

  if (!business) return null;

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const tokenMatch = c.token.toLowerCase().includes(term);
    const nameMatch = c.customerId?.name?.toLowerCase().includes(term);
    return tokenMatch || nameMatch;
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Database</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time log of customer queue activity.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={openClearAllHistoryModal}
            disabled={customers.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiTrash2 /> Clear All History
          </button>
          
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search names or tokens..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">Loading customer data...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{c.token}</span>
                      {c.isPriority && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Priority</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                      {c.customerId?.name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'waiting' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span> Waiting
                        </span>
                      )}
                      {c.status === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                          <FiCheckCircle className="mr-1.5" /> Served
                        </span>
                      )}
                      {c.status === 'cancelled' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold">
                          <FiXCircle className="mr-1.5" /> Cancelled
                        </span>
                      )}
                      {c.status === 'missed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold">
                          <FiXCircle className="mr-1.5" /> Missed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(c.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3 items-center h-full">
                      {c.status === 'waiting' && (
                        <button 
                          onClick={() => handleApprove(c)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {c.status === 'missed' && (
                        <button 
                          onClick={() => handleRestore(c)}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Recall
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedCustomer(c)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => openDeleteRecordModal(c)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                        title="Delete Record"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className="font-extrabold text-gray-900 text-lg">Customer Details</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openDeleteRecordModal(selectedCustomer)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm">
                    {selectedCustomer.customerId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.customerId?.name || 'Unknown User'}</h4>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      selectedCustomer.status === 'waiting' ? 'bg-blue-50 text-blue-700' :
                      selectedCustomer.status === 'completed' ? 'bg-green-50 text-green-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {selectedCustomer.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Queue Token</p>
                    <p className="font-extrabold text-gray-900 text-lg">{selectedCustomer.token}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Join Time</p>
                    <p className="font-bold text-gray-900">{new Date(selectedCustomer.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {selectedCustomer.customerId && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Information</p>
                    {selectedCustomer.customerId.email && (
                      <div className="flex items-center text-gray-600 text-sm font-medium">
                        <FiMail className="w-4 h-4 mr-3 text-gray-400" />
                        {selectedCustomer.customerId.email}
                      </div>
                    )}
                    {selectedCustomer.customerId.phone && (
                      <div className="flex items-center text-gray-600 text-sm font-medium">
                        <FiPhone className="w-4 h-4 mr-3 text-gray-400" />
                        {selectedCustomer.customerId.phone}
                      </div>
                    )}
                    {!selectedCustomer.customerId.email && !selectedCustomer.customerId.phone && (
                      <p className="text-sm text-gray-400 italic">No contact information provided.</p>
                    )}
                  </div>
                )}

                {selectedCustomer.documents && selectedCustomer.documents.length > 0 ? (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ID Verification</p>
                    {selectedCustomer.documents.map((doc, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-sm font-bold text-gray-700 mb-1">{doc.type}</p>
                        <div className="flex gap-4">
                          {doc.frontImage && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Front Image</span>
                              <img src={doc.frontImage} alt="Front ID" className="h-24 w-auto object-contain rounded border border-gray-300" />
                            </div>
                          )}
                          {doc.backImage && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-1">Back Image</span>
                              <img src={doc.backImage} alt="Back ID" className="h-24 w-auto object-contain rounded border border-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedCustomer.verificationData ? (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ID Verification</p>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-sm"><strong>ID Type:</strong> {selectedCustomer.verificationData.idType}</p>
                      <p className="text-sm"><strong>ID Number:</strong> {selectedCustomer.verificationData.idNumber}</p>
                      {selectedCustomer.verificationData.idImage && (
                        <a href={selectedCustomer.verificationData.idImage} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">
                          View Document Image
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}
                
                {selectedCustomer.notes && (
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Priority Notes</p>
                    <p className="text-sm text-yellow-800 font-medium">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Professional Confirmation Modal for Deletions */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalConfig.onConfirm}
        title={deleteModalConfig.title}
        description={deleteModalConfig.description}
        itemDetails={deleteModalConfig.itemDetails}
        confirmText={deleteModalConfig.confirmText}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BusinessCustomers;
