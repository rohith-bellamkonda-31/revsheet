import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiBook, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StatsCard from '../components/StatsCard';
import { topicsAPI, subjectsAPI } from '../services/api';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    completedTopics: 0,
    pendingTopics: 0,
    upcomingTopics: 0,
  });
  const [subjects, setSubjects] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [topicsRes, subjectsRes] = await Promise.all([
        topicsAPI.getAll(),
        subjectsAPI.getAll(),
      ]);

      const topics = topicsRes.data;
      const subjectsData = subjectsRes.data;

      // Calculate stats
      const completed = topics.filter((t) => t.isRead).length;
      const pending = topics.filter((t) => !t.isRead).length;
      const upcoming = topics.filter(
        (t) =>
          !t.isRead &&
          new Date(t.nextReviewDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalTopics: topics.length,
        completedTopics: completed,
        pendingTopics: pending,
        upcomingTopics: upcoming,
      });

      setSubjects(subjectsData);
      setRecentTopics(topics.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container loading">Loading...</div>;
  }

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Your UPSC study progress at a glance</p>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <StatsCard
          icon={FiBook}
          title="Total Topics"
          value={stats.totalTopics}
          color="#3b82f6"
        />
        <StatsCard
          icon={FiCheckCircle}
          title="Completed"
          value={stats.completedTopics}
          color="#10b981"
        />
        <StatsCard
          icon={FiClock}
          title="Pending"
          value={stats.pendingTopics}
          color="#f59e0b"
        />
        <StatsCard
          icon={FiTrendingUp}
          title="Upcoming (7 days)"
          value={stats.upcomingTopics}
          color="#ef4444"
        />
      </div>

      {/* Subjects Section */}
      <motion.div
        className="dashboard-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2>Subjects</h2>
        <div className="subjects-grid">
          {subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <motion.div
                key={subject._id}
                className="subject-card"
                style={{ backgroundColor: subject.color + '20', borderColor: subject.color }}
                whileHover={{ translateY: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="subject-icon">{subject.icon}</div>
                <h3>{subject.name}</h3>
                <p className="subject-stats">
                  {subject.completedCount}/{subject.topicCount} completed
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        subject.topicCount > 0
                          ? (subject.completedCount / subject.topicCount) * 100
                          : 0
                      }%`,
                      backgroundColor: subject.color,
                    }}
                  ></div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="empty-state">No subjects yet. Create one to get started!</p>
          )}
        </div>
      </motion.div>

      {/* Recent Topics Section */}
      <motion.div
        className="dashboard-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2>Recent Topics</h2>
        <div className="topics-list">
          {recentTopics.length > 0 ? (
            recentTopics.map((topic) => (
              <motion.div
                key={topic._id}
                className={`topic-item ${topic.isRead ? 'completed' : 'pending'}`}
                whileHover={{ translateX: 5 }}
              >
                <div className="topic-info">
                  <h4>{topic.title}</h4>
                  <p>{topic.subject?.name}</p>
                </div>
                <div className="topic-meta">
                  <span className={`badge ${topic.priority}`}>{topic.priority}</span>
                  {!topic.isRead && (
                    <span className="review-date">
                      Review: {new Date(topic.nextReviewDate).toLocaleDateString()}
                    </span>
                  )}
                  {topic.isRead && <span className="status-done">✓ Completed</span>}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="empty-state">No topics yet. Start adding topics to your subjects!</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
