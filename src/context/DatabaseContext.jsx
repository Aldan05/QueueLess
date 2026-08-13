import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const DatabaseContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Connect to the base URL of the API for socket.io
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const DatabaseProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeCustomerQueue, setActiveCustomerQueue] = useState(null);
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  // Resolve storage key dynamically based on current user
  const getStorageKey = useCallback(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    const staffData = localStorage.getItem('currentStaff');
    const staff = staffData ? JSON.parse(staffData) : null;
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    const role = staff ? 'staff' : currentUser?.role ? String(currentUser.role).toLowerCase() : 'guest';
    const userId = staff ? staff._id : currentUser?._id || 'guest';
    
    if (role === 'business') {
      const bizId = currentUser?.businessId?._id || currentUser?.businessId || 'guest';
      return `queueless_biz_notif_${bizId}`;
    }
    return `queueless_notif_${role}_${userId}`;
  }, []);

  const addLiveNotification = useCallback((type, message, icon) => {
    const key = getStorageKey();
    if (key.includes('_guest')) return;

    setLiveNotifications(prev => {
      // Deduplicate: skip if same message in last 2 seconds
      if (prev.length > 0 && prev[0].message === message && (Date.now() - new Date(prev[0].time).getTime()) < 2000) {
        return prev;
      }
      
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        message,
        icon,
        time: new Date().toISOString(),
        read: false
      };
      
      const updated = [newItem, ...prev].slice(0, 50);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {}
      
      // Dispatch DOM event for any other listeners
      window.dispatchEvent(new CustomEvent('liveNotificationReceived', { detail: newItem }));
      return updated;
    });
  }, [getStorageKey]);

  const getUserRoleAndId = useCallback(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    const staffData = localStorage.getItem('currentStaff');
    const staff = staffData ? JSON.parse(staffData) : null;
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
    const role = staff ? 'staff' : currentUser?.role ? String(currentUser.role).toLowerCase() : 'guest';
    let id = staff ? (staff.businessId?._id || staff.businessId || staff._id) : currentUser?._id || 'guest';
    if (role === 'business') {
      id = currentUser?.businessId?._id || currentUser?.businessId || currentUser?._id || 'guest';
    }
    return { role, id };
  }, []);

  const reloadNotifications = useCallback(async () => {
    const { role, id } = getUserRoleAndId();
    if (role === 'guest' || !id || id === 'guest') {
      setLiveNotifications([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/notifications/${role}/${id}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(n => ({
          id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          time: n.createdAt,
          read: n.isRead
        }));
        setLiveNotifications(mapped);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  }, [getUserRoleAndId]);

  const markLiveNotificationsRead = useCallback(async () => {
    const { role, id } = getUserRoleAndId();
    if (role === 'guest') return;
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverRole: role, receiverId: id })
      });
      setLiveNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  }, [getUserRoleAndId]);

  const clearLiveNotifications = useCallback(async () => {
    const { role, id } = getUserRoleAndId();
    if (role === 'guest') return;
    try {
      await fetch(`${API_URL}/notifications/clear`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverRole: role, receiverId: id })
      });
      setLiveNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [getUserRoleAndId]);

  const deleteSingleNotification = useCallback(async (notifId) => {
    try {
      await fetch(`${API_URL}/notifications/${notifId}`, {
        method: 'DELETE'
      });
      setLiveNotifications(prev => prev.filter(n => n.id !== notifId));
      toast.success('Notification removed');
    } catch (err) {
      console.error('Error deleting single notification:', err);
    }
  }, []);

  // Handle auto-import of useCallback from react if not already present

  
  const fetchBusinesses = async () => {
    try {
      const response = await fetch(`${API_URL}/businesses`);
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchAllComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchMyComplaints = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/complaints/my/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching my complaints:', error);
    }
  };

  // Fetch initial data
  const fetchActiveCustomerQueue = async (userId) => {
    try {
      const userStr = localStorage.getItem('currentUser');
      const targetUserId = userId || (userStr ? JSON.parse(userStr)._id : null);
      if (!targetUserId) return null;

      const res = await fetch(`${API_URL}/customer/queue/active/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCustomerQueue(data);
        return data;
      } else {
        setActiveCustomerQueue(null);
        return null;
      }
    } catch (err) {
      // silently handle
      return null;
    }
  };

  // Fetch initial data & handle real-time sockets
  useEffect(() => {
    fetchBusinesses();
    fetchUsers();
    fetchAnnouncements();

    // Initial customer queue check
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'customer' || user.role === 'Customer') {
        fetchActiveCustomerQueue(user._id);
      }
    }

    // Socket.io Integration
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(newSocket);

    const joinRoomsForUser = () => {
      const currentUserStr = localStorage.getItem('currentUser');
      const staffStr = localStorage.getItem('currentStaff');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const staff = staffStr ? JSON.parse(staffStr) : null;

      if (currentUser) {
        const bizIdFromUser = currentUser.businessId?._id || currentUser.businessId || currentUser._id;
        if (bizIdFromUser) {
          newSocket.emit('joinBusinessRoom', bizIdFromUser);
          console.log('Joined business room (from currentUser):', bizIdFromUser);
        }

        if (currentUser.role === 'customer' || currentUser.role === 'Customer') {
          newSocket.emit('joinCustomerRoom', currentUser._id);
          fetchActiveCustomerQueue(currentUser._id).then(data => {
            if (data?.businessId) {
              const bizId = data.businessId._id || data.businessId;
              newSocket.emit('joinBusinessRoom', bizId);
              console.log('Customer joined business room after queue fetch:', bizId);
            }
          });
        }

        if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
          newSocket.emit('joinAdminRoom');
          console.log('Joined admin room');
          fetchAllComplaints();
        }

        if (currentUser.role === 'customer' || currentUser.role === 'business' || currentUser.role === 'Customer' || currentUser.role === 'staff') {
          fetchMyComplaints(currentUser._id);
        }
      }

      if (staff) {
        const bizId = staff.businessId?._id || staff.businessId;
        if (bizId) {
          newSocket.emit('joinBusinessRoom', bizId);
          console.log('Joined business room (from currentStaff):', bizId);
        }
      }

      // Automatically reload notifications from MongoDB API on room initialization/auth change
      reloadNotifications();
    };

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      joinRoomsForUser();
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnect attempt ${attempt}`);
    });

    window.addEventListener('auth_state_changed', joinRoomsForUser);
    window.addEventListener('storage', joinRoomsForUser);

    newSocket.on('queueUpdated', (data) => {
      if (data?.business) {
        setBusinesses(prev => prev.map(b => b._id === data.business._id ? { ...b, ...data.business } : b));
      } else {
        fetchBusinesses();
      }

      // Bump queue badge for business/staff
      const currentUserStr = localStorage.getItem('currentUser');
      const staffData = localStorage.getItem('currentStaff');
      const staff = staffData ? JSON.parse(staffData) : null;
      const user = currentUserStr ? JSON.parse(currentUserStr) : null;
      const role = staff ? 'staff' : user?.role ? String(user.role).toLowerCase() : '';

      if (role === 'business' || role === 'staff') {
        window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'queue' } }));
        
        // Notify Business or Staff in real-time when a queue update occurs for their business
        const userBizId = staff ? staff.businessId?._id || staff.businessId : user?.businessId?._id || user?.businessId;
        const queueBizId = data?.newQueue?.businessId?._id || data?.newQueue?.businessId;
        
        if (userBizId && queueBizId && String(userBizId) === String(queueBizId)) {
          if (data.newQueue?.status === 'waiting') {
            const msg = `New customer joined the queue.`;
            addLiveNotification('queue', msg, '🔔');
            toast(msg, { icon: '🔔', duration: 6000 });
          } else if (data.newQueue?.status === 'serving') {
            const msg = `A customer is now being served.`;
            addLiveNotification('queue', msg, '👤');
            toast(msg, { icon: '👤', duration: 6000 });
          }
        }
      }
      
      if (role === 'customer') {
        fetchActiveCustomerQueue(user._id);
        window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'queue' } }));
      }
    });

    newSocket.on('customerQueueUpdated', (data) => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        fetchActiveCustomerQueue(user._id);
        
        if (data?.queue) {
          const q = data.queue;
          let msg = '';
          let icon = '🔔';
          let type = '';

          if (q.status === 'suggested_time') {
            msg = `💡 Business suggested a new time slot: ${q.suggestedTime}.`;
            icon = '💡';
            type = 'queue_suggested';
          } else if (q.status === 'rejected') {
            msg = `❌ Your queue verification request was rejected: "${q.rejectionReason || 'No reason provided'}"`;
            icon = '❌';
            type = 'queue_rejected';
          } else if (q.status === 'info_requested') {
            msg = `📄 Business requested more info: "${q.moreInfoReason || 'Please check details'}"`;
            icon = '📄';
            type = 'queue_info_requested';
          } else if (q.status === 'waiting') {
            msg = `✅ Your queue verification was approved! Your token is ${q.token}.`;
            icon = '✅';
            type = 'queue_approved';
          }

          if (msg) {
            toast(msg, { icon, duration: 8000 });
            addLiveNotification(type, msg, icon);
            window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'notifications' } }));
          }
        }
      }
    });

    newSocket.on('businessUpdated', (data) => {
      if (data?.business) {
        setBusinesses(prev => prev.map(b => b._id === data.business._id ? { ...b, ...data.business } : b));
      } else {
        fetchBusinesses();
      }
    });

    newSocket.on('businessDeleted', (data) => {
      if (data?.businessId) {
        setBusinesses(prev => prev.filter(b => b._id !== data.businessId));
      } else {
        fetchBusinesses();
      }
    });

    newSocket.on('reviewAdded', () => {
      fetchBusinesses();
    });

    newSocket.on('verificationUpdated', (data) => {
      if (data?.business) {
        setBusinesses(prev => prev.map(b => b._id === data.business._id ? { ...b, ...data.business } : b));
      } else {
        fetchBusinesses();
      }
    });

    newSocket.on('appointmentBooked', (data) => {
      // Bump Appointments badge for business/staff when any slot is booked
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        if (user.role === 'business' || user.role === 'Business' || user.role === 'staff') {
          window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'appointments' } }));
        }
      }
    });

    newSocket.on('appointmentUpdated', (data) => {
      const currentUserStr = localStorage.getItem('currentUser');
      const staffData = localStorage.getItem('currentStaff');
      const staff = staffData ? JSON.parse(staffData) : null;
      const user = currentUserStr ? JSON.parse(currentUserStr) : null;
      const role = staff ? 'staff' : user?.role ? String(user.role).toLowerCase() : '';
      
      const apt = data?.appointment;
      if (apt) {
        // Business or Staff should get notifications for customer updates
        if (role === 'business' || role === 'staff') {
          const userBizId = staff ? staff.businessId?._id || staff.businessId : user?.businessId?._id || user?.businessId;
          const aptBizId = apt.businessId?._id || apt.businessId;
          
          if (userBizId && aptBizId && String(userBizId) === String(aptBizId)) {
            const statusMap = {
              pending: { icon: '📅', msg: `New appointment request received${apt.time ? ` at ${apt.time}` : ''}.` },
              cancelled: { icon: '🚫', msg: `Appointment was cancelled by the customer.` },
            };
            const info = statusMap[apt.status];
            if (info) {
              addLiveNotification('appointment', info.msg, info.icon);
              toast(info.msg, { icon: info.icon, duration: 6000 });
              window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'appointments' } }));
            }
          }
        }
        
        // Customers get nav badge updates
        if (role === 'customer' && String(apt.customerId) === String(user?._id)) {
          window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'appointments' } }));
        }
      }
    });

    newSocket.on('notification', (data) => {
      if (!data?.message) return;

      // Toast alert
      toast(data.message, { icon: data.type === 'priority_added' ? '🚨' : (data.icon || '🔔'), duration: 6000 });
      
      const newItem = {
        id: data._id || data.id || `${Date.now()}`,
        type: data.type || 'general',
        title: data.title || 'Notification',
        message: data.message,
        time: data.createdAt || data.time || new Date().toISOString(),
        read: data.isRead || false
      };

      setLiveNotifications(prev => {
        if (prev.some(n => n.id === newItem.id || (n.message === newItem.message && (Date.now() - new Date(n.time).getTime()) < 2000))) {
          return prev;
        }
        return [newItem, ...prev];
      });

      // Browser Desktop Notification if granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(data.title || 'QueueLess Alert', { body: data.message, icon: '/favicon.ico' });
        } catch (e) {}
      }

      // Dispatch DOM events for nav badge bumps
      window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'notifications' } }));
      if (data.type && data.type.includes('appointment')) {
        window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'appointments' } }));
      }
      if (data.type && data.type.includes('queue')) {
        window.dispatchEvent(new CustomEvent('navBadgeBump', { detail: { key: 'queue' } }));
      }
    });

    newSocket.on('newComplaint', (complaint) => {
      setComplaints(prev => [complaint, ...prev]);
      toast.success(`New Ticket: ${complaint.subject}`, { icon: '🎫' });
    });

    newSocket.on('complaintStatusUpdated', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c));
    });

    // Real-time polling fallback for instant customer queue & admin business sync
    const interval = setInterval(() => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        if (user.role === 'customer' || user.role === 'Customer') {
          fetchActiveCustomerQueue(user._id);
        } else if (user.role === 'Super Admin' || user.role === 'Admin') {
          fetchBusinesses();
        }
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth_state_changed', joinRoomsForUser);
      window.removeEventListener('storage', joinRoomsForUser);
      newSocket.disconnect();
    };
  }, []);

  const authenticateUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const registerCustomer = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  };

  const registerBusiness = async (formData) => {
    const url = `${API_URL}/auth/register/business`;
    const payload = JSON.stringify({
      name: formData.businessName || 'New Business',
      email: formData.email || formData.businessEmail || formData.ownerEmail,
      password: formData.password,
      category: formData.businessCategory || formData.category || 'General',
      ...formData
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned HTML instead of JSON! Status: ${response.status}. HTML Snippet: ${text.substring(0, 150)}...`);
    }
    
    if (!response.ok) throw new Error(data.message);
    fetch(`${API_URL}/businesses`).then(res => res.json()).then(setBusinesses);
    return data;
  };

  const joinQueue = async (businessId, partySize = 1, purpose = 'General', notes = '', verificationData = null) => {
    try {
      const userStr = localStorage.getItem('currentUser');
      const userId = userStr ? JSON.parse(userStr)._id : null;
      if (!userId) {
        toast.error('You must be logged in to join a queue');
        return;
      }

      const bodyData = { businessId, userId, partySize, purpose, notes };
      if (verificationData) {
        Object.assign(bodyData, verificationData);
      }

      const response = await fetch(`${API_URL}/customer/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (response.ok) {
        const data = await response.json();
        setActiveCustomerQueue(data);
        
        // Join the business room to get live updates for this queue
        if (socket) {
          socket.emit('joinBusinessRoom', businessId);
        }

        toast.success(`Successfully joined queue! Your token is ${data.token}. We'll notify you when it's your turn.`);
        return data;
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to join queue.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while joining the queue.');
    }
  };
  
  const leaveQueue = async () => {
    if (activeCustomerQueue) {
      try {
        const userStr = localStorage.getItem('currentUser');
        const userId = userStr ? JSON.parse(userStr)._id : null;
        const queueId = activeCustomerQueue.queueId || activeCustomerQueue._id;
        const isRejected = activeCustomerQueue.status === 'rejected';

        await fetch(`${API_URL}/customer/queue/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: activeCustomerQueue.businessId, userId, queueId })
        });
        
        if (socket) {
          socket.emit('leaveBusinessRoom', activeCustomerQueue.businessId);
        }
        
        setActiveCustomerQueue(null);
        toast.success(isRejected ? 'Rejection dismissed. Find another business.' : 'Left the queue.');
      } catch (error) {
        console.error(error);
        toast.error('Failed to leave queue.');
      }
    }
  };

  const acceptQueueSuggestion = async (queueId) => {
    try {
      const response = await fetch(`${API_URL}/customer/queue/${queueId}/accept-suggestion`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (response.ok) {
        setActiveCustomerQueue(prev => ({
          ...(prev || {}),
          status: 'waiting',
          suggestionAccepted: true,
          token: data.queue?.token || prev?.token,
          position: data.queue?.position ?? prev?.position,
          suggestedTime: data.queue?.suggestedTime || prev?.suggestedTime,
          suggestedArriveBy: data.queue?.suggestedArriveBy || prev?.suggestedArriveBy
        }));
        toast.success(data.message || 'Suggestion accepted! Please arrive 10 minutes before to join.', { duration: 6000 });
        return data;
      } else {
        toast.error(data.message || 'Failed to accept suggestion');
      }
    } catch (error) {
      toast.error('Error accepting suggestion');
    }
  };

  const declineQueueSuggestion = async (queueId) => {
    try {
      const response = await fetch(`${API_URL}/customer/queue/${queueId}/decline-suggestion`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setActiveCustomerQueue(null);
        toast.success('Suggestion declined. You have left the queue.');
      } else {
        toast.error('Failed to decline suggestion');
      }
    } catch (error) {
      toast.error('Error declining suggestion');
    }
  };

  const suggestQueueTime = async (businessId, queueId, payload) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/queue/${queueId}/suggest-time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Suggested slot ${payload.suggestedTime} sent to customer! (Arrive by: ${data.suggestedArriveBy})`);
        return data;
      } else {
        toast.error(data.message || 'Failed to send suggestion');
      }
    } catch (error) {
      toast.error('Error sending time suggestion');
    }
  };

  const businessCallNext = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/queue/next`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || 'Failed to call next token.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error.');
    }
  };

  const adminApproveBusiness = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (response.ok) {
        const updatedBusiness = await response.json();
        setBusinesses(prev => prev.map(b => b._id === businessId ? updatedBusiness : b));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const adminRejectBusiness = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (response.ok) {
        const updatedBusiness = await response.json();
        setBusinesses(prev => prev.map(b => b._id === businessId ? updatedBusiness : b));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const issueEmergencyToken = async (businessId) => {
    try {
      const userStr = localStorage.getItem('currentUser');
      const userId = userStr ? JSON.parse(userStr)._id : null;
      
      const response = await fetch(`${API_URL}/businesses/${businessId}/queue/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId || 'walk-in', notes: 'Emergency Walk-in' })
      });
      if (response.ok) {
        toast.success('Emergency Priority Token Issued');
      } else {
        toast.error('Failed to issue priority token.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error.');
    }
  };

  const createAnnouncement = async (announcementData) => {
    const response = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcementData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create announcement');
    }
    const data = await response.json();
    fetch(`${API_URL}/announcements`).then(res => res.json()).then(setAnnouncements);
    return data;
  };

  const deleteAnnouncement = async (id) => {
    const response = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete announcement');
    }
    fetch(`${API_URL}/announcements`).then(res => res.json()).then(setAnnouncements);
  };

  const createComplaint = async (complaintData) => {
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create complaint');
    }
    const data = await response.json();
    setComplaints(prev => [data, ...prev]);
    return data;
  };

  const updateComplaintStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update status');
    }
    const data = await response.json();
    setComplaints(prev => prev.map(c => c._id === data._id ? data : c));
    return data;
  };

  const deleteBusiness = async (businessId) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete business');
      }
      setBusinesses(prev => prev.filter(b => b._id !== businessId));
      toast.success(data.message || 'Business deleted successfully');
      return data;
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error deleting business');
      throw error;
    }
  };

  const updateBusinessQueueStatus = async (businessId, status) => {
    try {
      const response = await fetch(`${API_URL}/businesses/${businessId}/queue/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update queue status');
      }
      setBusinesses(prev => prev.map(b => (b._id === data._id || b.id === data._id) ? { ...b, ...data } : b));
      return data;
    } catch (error) {
      console.error('Update business queue status error:', error);
      throw error;
    }
  };

  useEffect(() => {
    reloadNotifications();
    window.addEventListener('auth_state_changed', reloadNotifications);
    return () => {
      window.removeEventListener('auth_state_changed', reloadNotifications);
    };
  }, [reloadNotifications]);

  return (
    <DatabaseContext.Provider value={{
      users,
      businesses,
      announcements,
      complaints,
      activeCustomerQueue,
      socket,
      liveNotifications,
      markLiveNotificationsRead,
      clearLiveNotifications,
      deleteSingleNotification,
      addLiveNotification,
      fetchBusinesses,
      fetchUsers,
      fetchAnnouncements,
      fetchAllComplaints,
      fetchMyComplaints,
      authenticateUser,
      registerCustomer,
      registerBusiness,
      joinQueue,
      leaveQueue,
      fetchActiveCustomerQueue,
      acceptQueueSuggestion,
      declineQueueSuggestion,
      suggestQueueTime,
      businessCallNext,
      issueEmergencyToken,
      adminApproveBusiness,
      adminRejectBusiness,
      deleteBusiness,
      updateBusinessQueueStatus,
      createAnnouncement,
      deleteAnnouncement,
      createComplaint,
      updateComplaintStatus
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
