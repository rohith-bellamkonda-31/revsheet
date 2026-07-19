import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import '../styles/statscard.css';

const StatsCard = ({ icon: Icon, title, value, subtitle, color = '#3b82f6' }) => {
  return (
    <motion.div
      className="stats-card"
      style={{ borderLeftColor: color }}
      whileHover={{ translateY: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stats-icon" style={{ color }}>
        <Icon size={24} />
      </div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

export default StatsCard;
