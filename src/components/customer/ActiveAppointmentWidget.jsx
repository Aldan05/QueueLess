import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiNavigation, FiX } from 'react-icons/fi';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import QRCodeDisplay from '../common/QRCodeDisplay';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ActiveAppointmentWidget = () => {
  const { businesses } = useDatabase();
  const { currentUser } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUpcomingAppointment = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_URL}/customer/appointments/${currentUser._id}`);
      if (response.ok) {
        const data = await response.json();
        const upcoming = data.find(apt => apt.status === 'scheduled');
        setAppointment(upcoming || null);
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingAppointment();
  }, [currentUser]);

  const cancelAppointment = async () => {
    if (!appointment) return;
    try {
      const response = await fetch(`${API_URL}/customer/appointments/${appointment._id}/cancel`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setAppointment(null);
        toast.success('Appointment cancelled');
      } else {
        toast.error('Failed to cancel appointment');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  if (loading || !appointment) return null;

  const business = businesses.find(b => b._id === appointment.businessId);
  if (!business) return null;

  const aptDate = new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-100/80 overflow-hidden relative mb-8"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <FiCalendar className="w-32 h-32 -mt-10 -mr-10 text-purple-600" />
      </div>

      <div className="p-6 sm:p-8 flex flex-row flex-wrap gap-8 items-center md:items-start justify-center md:justify-start relative z-10">
        
        {/* Token Circle */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-purple-500/30 border-4 border-white relative z-10">
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Appointment</span>
            <span className="text-3xl sm:text-4xl font-black">{appointment.time}</span>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100 z-20">
            {aptDate}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-[280px] text-center md:text-left">
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 animate-pulse"></span>
            Timing Ticket Booked
          </div>
          
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            {business.name}
          </h3>
          <p className="text-gray-500 font-medium text-sm mt-1 flex items-center justify-center md:justify-start">
            <FiMapPin className="mr-1.5 text-gray-400" />
            {business.address}
          </p>
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 mt-4">
            <span>Scheduled Date: {aptDate}</span>
            <span className="text-purple-600">Time: {appointment.time}</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex mb-6">
            <div className="h-full w-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"></div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto md:mx-0">
            <button className="flex items-center justify-center w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
              <FiNavigation className="mr-2" /> Get Directions
            </button>
            <button 
              onClick={cancelAppointment}
              className="flex items-center justify-center w-full py-3.5 px-4 bg-white hover:bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl transition-all hover:-translate-y-0.5"
            >
              <FiX className="mr-2" /> Cancel Booking
            </button>
          </div>
        </div>

        {/* QR Code Check-in */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end mt-4 lg:mt-0">
           <QRCodeDisplay 
             value={JSON.stringify({ appointmentId: appointment._id, businessId: business._id, time: appointment.time })} 
             title="Scan to Check-in" 
           />
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveAppointmentWidget;
