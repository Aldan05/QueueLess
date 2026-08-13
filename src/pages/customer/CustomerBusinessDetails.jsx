import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiClock, FiStar, FiCalendar, FiMessageSquare, FiMonitor, FiPlusCircle, FiX, FiCheckCircle, FiThumbsUp, FiShield, FiFilter, FiUser, FiCheck, FiLock, FiPause } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import TimeInput from '../../components/common/TimeInput';
import StarRating from '../../components/common/StarRating';

const categoryForms = {
  'Hospital': {
    label: 'Reason for Visit',
    placeholder: 'Select the reason for your hospital visit',
    options: ['General Consultation', 'Fever / Cold', 'Emergency Care', 'Specialist Consultation', 'Laboratory Test', 'Vaccination', 'Follow-up Visit', 'Health Check-up', 'Prescription Renewal', 'Other']
  },
  'Bank': {
    label: 'Banking Service Required',
    placeholder: 'Select the banking service you need',
    options: ['Open New Account', 'Cash Deposit', 'Cash Withdrawal', 'Loan Enquiry', 'Credit Card Services', 'Passbook Update', 'Cheque Deposit', 'KYC Update', 'Customer Support', 'Other']
  },
  'Salon': {
    label: 'Select Beauty Service',
    placeholder: 'Select the beauty service',
    options: ['Haircut', 'Hair Coloring', 'Facial', 'Shaving', 'Spa', 'Hair Wash', 'Beard Styling', 'Bridal Makeup', 'Other']
  },
  'Restaurant': {
    label: 'Dining Purpose',
    placeholder: 'Select your dining purpose',
    options: ['Table Reservation', 'Family Dining', 'Birthday Celebration', 'Business Meeting', 'Takeaway Pickup', 'Food Complaint', 'Other']
  },
  'Government Office': {
    label: 'Government Service',
    placeholder: 'Select the government service',
    options: ['Aadhaar Services', 'Passport Services', 'Driving License', 'Birth Certificate', 'Death Certificate', 'Income Certificate', 'Community Certificate', 'Property Registration', 'Other']
  },
  'Service Center': {
    label: 'Device / Service Required',
    placeholder: 'Select the service required',
    options: ['Mobile Repair', 'Laptop Repair', 'TV Repair', 'Washing Machine Repair', 'AC Service', 'Refrigerator Repair', 'Warranty Claim', 'Device Inspection', 'Software Update', 'Other']
  },
  'Vehicle Service Center': {
    label: 'Vehicle Service Type',
    placeholder: 'Select your vehicle service',
    options: ['General Service', 'Oil Change', 'Engine Repair', 'Brake Service', 'Battery Replacement', 'Wheel Alignment', 'Car Wash', 'Insurance Claim', 'Accident Repair', 'Other']
  },
  'Pharmacy': {
    label: 'Pharmacy Service',
    placeholder: 'Select the pharmacy service',
    options: ['Purchase Medicines', 'Prescription Verification', 'Health Consultation', 'Vaccination', 'Medicine Availability', 'Other']
  },
  'Educational Institution': {
    label: 'Purpose of Visit',
    placeholder: 'Select the purpose of your visit',
    options: ['Student Admission', 'Fee Payment', 'Certificate Collection', 'Principal Meeting', 'Parent Meeting', 'Exam Enquiry', 'Scholarship Enquiry', 'Other']
  },
  'Lawyer Office': {
    label: 'Legal Service Required',
    placeholder: 'Select the legal service required',
    options: ['Legal Consultation', 'Property Documents', 'Divorce Case', 'Civil Case', 'Criminal Case', 'Affidavit', 'Notary Service', 'Other']
  },
  'Clinic': {
    label: 'Consultation Type',
    placeholder: 'Select the consultation type',
    options: ['General Physician', 'Dentist', 'Pediatrician', 'Orthopedic', 'Eye Check-up', 'Skin Specialist', 'Other']
  }
};

const defaultForm = {
  label: 'Service Purpose',
  placeholder: 'Select the service purpose',
  options: ['General Service', 'Consultation', 'Support / Help', 'Purchase / Order', 'Other']
};

const getFormConfig = (category) => {
  if (!category) return defaultForm;
  const cat = category.toLowerCase();
  
  if (cat.includes('hospital') || cat.includes('health') || cat.includes('clinic') || cat.includes('medical') || cat.includes('care')) return categoryForms['Hospital'];
  if (cat.includes('bank') || cat.includes('finance')) return categoryForms['Bank'];
  if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa') || cat.includes('hair')) return categoryForms['Salon'];
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('dining')) return categoryForms['Restaurant'];
  if (cat.includes('gov') || cat.includes('public')) return categoryForms['Government Office'];
  if (cat.includes('vehicle') || cat.includes('auto') || cat.includes('car')) return categoryForms['Vehicle Service Center'];
  if (cat.includes('service center') || cat.includes('repair') || cat.includes('electronics')) return categoryForms['Service Center'];
  if (cat.includes('pharmacy') || cat.includes('medical store') || cat.includes('medicine')) return categoryForms['Pharmacy'];
  if (cat.includes('education') || cat.includes('school') || cat.includes('college') || cat.includes('university') || cat.includes('institute')) return categoryForms['Educational Institution'];
  if (cat.includes('law') || cat.includes('legal') || cat.includes('advocate') || cat.includes('attorney')) return categoryForms['Lawyer Office'];
  
  // Exact match fallback
  for (const [key, value] of Object.entries(categoryForms)) {
    if (key.toLowerCase() === cat) return value;
  }
  
  return defaultForm;
};

const CustomerBusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businesses, joinQueue, socket } = useDatabase();
  const { currentUser } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [counters, setCounters] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [apptContact, setApptContact] = useState(currentUser?.phone || '');
  const [apptAddress, setApptAddress] = useState('');
  const [apptServiceProposal, setApptServiceProposal] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Join Queue Modal State
  const location = useLocation();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(location.search.includes('join=true'));
  
  useEffect(() => {
    if (location.search.includes('join=true')) {
      navigate(`/customer/business/${id}`, { replace: true });
    }
  }, [location, navigate, id]);
  const [joinPurpose, setJoinPurpose] = useState('');
  const [joinPartySize, setJoinPartySize] = useState(1);
  const [joinContact, setJoinContact] = useState(currentUser?.phone || '');
  const [joinAddress, setJoinAddress] = useState('');
  const [joinServiceProposal, setJoinServiceProposal] = useState('');
  const [joinDetails, setJoinDetails] = useState('');
  const [joinIdType, setJoinIdType] = useState('');
  const [joinFrontImage, setJoinFrontImage] = useState(null); // base64
  const [joinBackImage, setJoinBackImage] = useState(null); // base64
  const [isJoining, setIsJoining] = useState(false);
  const [apptIdType, setApptIdType] = useState('');
  const [apptFrontImage, setApptFrontImage] = useState(null);
  const [apptBackImage, setApptBackImage] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [waitTimeRating, setWaitTimeRating] = useState(5);
  const [staffBehaviourRating, setStaffBehaviourRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [starFilter, setStarFilter] = useState('All');
  const [helpfulLoadingId, setHelpfulLoadingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const formConfig = business ? getFormConfig(business.category) : defaultForm;

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const found = businesses.find(b => b._id === id);
      if (found) {
        setBusiness(found);
      }
    }
  }, [businesses, id]);

  const fetchBookedSlots = useCallback(async () => {
    if (!date || !id) return;
    try {
      const response = await fetch(`${API_URL}/customer/appointments/booked/${id}?date=${date}`);
      if (response.ok) {
        setBookedSlots(await response.json());
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  }, [date, id, API_URL]);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/customer/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (data && data.reviews) {
          setReviews(data.reviews);
          if (data.summary) {
            setReviewSummary(data.summary);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id, API_URL]);

  useEffect(() => {
    if (id) {
      fetchReviews();

      // Fetch Counters
      fetch(`${API_URL}/counters/business/${id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setCounters(data))
        .catch(console.error);
    }
  }, [id, API_URL, fetchReviews]);

  useEffect(() => {
    if (!socket || !id) return;
    const handleReviewAdded = (data) => {
      if (data.business?._id === id || data.review?.businessId === id) {
        fetchReviews();
        if (data.business) setBusiness(data.business);
      }
    };
    const handleReviewUpdated = (data) => {
      if (data.review) {
        setReviews(prev => prev.map(r => r._id === data.review._id ? data.review : r));
      }
    };
    socket.on('reviewAdded', handleReviewAdded);
    socket.on('reviewUpdated', handleReviewUpdated);
    return () => {
      socket.off('reviewAdded', handleReviewAdded);
      socket.off('reviewUpdated', handleReviewUpdated);
    };
  }, [socket, id, fetchReviews]);

  useEffect(() => {
    if (socket && id) {
      // Temporarily join room to get live updates while viewing page
      socket.emit('joinBusinessRoom', id);
      
      const handleCounterUpdate = (updatedCounter) => {
        setCounters(prev => prev.map(c => c._id === updatedCounter._id ? updatedCounter : c));
      };
      
      const handleAppointmentUpdate = () => {
        fetchBookedSlots(); // Refresh booked slots when someone else books
      };
      
      socket.on('counterUpdated', handleCounterUpdate);
      socket.on('appointmentUpdated', handleAppointmentUpdate);
      
      return () => {
        socket.off('counterUpdated', handleCounterUpdate);
        socket.off('appointmentUpdated', handleAppointmentUpdate);
        // Only leave if not actively in queue? Simplified: just leave, joinQueue handles re-joining
        socket.emit('leaveBusinessRoom', id);
      };
    }
  }, [socket, id, fetchBookedSlots]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in to book appointments');
      return;
    }
    if (!date || !time) {
      toast.error('Please select both date and time');
      return;
    }
    if (bookedSlots.includes(time)) {
      toast.error('This time slot is already booked. Please choose another time.');
      return;
    }

    if (!apptIdType || !apptFrontImage) {
      toast.error("Please provide all required verification details and document image.");
      return;
    }

    setIsBooking(true);
    try {
      const combinedNotes = `Contact: ${apptContact} | Address: ${apptAddress} | Proposal: ${apptServiceProposal} | Details: ${notes}`;
      const verificationData = [{
        type: apptIdType,
        frontImage: apptFrontImage,
        backImage: apptBackImage
      }];

      const res = await fetch(`${API_URL}/customer/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business._id,
          customerId: currentUser._id,
          date,
          time,
          service: apptServiceProposal,
          notes: combinedNotes,
          documents: verificationData
        })
      });
      
      if (res.ok) {
        toast.success('Appointment booked successfully!');
        setDate('');
        setTime('');
        setNotes('');
        navigate('/customer/appointments');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to book appointment');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

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

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      const combinedNotes = `Contact: ${joinContact} | Address: ${joinAddress} | Proposal: ${joinServiceProposal} | Details: ${joinDetails}`;
      let verificationData = null;
      
      if (!joinIdType || !joinFrontImage) {
        toast.error("Please provide all required verification details and document image.");
        setIsJoining(false);
        return;
      }
      
      verificationData = {
        customerPhone: joinContact,
        idNumber: "N/A",
        documents: [{
          type: joinIdType,
          frontImage: joinFrontImage,
          backImage: joinBackImage
        }]
      };

      await joinQueue(business._id, joinPartySize, joinPurpose, combinedNotes, verificationData);
      
      if (socket) {
        setIsJoinModalOpen(false);
        navigate('/customer/queue');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!currentUser) {
      toast.error('Please log in to vote on reviews');
      return;
    }
    setHelpfulLoadingId(reviewId);
    try {
      const res = await fetch(`${API_URL}/customer/reviews/${reviewId}/helpful`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(r => r._id === reviewId ? data.review : r));
        toast.success(data.voted ? 'Marked as helpful 👍' : 'Removed helpful vote');
      } else {
        toast.error('Failed to update vote');
      }
    } catch {
      toast.error('Server error updating vote');
    } finally {
      setHelpfulLoadingId(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in to submit a review');
      return;
    }
    if (!feedback.trim()) {
      toast.error('Please enter your feedback description');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/customer/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business._id,
          customerId: currentUser._id,
          rating,
          waitTimeRating,
          staffBehaviourRating,
          feedback
        })
      });
      
      if (res.ok) {
        toast.success('Thank you! Your review has been submitted ⭐', { icon: '🎉' });
        const data = await res.json();
        if (data.review) {
          setReviews(prev => [data.review, ...prev.filter(r => r._id !== data.review._id)]);
        }
        if (data.summary) {
          setReviewSummary(data.summary);
        }
        if (data.business) {
          setBusiness(data.business);
        }
        setFeedback('');
        setRating(5);
        setWaitTimeRating(5);
        setStaffBehaviourRating(5);
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 9;
    let currentMinute = 0;
    while (currentHour < 18) { // 9 AM to 6 PM
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute === 0 ? '00' : '30'}`;
      slots.push(timeString);
      currentMinute += 30;
      if (currentMinute === 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    return slots;
  };
  const availableSlots = generateTimeSlots();

  if (!business) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading business details...
      </div>
    );
  }

  // Strictly calculate live average rating out of 5.0
  const liveTotalReviews = reviews.length > 0 ? reviews.length : (Number(reviewSummary?.totalReviews) || Number(business.reviewCount) || 0);
  
  let rawAvg = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (Math.min(5, Math.max(1, Number(r.rating) || 5))), 0);
    rawAvg = sum / reviews.length;
  } else if (reviewSummary?.averageRating && Number(reviewSummary.averageRating) <= 5) {
    rawAvg = Number(reviewSummary.averageRating);
  } else if (business.rating && Number(business.rating) <= 5) {
    rawAvg = Number(business.rating);
  }
  const liveAverageRating = Math.min(5, Math.max(0, Number(rawAvg) || 0));

  return (
    <div className="space-y-8 pb-10 animate-fadeIn text-gray-900 dark:text-gray-100 max-w-4xl mx-auto">
      
      {/* Header with Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
      >
        <FiArrowLeft className="mr-2 w-4 h-4" /> Back to Search
      </button>

      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100/80 dark:border-slate-700 overflow-hidden">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-lg border-4 border-white dark:border-slate-800 overflow-hidden">
              {(() => {
                const logoObj = business.docLogo;
                const logoSrc = typeof logoObj === 'string' ? logoObj : (logoObj?.content || logoObj?.url);
                return logoSrc ? (
                  <img src={logoSrc} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  business.icon || '🏢'
                );
              })()}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {business.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-lg">
              {business.category}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 px-3.5 py-1.5 rounded-full">
                <StarRating 
                  rating={liveAverageRating} 
                  totalReviews={liveTotalReviews}
                  size="sm"
                />
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 max-w-full">
                <FiMapPin className="mr-1.5 shrink-0 text-gray-400" /> 
                <span className="truncate">
                  {business.address && business.city 
                    ? `${business.address}, ${business.city}`
                    : business.address || business.city || 'Location not specified'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3 w-full md:w-auto">
            {(() => {
              const currentQueueStatus = business.queueStatus || (business.queueActive !== false && business.queueActive !== 'false' ? 'open' : 'closed');
              if (currentQueueStatus === 'open') {
                return (
                  <button 
                    onClick={() => setIsJoinModalOpen(true)}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <FiPlusCircle /> Join Live Queue
                  </button>
                );
              } else if (currentQueueStatus === 'paused') {
                return (
                  <button 
                    onClick={() => toast('Queue is temporarily paused. Please check back shortly.', { icon: '⏸️' })}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold rounded-xl border border-amber-200 dark:border-amber-800/50 transition-all cursor-pointer"
                    title="Queue is temporarily paused"
                  >
                    <FiPause /> Queue Paused
                  </button>
                );
              } else {
                return (
                  <button 
                    onClick={() => toast.error(`${business.name} is currently closed. Queue joining is unavailable.`, { icon: '🔒' })}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200/70 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 font-bold rounded-xl cursor-not-allowed opacity-60 select-none border border-dashed border-gray-300 dark:border-slate-600 transition-all"
                    title="Business queue is currently closed"
                  >
                    <FiLock /> Closed
                  </button>
                );
              }
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info Column */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiClock className="text-blue-500" /> Current Status
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Queue Status</p>
                {(() => {
                  const currentQueueStatus = business.queueStatus || (business.queueActive !== false && business.queueActive !== 'false' ? 'open' : 'closed');
                  if (currentQueueStatus === 'open') {
                    return (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active / Open
                      </div>
                    );
                  } else if (currentQueueStatus === 'paused') {
                    return (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Queue Paused
                      </div>
                    );
                  } else {
                    return (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Closed
                      </div>
                    );
                  }
                })()}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Wait Time</p>
                <p className="font-bold text-gray-900 dark:text-white text-xl">~{business.waitTime || 0} mins</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">People Waiting</p>
                <p className="font-bold text-gray-900 dark:text-white text-xl">{business.waiting || 0}</p>
              </div>
            </div>
          </div>

          {/* Live Counters */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiMonitor className="text-blue-500" /> Live Counters
            </h3>
            {counters.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No counters set up yet.</p>
            ) : (
              <div className="space-y-3">
                {counters.map(counter => (
                  <div key={counter._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{counter.name}</span>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      counter.status === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                      counter.status === 'Break' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${counter.status === 'Open' ? 'bg-green-500' : counter.status === 'Break' ? 'bg-amber-500' : 'bg-gray-500'}`}></span>
                      {counter.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100/80 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 dark:bg-slate-700 rounded-full blur-3xl translate-y-[-50%] translate-x-[20%]"></div>
             
             <div className="relative z-10">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                 <FiCalendar className="text-indigo-500" /> Book an Appointment
               </h2>
               <p className="text-gray-500 dark:text-gray-400 mb-6">
                 Prefer to plan ahead? Pick a date to see available time tokens and secure your spot.
               </p>

               <form onSubmit={handleBookAppointment} className="space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
                   <input 
                     type="date" 
                     value={date}
                     onChange={(e) => {
                       setDate(e.target.value);
                       setTime('');
                     }}
                     required
                     min={new Date().toISOString().split('T')[0]}
                     className="w-full sm:max-w-xs px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium"
                   />
                 </div>
                 
                 {date && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Time</label>
                      <TimeInput
                        value={time}
                        onChange={(val) => setTime(val)}
                        className={`w-full sm:max-w-xs ${bookedSlots.includes(time) ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                      />
                      {bookedSlots.includes(time) && (
                        <p className="text-xs text-red-500 font-bold mt-2">❌ This time is already booked</p>
                      )}
                    </div>
                  )}

                 {time && (
                   <div className="animate-fadeIn mt-4 space-y-4">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                       <input
                         type="tel"
                         required
                         value={apptContact}
                         onChange={(e) => setApptContact(e.target.value)}
                         placeholder="Enter your mobile number"
                         className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium"
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
                         className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{formConfig.label}</label>
                       <select
                         required
                         value={apptServiceProposal}
                         onChange={(e) => setApptServiceProposal(e.target.value)}
                         className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium"
                       >
                         <option value="" disabled>{formConfig.placeholder}</option>
                         {formConfig.options.map((opt, i) => (
                           <option key={i} value={opt}>{opt}</option>
                         ))}
                       </select>
                     </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Personal Details / Notes</label>
                        <textarea
                          required
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="2"
                          placeholder="Provide your personal details, purpose of visit..."
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white font-medium resize-none"
                        ></textarea>
                      </div>

                      <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl space-y-4">
                        <h3 className="font-bold text-orange-800 dark:text-orange-400">Verification Required</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-500 mb-2">Please provide ID verification to book your appointment.</p>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select ID Type *</label>
                          <select 
                            required
                            value={apptIdType}
                            onChange={(e) => setApptIdType(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none dark:text-white"
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
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-white"
                            />
                            {apptFrontImage && <img src={apptFrontImage} alt="Front preview" className="mt-2 h-20 w-auto object-contain rounded-lg border" />}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{apptIdType ? `${apptIdType} Back Image (Optional)` : 'Back Image (Optional)'}</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, setApptBackImage)}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-white"
                            />
                            {apptBackImage && <img src={apptBackImage} alt="Back preview" className="mt-2 h-20 w-auto object-contain rounded-lg border" />}
                          </div>
                        </div>
                      </div>

                   </div>
                 )}
                 
                 <button 
                      type="submit"
                      disabled={!time || bookedSlots.includes(time)}
                      className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle className="w-5 h-5" /> Confirm Appointment Token
                    </button>
               </form>
             </div>
          </div>
        </div>

      </div>

      {/* Ratings and Feedback Section */}
      {(() => {
        const totalReviewsCount = liveTotalReviews;
        const avgRatingValue = liveAverageRating;
        
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (reviews.length > 0) {
          reviews.forEach(r => {
            const cleanRating = Math.min(5, Math.max(1, Number(r.rating) || 5));
            const star = Math.min(5, Math.max(1, Math.round(cleanRating)));
            starCounts[star] = (starCounts[star] || 0) + 1;
          });
        } else if (business.ratingDistribution && Object.values(business.ratingDistribution).some(v => v > 0)) {
          Object.keys(starCounts).forEach(star => {
            starCounts[star] = Number(business.ratingDistribution[star]) || 0;
          });
        } else if (reviewSummary?.ratingDistribution && Object.values(reviewSummary.ratingDistribution).some(v => v > 0)) {
          Object.keys(starCounts).forEach(star => {
            starCounts[star] = Number(reviewSummary.ratingDistribution[star]) || 0;
          });
        }

        const filteredReviews = reviews.filter(r => {
          if (starFilter === 'All') return true;
          return Math.round(Math.min(5, Math.max(1, Number(r.rating) || 5))) === Number(starFilter);
        });

        const ratingTiers = [
          { stars: 5, label: 'Excellent', count: starCounts[5], starVisual: '★★★★★' },
          { stars: 4, label: 'Good', count: starCounts[4], starVisual: '★★★★☆' },
          { stars: 3, label: 'Average', count: starCounts[3], starVisual: '★★★☆☆' },
          { stars: 2, label: 'Poor', count: starCounts[2], starVisual: '★★☆☆☆' },
          { stars: 1, label: 'Very Poor', count: starCounts[1], starVisual: '★☆☆☆☆' },
        ];

        return (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-100/80 dark:border-slate-700 p-6 sm:p-10 space-y-10">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700/80 pb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
                    <FiStar className="fill-amber-400 text-amber-400" />
                  </span>
                  Customer Reviews & Ratings
                </h2>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  Real feedback from verified visitors and queue members
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black uppercase tracking-wider border border-blue-200/50 dark:border-blue-900/30 flex items-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-blue-500" /> 100% Verified Reviews
                </span>
              </div>
            </div>

            {/* ⭐ Overall Rating & Rating Distribution Section (Matching User Spec) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800/80 dark:to-slate-900/80 p-6 sm:p-8 rounded-3xl border border-amber-100/80 dark:border-slate-700">
              
              {/* Left Box: Huge Score + Stars */}
              <div className="lg:col-span-5 flex flex-col justify-center items-center text-center p-4 border-b lg:border-b-0 lg:border-r border-amber-100/80 dark:border-slate-700">
                <p className="text-xs font-extrabold uppercase tracking-widest text-amber-800/80 dark:text-amber-400/80 mb-2">
                  Overall Rating
                </p>
                <div className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">
                  {avgRatingValue > 0 ? avgRatingValue.toFixed(1) : '0.0'}
                  <span className="text-2xl sm:text-3xl text-gray-400 dark:text-gray-500 font-bold ml-1">/ 5.0</span>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <StarRating rating={avgRatingValue} showScore={false} showCount={false} size="lg" />
                </div>

                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                  {totalReviewsCount === 0 ? 'No reviews submitted yet' : `Based on ${totalReviewsCount.toLocaleString()} ${totalReviewsCount === 1 ? 'Review' : 'Reviews'}`}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Real-time Sync</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Calculated Average</span>
                  </div>
                </div>
              </div>

              {/* Right Box: Rating Distribution Bars */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Rating Distribution
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {totalReviewsCount} Total
                  </span>
                </div>

                {ratingTiers.map((tier) => {
                  const percentage = totalReviewsCount > 0 ? Math.round((tier.count / totalReviewsCount) * 100) : 0;
                  const isSelected = starFilter === String(tier.stars);

                  return (
                    <div
                      key={tier.stars}
                      onClick={() => setStarFilter(isSelected ? 'All' : String(tier.stars))}
                      className={`flex items-center gap-3 group cursor-pointer p-2 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-amber-100/60 dark:bg-amber-950/40 ring-1 ring-amber-400' 
                          : 'hover:bg-white/80 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {/* Star visual & label */}
                      <div className="w-28 sm:w-32 flex items-center justify-between shrink-0">
                        <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 transition-colors">
                          {tier.label}
                        </span>
                        <span className="text-[11px] font-bold text-amber-500 tracking-tighter">
                          {tier.starVisual}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-1 h-3 bg-gray-200/80 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            tier.stars >= 4
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                              : tier.stars === 3
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-rose-400 to-rose-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Count & % */}
                      <div className="w-14 text-right shrink-0">
                        <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                          {tier.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leave a Review + Reviews Listing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Interactive Leave a Review Form */}
              <div className="lg:col-span-5 bg-gray-50 dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-700/80 h-fit space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <FiMessageSquare className="text-blue-500" /> Leave Your Feedback
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    Help other visitors by sharing your queue and service experience.
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Overall Star Rating */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Overall Rating *
                      </label>
                      <span className="text-xs font-bold text-amber-500">
                        {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent (5.0)' :
                         rating === 4 ? '⭐⭐⭐⭐☆ Good (4.0)' :
                         rating === 3 ? '⭐⭐⭐☆☆ Average (3.0)' :
                         rating === 2 ? '⭐⭐☆☆☆ Poor (2.0)' : '⭐☆☆☆☆ Very Poor (1.0)'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-2 shadow-inner">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHoveredOrActive = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                          >
                            <FaStar
                              className={`w-7 h-7 transition-colors ${
                                isHoveredOrActive
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                                  : 'text-gray-200 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-ratings: Waiting Time & Staff Behaviour */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-black uppercase text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-blue-500" /> Wait Time
                        </label>
                        <span className="text-[11px] font-bold text-amber-500">{waitTimeRating}★</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setWaitTimeRating(s)}
                            className="p-0.5 text-xs text-amber-400 hover:scale-110 cursor-pointer"
                          >
                            <FaStar className={`w-4 h-4 ${waitTimeRating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-black uppercase text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <FiUser className="w-3 h-3 text-indigo-500" /> Staff Help
                        </label>
                        <span className="text-[11px] font-bold text-amber-500">{staffBehaviourRating}★</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStaffBehaviourRating(s)}
                            className="p-0.5 text-xs text-amber-400 hover:scale-110 cursor-pointer"
                          >
                            <FaStar className={`w-4 h-4 ${staffBehaviourRating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Your Written Feedback *
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                      rows={4}
                      placeholder="Share details about the service speed, staff support, and overall satisfaction..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-medium text-sm resize-none shadow-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Review...
                      </>
                    ) : (
                      <>
                        <FiStar className="fill-current" /> Submit Verified Review
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Customer Reviews Feed */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Filter Tabs */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-black text-gray-400 uppercase mr-1 flex items-center gap-1">
                      <FiFilter className="w-3 h-3" /> Filter:
                    </span>
                    {['All', '5', '4', '3', '2', '1'].map((starOpt) => {
                      const isActive = starFilter === starOpt;
                      const count = starOpt === 'All' ? reviews.length : starCounts[starOpt] || 0;
                      return (
                        <button
                          key={starOpt}
                          type="button"
                          onClick={() => setStarFilter(starOpt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {starOpt === 'All' ? 'All' : `${starOpt} ★`} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredReviews.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 text-center">
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                        ⭐
                      </div>
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-base">No reviews in this category</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {reviews.length === 0 ? 'Be the first to submit a review for this business!' : 'Try selecting another star rating filter.'}
                      </p>
                    </div>
                  ) : (
                    filteredReviews.map((rev) => {
                      const customerName = rev.customerId?.name || 'Customer';
                      const initial = customerName.charAt(0).toUpperCase();
                      const isVotedHelpful = rev.helpfulUsers?.some(u => (u._id || u).toString() === currentUser?._id);

                      return (
                        <div
                          key={rev._id}
                          className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                          {/* Review Header: Avatar + Name + Verified Badge + Stars */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                                {initial}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-gray-900 dark:text-white text-sm">
                                    {customerName}
                                  </h4>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                                    <FiCheckCircle className="w-3 h-3 text-emerald-500" /> Verified Customer
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                                  {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            {/* Stars badge */}
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                              <StarRating rating={rev.rating} showScore={true} showCount={false} size="xs" />
                            </div>
                          </div>

                          {/* Sub-ratings Pills (if recorded) */}
                          {(rev.waitTimeRating || rev.staffBehaviourRating) && (
                            <div className="flex items-center gap-2 mb-3">
                              {rev.waitTimeRating && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                                  ⏱️ Wait: {rev.waitTimeRating}/5
                                </span>
                              )}
                              {rev.staffBehaviourRating && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                                  👥 Staff: {rev.staffBehaviourRating}/5
                                </span>
                              )}
                            </div>
                          )}

                          {/* Review Body (Feedback quote) */}
                          <p className="text-gray-700 dark:text-gray-200 text-sm font-medium leading-relaxed bg-gray-50/50 dark:bg-slate-900/30 p-3.5 rounded-2xl border border-gray-100/80 dark:border-slate-800/80">
                            "{rev.feedback}"
                          </p>

                          {/* Footer: Helpful Vote */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                            <button
                              type="button"
                              onClick={() => handleToggleHelpful(rev._id)}
                              disabled={helpfulLoadingId === rev._id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isVotedHelpful
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 ring-1 ring-blue-400/40'
                                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <FiThumbsUp className={`w-3.5 h-3.5 ${isVotedHelpful ? 'fill-current text-blue-600' : ''}`} />
                              <span>Helpful</span>
                              <span className="ml-0.5 px-1.5 py-0.2 bg-white dark:bg-slate-800 rounded-full text-[10px] font-extrabold shadow-xs">
                                {rev.helpfulCount || rev.helpfulUsers?.length || 0}
                              </span>
                            </button>

                            <span className="text-[11px] font-semibold text-gray-400">
                              QueueLess Verified Visit
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Join Queue Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50 dark:bg-slate-800/50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Join Queue</h2>
                  <p className="text-sm text-gray-500">Provide details for {business.name}</p>
                </div>
                <button onClick={() => setIsJoinModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <FiX />
                </button>
              </div>
              
              <form onSubmit={handleJoinQueue} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{formConfig.label}</label>
                  <select 
                    required
                    value={joinPurpose}
                    onChange={(e) => setJoinPurpose(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  >
                    <option value="" disabled>{formConfig.placeholder}</option>
                    {formConfig.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Party Size</label>
                  <input 
                    type="number" 
                    min="1" max="10"
                    value={joinPartySize}
                    onChange={(e) => setJoinPartySize(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={joinContact}
                    onChange={(e) => setJoinContact(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={joinAddress}
                    onChange={(e) => setJoinAddress(e.target.value)}
                    placeholder="Enter your complete address"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service Proposal</label>
                  <input
                    type="text"
                    required
                    value={joinServiceProposal}
                    onChange={(e) => setJoinServiceProposal(e.target.value)}
                    placeholder="Briefly state your service proposal"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Personal Details / Reason</label>
                  <textarea
                    required
                    value={joinDetails}
                    onChange={(e) => setJoinDetails(e.target.value)}
                    rows="3"
                    placeholder="Enter your personal details and reason for joining..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-blue-500 outline-none dark:text-white resize-none"
                  ></textarea>
                </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl space-y-4">
                    <h3 className="font-bold text-orange-800 dark:text-orange-400">Verification Required</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-500 mb-2">This business requires ID verification before you can join the queue.</p>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select ID Type *</label>
                      <select 
                        required
                        value={joinIdType}
                        onChange={(e) => setJoinIdType(e.target.value)}
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
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{joinIdType ? `${joinIdType} Front Image *` : 'Front Image *'}</label>
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => handleImageUpload(e, setJoinFrontImage)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-white"
                        />
                        {joinFrontImage && <img src={joinFrontImage} alt="Front preview" className="mt-2 h-20 w-auto object-contain rounded-lg border" />}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{joinIdType ? `${joinIdType} Back Image (Optional)` : 'Back Image (Optional)'}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setJoinBackImage)}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-white"
                        />
                        {joinBackImage && <img src={joinBackImage} alt="Back preview" className="mt-2 h-20 w-auto object-contain rounded-lg border" />}
                      </div>
                    </div>
                  </div>
                
                <button 
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] transition-all disabled:opacity-50 mt-4"
                >
                  {isJoining ? 'Joining...' : 'Join Queue Now'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CustomerBusinessDetails;
