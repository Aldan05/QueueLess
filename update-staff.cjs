const fs = require('fs');

const content = fs.readFileSync('src/pages/business/BusinessQueue.jsx', 'utf-8');

// Extract modal
const modalMatch = content.match(/const CustomerDetailsModal = [\s\S]*?^\};\n\n/m);
const modalCode = modalMatch ? modalMatch[0] : '';

// Extract render logic
const renderMatch = content.match(/  return \(\n    <div className=\"space-y-8 pb-10\">[\s\S]*?\n  \);\n\};\n\nexport default BusinessQueue;/m);
let renderCode = renderMatch ? renderMatch[0] : '';
renderCode = renderCode.replace('export default BusinessQueue;', 'export default StaffQueue;');
renderCode = renderCode.replace(/business\./g, 'businessData.').replace(/business\?/g, 'businessData?');

const staffQueuePrelude = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiClock, FiAlertCircle, FiCheckCircle, FiPlay, FiPause, FiSkipForward, FiRefreshCw, FiShield, FiXCircle, FiPhone, FiFileText, FiX, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

`;

const staffQueueLogic = `
const StaffQueue = () => {
  const currentStaff = JSON.parse(localStorage.getItem('currentStaff') || '{}');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  const [businessData, setBusinessData] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchBusiness();
    
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('joinBusinessRoom', currentStaff.businessId);
    });

    newSocket.on('queueUpdated', (data) => {
      if (data.business) setBusinessData(data.business);
      fetchActiveQueue();
    });

    return () => newSocket.disconnect();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await fetch(\`\${API_URL}/businesses\`);
      const allBusinesses = await response.json();
      const myBusiness = allBusinesses.find(b => b._id === currentStaff.businessId);
      setBusinessData(myBusiness);
      fetchActiveQueue();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActiveQueue = async () => {
    if (!currentStaff.businessId) return;
    try {
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/active\`);
      if (response.ok) {
        const data = await response.json();
        const waitingOnly = data.filter(q => q.status === 'waiting');
        const pendingOnly = data.filter(q => q.status === 'pending_verification');
        setActiveQueue(waitingOnly);
        setPendingQueue(pendingOnly);
      }
    } catch (error) {
      console.error('Failed to fetch active queue', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQueue = async () => {
    if (!businessData) return;
    try {
      setIsProcessing(true);
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/toggle\`, { method: 'PATCH' });
      if (response.ok) {
        toast.success(businessData.queueActive ? 'Queue paused' : 'Queue is now open!');
        fetchBusiness();
      } else toast.error('Failed to toggle queue');
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const callNextPerson = async () => {
    if (!businessData) return;
    try {
      setIsProcessing(true);
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/next\`, { method: 'PATCH' });
      if (response.ok) {
        toast.success('Next customer called!');
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to call next person');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleSkip = async () => {
    if (!businessData || !businessData.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/skip\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(\`Skipped token \${businessData.currentToken}\`);
        fetchActiveQueue();
        fetchBusiness();
      } else toast.error('Failed to skip token');
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleComplete = async () => {
    if (!businessData || !businessData.currentToken || businessData.currentToken === '-') return toast.error('No customer currently being served');
    try {
      setIsProcessing(true);
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/complete\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: businessData.currentToken, staffId: currentStaff._id })
      });
      if (response.ok) {
        toast.success(\`Completed token \${businessData.currentToken}\`);
        fetchActiveQueue();
        fetchBusiness();
      } else toast.error('Failed to complete token');
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRecall = async () => {
    if (!businessData) return;
    try {
      setIsProcessing(true);
      const response = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/recall-last-missed\`, { method: 'PATCH' });
      if (response.ok) {
        const data = await response.json();
        toast.success(\`Recalled token \${data.token}\`);
        fetchActiveQueue();
        fetchBusiness();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to recall token');
      }
    } catch (error) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleApproveVerification = async (queueId) => {
    try {
      setIsProcessing(true);
      const res = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/\${queueId}/verify/approve\`, { method: 'PATCH' });
      if (res.ok) { 
        toast.success('Approved customer and added to queue!'); 
        fetchActiveQueue(); 
        fetchBusiness(); 
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Error approving'); 
      }
    } catch (e) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  const handleRejectVerification = async (queueId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      setIsProcessing(true);
      const res = await fetch(\`\${API_URL}/businesses/\${currentStaff.businessId}/queue/\${queueId}/verify/reject\`, { 
        method: 'PATCH', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ reason: reason || 'Documents did not match requirements.' }) 
      });
      if (res.ok) { 
        toast.success('Verification rejected.'); 
        fetchActiveQueue(); 
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Error rejecting'); 
      }
    } catch (e) { toast.error('Server error'); } finally { setIsProcessing(false); }
  };

  if (!businessData) return <div className="text-center py-20 text-gray-400">Loading business data...</div>;

  const requiresVerification = businessData?.verificationSettings?.requireVerification || pendingQueue.length > 0;

`;

const finalContent = staffQueuePrelude + modalCode + staffQueueLogic + renderCode;
fs.writeFileSync('src/pages/staff/StaffQueue.jsx', finalContent, 'utf-8');
console.log('Done!');
