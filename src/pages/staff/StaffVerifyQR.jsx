import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiX, FiPlay, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StaffVerifyQR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const aptId = searchParams.get('aptId');
  const code = searchParams.get('code');
  const bizId = searchParams.get('bizId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannedCustomer, setScannedCustomer] = useState(null);
  const [selectedCounter, setSelectedCounter] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');

  useEffect(() => {
    if (!currentStaff._id) {
      // Must be logged in as staff
      toast.error('Please login as staff to verify QR codes');
      navigate('/staff/login');
      return;
    }

    if (currentStaff.businessId !== bizId) {
      setError('This QR code belongs to a different business.');
      setLoading(false);
      return;
    }

    verifyQRCode();
  }, []);

  const verifyQRCode = async () => {
    try {
      const response = await fetch(`${API_URL}/staff/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: aptId,
          verificationCode: code,
          businessId: currentStaff.businessId
        })
      });
      if (response.ok) {
        const apt = await response.json();
        setScannedCustomer(apt);
      } else {
        const err = await response.json();
        setError(err.message || 'Verification failed. This QR code might be invalid or already checked in.');
      }
    } catch (err) {
      setError('Server error during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCounter = async () => {
    if (!selectedCounter) return toast.error('Select a counter');
    try {
      const response = await fetch(`${API_URL}/staff/assign-counter`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: scannedCustomer._id,
          counterNumber: selectedCounter,
          businessId: currentStaff.businessId
        })
      });
      if (response.ok) {
        toast.success(`Assigned to ${selectedCounter}`);
        navigate('/staff/dashboard');
      } else {
        toast.error('Failed to assign counter');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
        
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <FiLoader className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="font-bold text-gray-500">Verifying QR Code...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Scan Failed</h2>
            <p className="text-center text-gray-500 mb-8">{error}</p>
            <button 
              onClick={() => navigate('/staff/dashboard')}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {!loading && scannedCustomer && (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-green-50 dark:bg-green-900/20">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                <FiCheckCircle className="w-6 h-6" /> Verified Successfully
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Customer Name</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{scannedCustomer.customerId?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-400 mt-1">{scannedCustomer.customerId?.phone}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Token Number</p>
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{scannedCustomer.tokenNumber}</p>
                <p className="text-sm font-bold text-gray-400 mt-3 border-t border-gray-200 dark:border-slate-700 pt-3">
                  Service: {scannedCustomer.service || 'General Service'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Assign to Counter</label>
                <select 
                  value={selectedCounter} 
                  onChange={e => setSelectedCounter(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none dark:text-white font-bold"
                >
                  <option value="" disabled>Select a counter...</option>
                  <option value="1">Counter 1</option>
                  <option value="2">Counter 2</option>
                  <option value="3">Counter 3</option>
                  <option value="4">Counter 4</option>
                  <option value="5">Counter 5</option>
                </select>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleAssignCounter}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all flex items-center justify-center gap-2"
                >
                  <FiPlay className="w-5 h-5" /> Start Service
                </button>
                <button 
                  onClick={() => navigate('/staff/dashboard')}
                  className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffVerifyQR;
