import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiSearch, FiAlertCircle, FiEye, FiX, FiMove } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import TimeInput from '../../components/common/TimeInput';

const StaffAppointments = () => {
  const { businesses, socket } = useDatabase();
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  
  const [actionModal, setActionModal] = useState({ type: null, aptId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const business = businesses.find(b => b._id === currentStaff?.businessId);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (actionModal.type === 'suggest' && actionModal.aptId) {
        const apt = appointments.find(a => a._id === actionModal.aptId);
        if (apt) {
          try {
            const dateStr = new Date(apt.date).toISOString().split('T')[0];
            const res = await fetch(`${API_URL}/customer/appointments/booked/${business._id}?date=${dateStr}`);
            if (res.ok) {
              const times = await res.json();
              setBookedTimes(times);
            }
          } catch (error) {
            console.error('Failed to fetch booked times');
          }
        }
      }
    };
    fetchBookedTimes();
  }, [actionModal, appointments]);

  const fetchAppointments = async () => {
    if (!business) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const approveAppointment = async (aptId) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments/${aptId}/approve`, {
        method: 'PATCH'
      });
      if (response.ok) {
        toast.success('Appointment approved');
        fetchAppointments();
      } else {
        toast.error('Failed to approve appointment');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const rejectAppointment = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments/${actionModal.aptId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (response.ok) {
        toast.success('Appointment rejected');
        fetchAppointments();
        setActionModal({ type: null, aptId: null });
        setRejectionReason('');
      }
    } catch (error) { toast.error('Server error'); }
  };
  const updateStatus = async (aptId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Appointment marked as ${newStatus}`);
        fetchAppointments();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const deleteAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to delete this appointment from the system entirely?')) return;
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments/${aptId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        toast.success('Appointment deleted');
        fetchAppointments();
      }
    } catch (error) { toast.error('Server error'); }
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const cleanMin = m.substring(0, 2);
    return `${hour12}:${cleanMin} ${ampm}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour24 = i.toString().padStart(2, '0');
        const min = j.toString().padStart(2, '0');
        const value = `${hour24}:${min}`;
        const hour12 = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        slots.push({ value, label: `${hour12}:${min} ${ampm}` });
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const suggestTime = async () => {
    if (!suggestedTime) {
      toast.error('Please select or specify a suggested time.');
      return;
    }
    if (bookedTimes.includes(suggestedTime)) {
      toast.error('This time slot is already booked. Please choose another time.');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/businesses/${business._id}/appointments/${actionModal.aptId}/suggest`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedTime })
      });
      if (response.ok) {
        toast.success('New time suggested');
        setActionModal({ type: null, aptId: null });
        setSuggestedTime('');
        fetchAppointments();
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error(errData.message || 'Failed to suggest time');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [business]);

  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => {
      fetchAppointments();
    };

    const handleNotification = (notif) => {
      if (notif && notif.type === 'appointment_new') {
        toast.success(notif.message, {
          icon: '📅',
          duration: 6000,
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#fff',
            fontWeight: '600'
          }
        });
        fetchAppointments();
      }
    };

    socket.on('appointmentUpdated', handleUpdate);
    socket.on('notification', handleNotification);
    return () => {
      socket.off('appointmentUpdated', handleUpdate);
      socket.off('notification', handleNotification);
    };
  }, [socket, business]);

  const parseNotes = (notes) => {
    if (!notes) return <p className="text-gray-500 italic">No additional notes provided.</p>;
    
    // Check if it's our structured format
    if (notes.includes(' | ')) {
      const parts = notes.split(' | ');
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {parts.map((part, index) => {
            const splitIndex = part.indexOf(':');
            if (splitIndex === -1) return null;
            const key = part.substring(0, splitIndex).trim();
            const value = part.substring(splitIndex + 1).trim() || 'N/A';
            return (
              <div key={index} className="bg-white p-3 rounded-xl shadow-sm border border-blue-100/50">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">{key}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
              </div>
            );
          })}
        </div>
      );
    }
    
    return <p className="text-sm text-gray-700">{notes}</p>;
  };

  if (!business) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500 font-medium mt-1">Manage scheduled customer bookings and cancellations.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search appointments..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <FiCalendar className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 font-medium">No appointments scheduled.</p>
                    <p className="text-gray-400 text-sm mt-1">Bookings will appear here once customers schedule them.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{apt.customerId?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">
                          {apt.notes?.match(/Contact:\s*([^|]+)/)?.[1]?.trim() || apt.customerId?.phone || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{new Date(apt.date).toLocaleDateString()}</span>
                        <span className="text-gray-400 flex items-center gap-1 mt-0.5"><FiClock className="w-3 h-3"/> {formatTime12Hour(apt.time)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {apt.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-bold">
                          <FiAlertCircle className="mr-1.5" /> Pending
                        </span>
                      )}
                      {apt.status === 'suggested' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-bold">
                          Suggesting Time
                        </span>
                      )}
                      {['approved', 'checked_in', 'in_service'].includes(apt.status) && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span> {apt.status.replace('_', ' ')}
                        </span>
                      )}
                      {apt.status === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                          <FiCheckCircle className="mr-1.5" /> Completed
                        </span>
                      )}
                      {(apt.status === 'cancelled' || apt.status === 'rejected' || apt.status === 'no_show') && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold">
                          <FiXCircle className="mr-1.5" /> {apt.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[250px]">
                      {apt.notes && apt.notes.includes(' | ') ? (
                        <div className="flex flex-col gap-1 text-xs">
                          {apt.notes.split(' | ').map((part, i) => {
                            const splitIdx = part.indexOf(':');
                            if (splitIdx === -1) return null;
                            const key = part.substring(0, splitIdx).trim();
                            const val = part.substring(splitIdx + 1).trim();
                            if (!val || key === 'Contact') return null;
                            return (
                              <span key={i} className="truncate" title={val}>
                                <span className="font-semibold text-gray-600 dark:text-gray-400">{key}:</span> {val}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="italic truncate block">{apt.notes || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center h-full">
                        <button onClick={() => setViewingAppointment(apt)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"><FiEye /> View</button>
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => approveAppointment(apt._id)} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">Approve</button>
                            <button onClick={() => setActionModal({ type: 'reject', aptId: apt._id })} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Reject</button>
                            <button onClick={() => setActionModal({ type: 'suggest', aptId: apt._id })} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors">Suggest</button>
                          </>
                        )}
                        {['approved', 'checked_in', 'in_service'].includes(apt.status) && (
                          <button onClick={() => updateStatus(apt._id, 'completed')} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Mark Completed</button>
                        )}
                        {['cancelled', 'rejected', 'completed', 'no_show'].includes(apt.status) && (
                          <button onClick={() => deleteAppointment(apt._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Appointment Modal (Draggable / Movable) */}
      <AnimatePresence>
        {viewingAppointment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingAppointment(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              drag
              dragMomentum={false}
              dragElastic={0.05}
              initial={{ scale: 0.95, opacity: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col relative z-10"
            >
              {/* Draggable Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/90 cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg" title="Drag to move this window anywhere">
                    <FiMove className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900 leading-tight">Appointment Details</h2>
                    <p className="text-xs text-gray-400 font-medium">Click and drag header to move</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md">
                    <FiMove className="w-3 h-3" /> Draggable
                  </span>
                  <button 
                    onClick={() => setViewingAppointment(null)} 
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                    title="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Customer Information</p>
                  <p className="text-lg font-black text-gray-900 mt-1">{viewingAppointment.customerId?.name || 'Unknown Customer'}</p>
                  <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-2">📞 {viewingAppointment.customerId?.phone || 'No phone provided'}</p>
                  <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-2">✉️ {viewingAppointment.customerId?.email || 'No email provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2"><FiCalendar className="text-blue-500"/> {new Date(viewingAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2"><FiClock className="text-orange-500"/> {formatTime12Hour(viewingAppointment.time)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-gray-900 capitalize mt-1 inline-flex items-center px-3 py-1 bg-gray-100 rounded-lg">{viewingAppointment.status}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Service Request Details</p>
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                    {parseNotes(viewingAppointment.notes)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modals (Draggable) */}
      <AnimatePresence>
        {actionModal.type === 'reject' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActionModal({type: null, aptId: null})}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              drag
              dragMomentum={false}
              dragElastic={0.05}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <FiMove className="text-gray-400 w-4 h-4" />
                  <h2 className="text-xl font-bold text-gray-900">Reject Appointment</h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">Draggable</span>
              </div>
              <textarea
                className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                rows="3"
                placeholder="Reason for rejection..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button onClick={() => setActionModal({type: null, aptId: null})} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={rejectAppointment} className="px-4 py-2 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 transition-colors">Confirm Reject</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {actionModal.type === 'suggest' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActionModal({type: null, aptId: null})}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              drag
              dragMomentum={false}
              dragElastic={0.05}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <FiMove className="text-gray-400 w-4 h-4" />
                  <h2 className="text-xl font-bold text-gray-900">Suggest Another Time</h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">Draggable</span>
              </div>
              <div className="mb-6">
                <TimeInput
                  value={suggestedTime}
                  onChange={val => setSuggestedTime(val)}
                  className={`w-full ${bookedTimes.includes(suggestedTime) ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                />
                {bookedTimes.includes(suggestedTime) && (
                  <p className="text-xs text-red-500 font-bold mt-2">❌ This time is already booked</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setActionModal({type: null, aptId: null})} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <button 
                  onClick={suggestTime} 
                  disabled={!suggestedTime || bookedTimes.includes(suggestedTime)}
                  className="px-4 py-2 bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-bold text-white hover:bg-orange-700 transition-colors"
                >
                  Send Suggestion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffAppointments;
