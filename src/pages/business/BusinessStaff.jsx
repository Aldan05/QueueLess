import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiEdit, FiTrash2, FiKey, FiCheckCircle, FiXCircle, FiRadio } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BusinessStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const businessId = currentUser.businessId?._id || currentUser.businessId;

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchAnnouncements();
  }, [businessId]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/announcements/staff`);
      if (response.ok) {
        setAnnouncements(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_URL}/staff/business/${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`${API_URL}/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setStaffList(staffList.map(s => s._id === id ? { ...s, status: newStatus } : s));
        toast.success(`Staff marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Custom Glassmorphic Modal State for Staff / Announcement Deletion
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: null, // 'staff' | 'announcement'
    id: null,
    title: '',
    message: ''
  });

  const confirmDeleteAction = async () => {
    if (!deleteConfirmModal.id || !deleteConfirmModal.type) return;
    try {
      if (deleteConfirmModal.type === 'staff') {
        const response = await fetch(`${API_URL}/staff/${deleteConfirmModal.id}`, { method: 'DELETE' });
        if (response.ok) {
          setStaffList(staffList.filter(s => s._id !== deleteConfirmModal.id));
          toast.success('Staff member deleted');
        } else {
          toast.error('Failed to delete staff member');
        }
      } else if (deleteConfirmModal.type === 'announcement') {
        const response = await fetch(`${API_URL}/businesses/${businessId}/announcements/staff/${deleteConfirmModal.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          toast.success("Announcement deleted");
          fetchAnnouncements();
        } else {
          toast.error("Failed to delete announcement");
        }
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' });
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'staff',
      id,
      title: 'Delete Staff Member?',
      message: 'Are you sure you want to delete this employee? Their portal access and assigned counter duties will be removed.'
    });
  };

  const handleDeleteAnnouncement = (announcementId) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'announcement',
      id: announcementId,
      title: 'Delete Staff Announcement?',
      message: 'Are you sure you want to delete this broadcast? It will be removed from all staff devices.'
    });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/staff/${editingStaff._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        toast.success('Staff updated successfully');
        setIsEditModalOpen(false);
        fetchStaff();
      } else {
        toast.error('Failed to update staff');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/staff/${editingStaff._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (response.ok) {
        toast.success('Password reset successfully');
        setIsPasswordModalOpen(false);
        setNewPassword('');
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMessage.trim()) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/announcements/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementMessage.trim() })
      });
      if (response.ok) {
        toast.success("Announcement broadcasted successfully!");
        setIsAnnouncementModalOpen(false);
        setAnnouncementMessage('');
        fetchAnnouncements();
      } else {
        toast.error("Failed to send announcement");
      }
    } catch (error) { toast.error("Server error"); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your employees, assign counters, and control access.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={() => setIsAnnouncementModalOpen(true)} className="px-5 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:hover:bg-amber-500/20 font-bold rounded-xl transition-colors flex items-center gap-2">
              <FiRadio /> Announce to Staff
            </button>
          <button 
            onClick={() => navigate('/business/staff/add')}
            className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
          >
            <FiUserPlus /> Add New Staff
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading staff members...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center">
            <FiUserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Staff Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">You haven't added any staff members yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Counter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {staffList.map(staff => (
                  <tr key={staff._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {staff.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{staff.fullName}</p>
                          <p className="text-xs text-gray-500">{staff.employeeId} • {staff.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {staff.counterId ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                          {staff.counterId.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {staff.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(staff._id, staff.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          staff.status === 'Active' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {staff.status === 'Active' ? <FiCheckCircle /> : <FiXCircle />}
                        {staff.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingStaff(staff); setNewPassword(''); setIsPasswordModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                          title="Reset Password"
                        >
                          <FiKey />
                        </button>
                        <button 
                          onClick={() => { 
                            setEditingStaff(staff); 
                            setEditFormData({
                              fullName: staff.fullName,
                              username: staff.username,
                              designation: staff.designation
                            });
                            setIsEditModalOpen(true); 
                          }}
                          className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors" 
                          title="Edit Staff"
                        >
                          <FiEdit />
                        </button>
                        <button onClick={() => handleDelete(staff._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Staff">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Broadcast History</h2>
            <p className="text-sm text-gray-500">Recent announcements sent to staff.</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No announcements sent yet.</div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="p-6 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{a.message}</p>
                  <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title="Delete Announcement"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Staff Details</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editFormData.designation}
                  onChange={(e) => setEditFormData({...editFormData, designation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isPasswordModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">For {editingStaff.fullName}</p>
            </div>
            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 dark:text-white outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/30">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn border border-gray-100 dark:border-slate-700">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-500/10 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <FiRadio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Broadcast Announcement</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Send a real-time alert to all active staff</p>
              </div>
            </div>
            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Announcement Message</label>
                <textarea
                  required
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="e.g., The system will be undergoing maintenance in 10 minutes..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-gray-50/50 dark:bg-slate-900/50 dark:text-white outline-none transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                  <FiRadio /> Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Glassmorphic Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center mb-4">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
              {deleteConfirmModal.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed mb-6">
              {deleteConfirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 text-sm shadow-md shadow-red-500/20 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessStaff;
