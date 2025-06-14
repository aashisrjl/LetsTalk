
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  _id: string;
  type: 'message' | 'friend' | 'session' | 'system' | 'like' | 'follow';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    name: string;
    photo?: string;
  };
  data?: any;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (page = 1, limit = 10, showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<NotificationResponse>(
        `http://localhost:3000/notifications?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        
        if (showToast) {
          toast({
            title: "Notifications Updated",
            description: `${response.data.totalCount} notifications loaded`,
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notifications';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Notification Read",
          description: "Notification marked as read",
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to mark notification as read';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.patch(
        'http://localhost:3000/notifications/mark-all-read',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to mark all notifications as read';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/notifications/${notificationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const deletedNotif = notifications.find(n => n._id === notificationId);
        
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
        
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete notification';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Delete all notifications one by one
      const deletePromises = notifications.map(notif => 
        axios.delete(`http://localhost:3000/notifications/${notif._id}`, { withCredentials: true })
      );
      
      await Promise.all(deletePromises);
      
      setNotifications([]);
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to clear all notifications';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};
