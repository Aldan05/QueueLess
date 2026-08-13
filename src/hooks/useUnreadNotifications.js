import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../context/DatabaseContext';

export const useUnreadNotifications = (audienceRole) => {
  const { announcements } = useDatabase();
  const [unreadCount, setUnreadCount] = useState(0);

  const storageKey = `queueLess_lastRead_${audienceRole}`;

  // Filter announcements for this role
  const filteredAnnouncements = announcements.filter(
    a => a.targetAudience === 'All' || a.targetAudience === audienceRole
  );

  const calculateUnread = useCallback(() => {
    const lastRead = localStorage.getItem(storageKey);
    if (!lastRead) {
      setUnreadCount(filteredAnnouncements.length);
    } else {
      const lastReadTime = new Date(lastRead).getTime();
      const count = filteredAnnouncements.filter(
        a => new Date(a.createdAt).getTime() > lastReadTime
      ).length;
      setUnreadCount(count);
    }
  }, [filteredAnnouncements, storageKey]);

  // Initial calculation and listen for changes
  useEffect(() => {
    calculateUnread();

    const handleStorageChange = (e) => {
      if (e.key === storageKey || e.type === 'notifications_read') {
        calculateUnread();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notifications_read', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notifications_read', handleStorageChange);
    };
  }, [calculateUnread, storageKey]);

  const markAsRead = useCallback(() => {
    localStorage.setItem(storageKey, new Date().toISOString());
    setUnreadCount(0);
    window.dispatchEvent(new Event('notifications_read'));
  }, [storageKey]);

  return { unreadCount, markAsRead };
};
