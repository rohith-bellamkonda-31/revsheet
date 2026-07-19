import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiLogOut, FiHome, FiBook, FiTarget, FiFileText, FiCalendar } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { notificationsAPI } from '../services/api';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">RevSheet</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">
            <FiHome /> Dashboard
          </Link>
          <Link to="/subjects" className="nav-link">
            <FiBook /> Subjects
          </Link>
          <Link to="/topics" className="nav-link">
            <FiTarget /> Topics
          </Link>
          <Link to="/current-affairs" className="nav-link">
            <FiFileText /> Current Affairs
          </Link>
          <Link to="/today-reviews" className="nav-link">
            <FiCalendar /> Today's Reviews
          </Link>
          <Link to="/notifications" className="nav-link notification-link">
            <FiBell />
            Notifications
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={logout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
