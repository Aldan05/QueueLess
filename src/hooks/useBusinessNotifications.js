import { useDatabase } from '../context/DatabaseContext';

export const useBusinessNotifications = () => {
  const { liveNotifications, markLiveNotificationsRead, clearLiveNotifications, deleteSingleNotification } = useDatabase();
  const unreadCount = (liveNotifications || []).filter(n => !n.read).length;
  
  return {
    notifications: liveNotifications || [],
    unreadCount,
    markAllRead: markLiveNotificationsRead,
    clearAll: clearLiveNotifications,
    deleteOne: deleteSingleNotification
  };
};
