import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiChevronRight, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import TimeInput from '../../components/common/TimeInput';

const CustomerAppointments = () => {
  const { businesses, socket } = useDatabase();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom Neat Confirm Modal State for Cancel & Delete
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'cancel' | 'delete'
    appointment: null,
    isProcessing: false
  });
  
  // Booking Form State
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [apptIdType, setApptIdType] = useState('');
  const [apptFrontImage, setApptFrontImage] = useState(null);
  const [apptBackImage, setApptBackImage] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const userStr = localStorage.getItem('currentUser');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [apptContact, setApptContact] = useState(currentUser?.phone || '');
  const [apptAddress, setApptAddress] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  const categoryServices = {
    'Healthcare': ['General Consultation', 'Dental Checkup', 'Blood Test', 'Specialist Visit', 'Vaccination'],
    'Banking': ['Deposit/Withdrawal', 'Account Opening', 'Loan Inquiry', 'Customer Service'],
    'Service Center': ['Vehicle Service', 'Repairs', 'Inspection', 'Parts Inquiry'],
    'Restaurant': ['Table Reservation', 'Private Dining', 'Event Booking'],
    'Retail': ['Customer Support', 'Returns & Exchanges', 'Personal Shopper'],
    'Government': ['Passport Service', 'ID Renewal', 'Tax Consultation', 'General Inquiry'],
    'Education': ['Admissions', 'Counseling', 'Fee Payment'],
    'Other': ['General Service', 'Consultation', 'Support']
  };

  const verifiedBusinesses = businesses.filter(b => b.isVerified || b.verificationStatus === 'Approved');
  const uniqueCities = [...new Set(verifiedBusinesses.filter(b => b.city).map(b => b.city))];
  const filteredBusinesses = selectedCity && selectedCity !== 'All Locations'
    ? verifiedBusinesses.filter(b => b.city === selectedCity)
    : verifiedBusinesses;

  const fetchAppointments = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_URL}/customer/appointments/${currentUser._id}`);
      if (response.ok) {
        const data = await response.json();
        // Map business details to each appointment for display
        const enriched = data.map(apt => {
          const biz = businesses.find(b => b._id === apt.businessId);
          return {
            ...apt,
            businessName: biz?.name || 'Unknown Business',
            category: biz?.category || 'Service',
            location: biz?.address || 'Location provided upon confirmation'
          };
        });
        setAppointments(enriched);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const fetchBookedTimes = async () => {
    if (selectedBusiness && selectedDate) {
      try {
        const response = await fetch(`${API_URL}/customer/appointments/booked/${selectedBusiness}?date=${selectedDate}`);
        if (response.ok) {
          const times = await response.json();
          setBookedTimes(times);
        }
      } catch (error) {
        console.error('Failed to fetch booked times');
      }
    } else {
      setBookedTimes([]);
    }
  };

  useEffect(() => {
    fetchBookedTimes();
  }, [selectedBusiness, selectedDate]);

  useEffect(() => {
    if (!socket) return;
    
    const handleAppointmentBooked = (data) => {
      // If the booked appointment matches our currently viewed business and date
      if (data && data.businessId === selectedBusiness) {
        fetchBookedTimes();
        if (data.time && selectedTime && normalizeTo24Hour(selectedTime) === normalizeTo24Hour(data.time)) {
          toast.error(`Slot ${formatTime12Hour(data.time)} was just appointed! Please pick another time.`, { icon: '⚠️' });
        }
      }
    };

    const handleUpdate = () => {
      fetchAppointments();
      if (selectedBusiness && selectedDate) {
        fetchBookedTimes();
      }
    };

    socket.on('appointmentBooked', handleAppointmentBooked);
    socket.on('appointmentUpdated', handleUpdate);
    return () => {
      socket.off('appointmentBooked', handleAppointmentBooked);
      socket.off('appointmentUpdated', handleUpdate);
    };
  }, [socket, selectedBusiness, selectedDate, selectedTime, currentUser]);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedTime) {
      toast.error('Please select an appointment time slot.');
      return;
    }

    if (isTimeBooked(selectedTime, bookedTimes)) {
      toast.error(`The time slot (${formatTime12Hour(selectedTime)}) is already appointed by another customer. Please choose an available time.`);
      return;
    }

    if (!apptIdType || !apptFrontImage) {
      toast.error("Please provide all required verification details and document image.");
      return;
    }

    try {
      const combinedNotes = `Contact: ${apptContact} | Address: ${apptAddress} | Proposal: ${selectedService} | Details: ${apptNotes}`;
      const verificationData = [{
        type: apptIdType,
        frontImage: apptFrontImage,
        backImage: apptBackImage
      }];

      const response = await fetch(`${API_URL}/customer/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness,
          customerId: currentUser._id,
          date: selectedDate,
          time: selectedTime,
          service: selectedService,
          notes: combinedNotes,
          documents: verificationData
        })
      });

      if (response.ok) {
        await fetchAppointments();
        setIsModalOpen(false);
        setSelectedBusiness('');
        setSelectedDate('');
        setSelectedTime('');
        setSelectedService('');
        toast.success('Appointment request submitted in real-time! Waiting for business confirmation.', { duration: 5000 });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to book appointment');
        if (selectedBusiness && selectedDate) {
          try {
            const res = await fetch(`${API_URL}/customer/appointments/booked/${selectedBusiness}?date=${selectedDate}`);
            if (res.ok) {
              const times = await res.json();
              setBookedTimes(times);
            }
          } catch (err) {}
        }
      }
    } catch (error) {
      toast.error('Server error: ' + error.message);
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmModal.appointment?._id) return;
    setConfirmModal(prev => ({ ...prev, isProcessing: true }));

    const aptId = confirmModal.appointment._id;
    try {
      if (confirmModal.type === 'cancel') {
        const response = await fetch(`${API_URL}/customer/appointments/${aptId}/cancel`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          toast.success('Appointment cancelled successfully', { icon: '🚫' });
          fetchAppointments();
          setConfirmModal({ isOpen: false, type: null, appointment: null, isProcessing: false });
        } else {
          toast.error('Failed to cancel appointment');
        }
      } else if (confirmModal.type === 'delete') {
        const response = await fetch(`${API_URL}/customer/appointments/${aptId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          toast.success('Appointment removed from history', { icon: '🗑️' });
          fetchAppointments();
          setConfirmModal({ isOpen: false, type: null, appointment: null, isProcessing: false });
        } else {
          toast.error('Failed to delete appointment');
        }
      }
    } catch (error) {
      toast.error('Server error: ' + error.message);
    } finally {
      setConfirmModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const acceptSuggestion = async (id) => {
    try {
      const response = await fetch(`${API_URL}/customer/appointments/${id}/accept-suggestion`, {
        method: 'PATCH'
      });
      if (response.ok) {
        await fetchAppointments();
        toast.success('Suggested time accepted! Booking confirmed.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to accept suggestion');
      }
    } catch (error) {
      toast.error('Server error: ' + error.message);
    }
  };

  const generateQRPayload = (apt) => {
    // Generate a URL that can be scanned by any native phone camera
    const baseUrl = window.location.origin;
    return `${baseUrl}/staff/verify-qr?aptId=${apt._id}&code=${apt.verificationCode}&bizId=${apt.businessId}`;
  };

  const getArriveBefore = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10) - 10, 0);
    return `Arrive by ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Normalizes any time format ("10:30", "10:30 AM", "10:30:00", "2:00 PM") to 24-hr "HH:MM"
  const normalizeTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    const str = String(timeStr).trim();
    const clean = str.toUpperCase();

    if (clean.includes('AM') || clean.includes('PM')) {
      const isPM = clean.includes('PM');
      const timePart = clean.replace(/\s*(AM|PM)\s*/g, '').trim();
      const parts = timePart.split(':');
      let h = parseInt(parts[0], 10);
      const m = parseInt((parts[1] || '0').substring(0, 2), 10);
      if (isNaN(h) || isNaN(m)) return '';
      if (isPM && h !== 12) h += 12;
      if (!isPM && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else if (clean.includes(':')) {
      const parts = clean.split(':');
      let h = parseInt(parts[0], 10);
      const m = parseInt((parts[1] || '0').substring(0, 2), 10);
      if (isNaN(h) || isNaN(m)) return '';
      // Clamp to valid 24h range
      if (h < 0 || h > 23 || m < 0 || m > 59) return '';
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    return '';
  };

  // Check if a time is appointed/booked by comparing normalized 24-hour formats
  const isTimeBooked = (targetTime, bookedList) => {
    if (!targetTime || !Array.isArray(bookedList) || bookedList.length === 0) return false;
    const targetNorm = normalizeTo24Hour(targetTime);
    if (!targetNorm) return false;
    return bookedList.some(bt => {
      const btNorm = normalizeTo24Hour(bt);
      return btNorm && btNorm === targetNorm;
    });
  };

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return '';
    const norm = normalizeTo24Hour(timeStr);
    if (!norm || !norm.includes(':')) return timeStr;
    const [h, m] = norm.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const generateTimeSlots = () => {
    const slotsMap = new Map();
    // Standard business day intervals: 8:00 AM to 7:00 PM (every 30 mins)
    for (let i = 8; i <= 19; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour24 = i.toString().padStart(2, '0');
        const min = j.toString().padStart(2, '0');
        const value = `${hour24}:${min}`;
        const hour12 = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        slotsMap.set(value, { value, label: `${hour12}:${min} ${ampm}` });
      }
    }

    // Freedom: If ANY customer booked ANY custom time (e.g. 10:15, 11:45, 14:10),
    // dynamically include that exact custom time chip in the slot list marked Appointed!
    if (Array.isArray(bookedTimes)) {
      bookedTimes.forEach(bt => {
        const norm = normalizeTo24Hour(bt);
        if (norm && norm.includes(':') && !slotsMap.has(norm)) {
          const [hStr, mStr] = norm.split(':');
          const h = parseInt(hStr, 10);
          const hour12 = h % 12 === 0 ? 12 : h % 12;
          const ampm = h < 12 ? 'AM' : 'PM';
          slotsMap.set(norm, { value: norm, label: `${hour12}:${mStr} ${ampm}` });
        }
      });
    }

    // If current user entered a custom time that is not in the list yet, also include it
    if (selectedTime) {
      const norm = normalizeTo24Hour(selectedTime);
      if (norm && norm.includes(':') && !slotsMap.has(norm)) {
        const [hStr, mStr] = norm.split(':');
        const h = parseInt(hStr, 10);
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        slotsMap.set(norm, { value: norm, label: `${hour12}:${mStr} ${ampm}` });
      }
    }

    return Array.from(slotsMap.values()).sort((a, b) => a.value.localeCompare(b.value));
  };

  const timeSlots = generateTimeSlots();

  const getGracePeriod = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10) + 10, 0);
    return `Until ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const selectedBizObj = verifiedBusinesses.find(b => b._id === selectedBusiness);
  const availableServices = selectedBizObj 
    ? (categoryServices[selectedBizObj.category] || categoryServices['Other'] || ['General Service']) 
    : [];

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <FiCalendar className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Appointments
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg">
              Manage your upcoming bookings and schedules.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <FiPlus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-10">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No upcoming appointments</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You don't have any appointments scheduled. Book one ahead of time to skip the line completely!
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold transition-transform hover:scale-105"
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map(apt => (
            <div key={apt._id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold mb-3 uppercase tracking-wider">
                    {apt.category}
                  </span>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
                    {apt.businessName}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  ['approved', 'checked_in', 'in_service'].includes(apt.status) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  apt.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  apt.status === 'suggested' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-400'
                }`}>
                  {apt.status === 'checked_in' ? 'Checked In' : apt.status === 'in_service' ? 'Now Serving' : apt.status}
                </span>
              </div>

              <div className="flex-1 space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                    <FiCalendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                    <p className="font-medium text-sm">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center shrink-0">
                    <FiClock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</p>
                    <p className="font-medium text-sm">{formatTime12Hour(apt.time)}</p>
                  </div>
                </div>

                {['approved', 'checked_in', 'in_service'].includes(apt.status) && (
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 mt-4 text-sm font-medium border border-gray-100 dark:border-slate-600 text-center">
                    <p className="text-gray-500 dark:text-gray-400">Token Number</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{apt.tokenNumber}</p>
                    <p className="text-xs text-gray-400 pt-2 border-t border-gray-200 dark:border-slate-600">
                      Booking ID: {apt.bookingId}
                    </p>
                  </div>
                )}
                
                {['approved', 'checked_in', 'in_service'].includes(apt.status) && apt.verificationCode && (
                  <div className="mt-4 flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                    <QRCodeSVG value={generateQRPayload(apt)} size={150} level="H" />
                    <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider">QR Status</p>
                    <p className={`text-sm font-bold mt-1 ${apt.status === 'approved' ? 'text-gray-500' : 'text-green-500'}`}>
                      {apt.status === 'approved' ? 'Not Checked In' : 'Checked In'}
                    </p>
                    <div className="w-full mt-4 flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                      <div className="text-center w-1/2 border-r border-gray-200 dark:border-slate-600">
                        <span className="block mb-1 uppercase tracking-wider text-[10px]">Arrive Before</span>
                        {getArriveBefore(apt.time)}
                      </div>
                      <div className="text-center w-1/2">
                        <span className="block mb-1 uppercase tracking-wider text-[10px]">Grace Period</span>
                        {getGracePeriod(apt.time)}
                      </div>
                    </div>
                  </div>
                )}

                {apt.status === 'suggested' && (
                  <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800 mt-4">
                    <div className="flex gap-3 mb-3 text-orange-600 dark:text-orange-400">
                      <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm mb-1">New Time Suggested</p>
                        <p className="text-sm">The business suggested <strong>{formatTime12Hour(apt.suggestedTime) || apt.suggestedTime || 'a new time slot'}</strong> instead of {formatTime12Hour(apt.time) || apt.time}.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptSuggestion(apt._id)}
                        className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition"
                      >
                        Accept {apt.suggestedTime ? (formatTime12Hour(apt.suggestedTime) || apt.suggestedTime) : 'Suggestion'}
                      </button>
                    </div>
                  </div>
                )}

                {apt.status === 'rejected' && (
                  <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800 mt-4">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Reason for Rejection:</p>
                    <p className="text-sm text-red-500 dark:text-red-300 italic">{apt.rejectionReason || 'No reason provided'}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">ID: {apt._id.substring(0, 8)}</span>
                {['pending', 'suggested', 'approved'].includes(apt.status) && (
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, type: 'cancel', appointment: apt, isProcessing: false })}
                    className="px-3.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200/80 dark:border-red-900/60 rounded-xl transition-all shadow-sm hover:shadow"
                  >
                    Cancel
                  </button>
                )}
                {['cancelled', 'rejected', 'completed', 'no_show'].includes(apt.status) && (
                  <button 
                    onClick={() => setConfirmModal({ isOpen: true, type: 'delete', appointment: apt, isProcessing: false })}
                    className="px-3.5 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/60 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900/60 rounded-xl transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Book Appointment</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-5 overflow-y-auto">
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Location</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedBusiness('');
                      setSelectedService('');
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    placeholder="Type to search location..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-10"
                  />
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                {showLocationDropdown && (
                  <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/5">
                    {['All Locations', ...uniqueCities].filter(c => c.toLowerCase().includes(((selectedCity || '') === 'All Locations' ? '' : (selectedCity || '')).toLowerCase())).map((city, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          setSelectedCity(city);
                          setSelectedBusiness('');
                          setSelectedService('');
                          setShowLocationDropdown(false);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                    {['All Locations', ...uniqueCities].filter(c => c.toLowerCase().includes(((selectedCity || '') === 'All Locations' ? '' : (selectedCity || '')).toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No locations found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Business</label>
                <select 
                  value={selectedBusiness}
                  onChange={(e) => {
                    setSelectedBusiness(e.target.value);
                    setSelectedService('');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                >
                  <option value="" disabled>Choose a business...</option>
                  {filteredBusinesses.map(biz => (
                    <option key={biz._id} value={biz._id}>{biz.name} ({biz.category})</option>
                  ))}
                </select>
              </div>

              {selectedBusiness && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Service</label>
                  <select 
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  >
                    <option value="" disabled>Choose a service...</option>
                    {availableServices.map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Custom Time</label>
                    <TimeInput
                      value={selectedTime}
                      onChange={(val) => {
                        setSelectedTime(val);
                        if (val && isTimeBooked(val, bookedTimes)) {
                          toast.error(`${formatTime12Hour(val)} is already appointed. Choose another time.`, { icon: '🚫', duration: 2500 });
                        }
                      }}
                      className={`w-full bg-gray-50 dark:bg-slate-900/50 ${isTimeBooked(selectedTime, bookedTimes) ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                    />
                  </div>
                </div>

                {/* Available & Appointed Time Slots Grid */}
                {selectedDate && (
                  <div className="mt-4 p-4 bg-gray-50/80 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                        <FiClock className="w-3.5 h-3.5 text-blue-500" />
                        <span>Available & Appointed Time Slots</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Available
                        </span>
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Appointed
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => {
                        const isAppointed = isTimeBooked(slot.value, bookedTimes);
                        const isSelected = selectedTime && normalizeTo24Hour(selectedTime) === normalizeTo24Hour(slot.value);
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            disabled={isAppointed}
                            onClick={() => {
                              if (isAppointed) {
                                toast.error(`${slot.label} is already appointed. Please choose another time.`, { icon: '🚫', duration: 2500 });
                                return;
                              }
                              setSelectedTime(slot.value);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border transition-all ${
                              isAppointed 
                                ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 cursor-not-allowed opacity-80 select-none' 
                                : isSelected 
                                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/40 scale-[1.02]' 
                                  : 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/60 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                            }`}
                          >
                            <span className="font-semibold">{slot.label}</span>
                            {isAppointed ? (
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">🔒 Booked</span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">Selected</span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Slot Status Message */}
                    {selectedTime && (
                      <div className="pt-2">
                        {isTimeBooked(selectedTime, bookedTimes) ? (
                          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 animate-shake">
                            <FiAlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                            <span>This time ({formatTime12Hour(selectedTime)}) was already appointed by another customer. Please choose an available time.</span>
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                            <span>Available: {formatTime12Hour(selectedTime)} is open and ready to book!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={apptContact}
                    onChange={(e) => setApptContact(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={apptAddress}
                    onChange={(e) => setApptAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Personal Details / Notes</label>
                  <textarea
                    required
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    rows="2"
                    placeholder="Provide your personal details, purpose of visit..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl space-y-4">
                <h3 className="font-bold text-blue-800 dark:text-blue-400">Verification Required</h3>
                <p className="text-sm text-blue-600 dark:text-blue-500 mb-2">Please provide ID verification to book your appointment.</p>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select ID Type *</label>
                  <select 
                    required
                    value={apptIdType}
                    onChange={(e) => setApptIdType(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  >
                    <option value="" disabled>Select Document</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Employee ID">Employee ID</option>
                    <option value="Student ID">Student ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{apptIdType ? `${apptIdType} Front Image *` : 'Front Image *'}</label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => handleImageUpload(e, setApptFrontImage)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-white"
                    />
                    {apptFrontImage && <img src={apptFrontImage} alt="Front preview" className="mt-2 h-20 w-auto object-contain rounded-lg border border-blue-200" />}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{apptIdType ? `${apptIdType} Back Image (Optional)` : 'Back Image (Optional)'}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setApptBackImage)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-white"
                    />
                    {apptBackImage && <img src={apptBackImage} alt="Back preview" className="mt-2 h-20 w-auto object-contain rounded-lg border border-blue-200" />}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!selectedTime || isTimeBooked(selectedTime, bookedTimes)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-md mt-6 ${
                  isTimeBooked(selectedTime, bookedTimes)
                    ? 'bg-red-500 text-white cursor-not-allowed opacity-90'
                    : !selectedTime
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)]'
                }`}
              >
                {isTimeBooked(selectedTime, bookedTimes) ? (
                  <>
                    <FiAlertCircle className="w-5 h-5" /> Time Appointed — Choose Another Slot
                  </>
                ) : !selectedTime ? (
                  <>
                    <FiClock className="w-5 h-5" /> Select Appointment Time
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5" /> Send Request for {formatTime12Hour(selectedTime)} (Real-Time)
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Neat Confirmation Modal for Cancel & Delete */}
      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.appointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-700/80 text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

              {/* Close Button */}
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, appointment: null, isProcessing: false })}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto ring-8 ring-red-50/60 dark:ring-red-950/20 mb-4 mt-2">
                {confirmModal.type === 'cancel' ? (
                  <FiAlertCircle className="w-8 h-8" />
                ) : (
                  <FiTrash2 className="w-8 h-8" />
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {confirmModal.type === 'cancel' ? 'Cancel Appointment?' : 'Delete Appointment Record?'}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {confirmModal.type === 'cancel'
                  ? 'Are you sure you want to cancel this scheduled booking? The reserved time slot will become available for others.'
                  : 'Are you sure you want to permanently remove this appointment from your booking history?'}
              </p>

              {/* Appointment Summary Box */}
              <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/60 text-left space-y-2.5 my-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Business</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                    {confirmModal.appointment.businessName || 'Service Provider'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Service</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {confirmModal.appointment.service || 'General Appointment'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Date & Time</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {new Date(confirmModal.appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime12Hour(confirmModal.appointment.time) || confirmModal.appointment.time}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={confirmModal.isProcessing}
                  onClick={() => setConfirmModal({ isOpen: false, type: null, appointment: null, isProcessing: false })}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-sm transition-all"
                >
                  No, Keep It
                </button>
                <button
                  type="button"
                  disabled={confirmModal.isProcessing}
                  onClick={executeConfirmAction}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {confirmModal.isProcessing ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : confirmModal.type === 'cancel' ? (
                    'Yes, Cancel'
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CustomerAppointments;
