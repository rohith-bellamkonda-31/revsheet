import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';
import '../styles/notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  const fetchNotifications = async (filterType = 'all') => {
    try {
      setLoading(true);
      const read = filterType === 'all' ? undefined : filterType === 'unread';
      const response = await notificationsAPI.getAll(read);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications(filter);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // We'll implement delete endpoint if needed
      toast.info('Delete functionality coming soon');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return <div className="page-container loading">Loading...</div>;
  }

  return (
    <motion.div
      className="page-container notifications-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Your review reminders and study alerts</p>
          {unreadCount > 0 && <span className="unread-count">{unreadCount} unread</span>}
        </div>
      </div>

      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read
        </button>
      </div>

      <div className="notifications-list">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ translateX: 5 }}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.topic.title}</h3>
                    <span className={`notification-type ${notification.type}`}>
                      {notification.type === 'review_reminder' ? '📋 Review' : '✅ Completed'}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}{' '}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                    {notification.isRead && (
                      <span className="read-status">Read</span>
                    )}
                  </div>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-btn mark-read"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <p>
                {filter === 'unread'
                  ? 'No unread notifications. Great job staying on top!'
                  : 'No notifications yet. Keep studying!'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
