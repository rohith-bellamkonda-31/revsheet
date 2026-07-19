import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiClock, FiCalendar, FiBook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import '../styles/topics.css';

const TodayReviewsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    fetchTodayReviews();
  }, []);

  const fetchTodayReviews = async () => {
    try {
      setLoading(true);
      const response = await topicsAPI.getTodayNotifications();
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to load today\'s reviews');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRevision = async (topicId, revisionIndex) => {
    try {
      await topicsAPI.markRevision(topicId, revisionIndex);
      toast.success('Revision completed!');
      setCompletedIds((prev) => [...prev, topicId]);
      // Remove from list after a brief delay
      setTimeout(() => {
        setTopics((prev) => prev.filter((t) => t._id !== topicId));
        setCompletedIds((prev) => prev.filter((id) => id !== topicId));
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark revision');
      console.error(error);
    }
  };

  const handleMarkAsRead = async (topicId) => {
    try {
      await topicsAPI.markAsRead(topicId);
      toast.success('Revision marked complete!');
      setCompletedIds((prev) => [...prev, topicId]);
      setTimeout(() => {
        setTopics((prev) => prev.filter((t) => t._id !== topicId));
        setCompletedIds((prev) => prev.filter((id) => id !== topicId));
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark topic');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="page-container loading">Loading...</div>;
  }

  return (
    <motion.div
      className="page-container topics-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <div>
          <h1>Today's Reviews</h1>
          <p>Topics due for revision today — complete them to stay on track.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stats-card" style={{ padding: 16, borderRadius: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <h3 style={{ margin: 0, fontSize: 28, color: '#1d4ed8' }}>{topics.length}</h3>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: 600 }}>Due Today</p>
        </div>
        <div className="stats-card" style={{ padding: 16, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h3 style={{ margin: 0, fontSize: 28, color: '#16a34a' }}>{completedIds.length}</h3>
          <p style={{ margin: 0, color: '#15803d', fontWeight: 600 }}>Completed</p>
        </div>
        <div className="stats-card" style={{ padding: 16, borderRadius: 16, background: '#fefce8', border: '1px solid #fde68a' }}>
          <h3 style={{ margin: 0, fontSize: 28, color: '#ca8a04' }}>{topics.length - completedIds.length}</h3>
          <p style={{ margin: 0, color: '#854d0e', fontWeight: 600 }}>Remaining</p>
        </div>
      </div>

      <div className="topics-list">
        <AnimatePresence>
          {topics.length > 0 ? (
            topics.map((topic, index) => {
              const isCompleting = completedIds.includes(topic._id);
              const dueRevision = topic.revisionSchedule?.find(
                (rev) =>
                  rev.status === 'pending' &&
                  new Date(rev.scheduledDate).setHours(0, 0, 0, 0) <= new Date().setHours(23, 59, 59, 999)
              );

              return (
                <motion.div
                  key={topic._id}
                  className={`topic-card ${isCompleting ? 'completed' : 'pending'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isCompleting ? 0 : 1,
                    y: isCompleting ? -20 : 0,
                    height: isCompleting ? 0 : 'auto',
                    marginBottom: isCompleting ? 0 : 20,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="topic-main">
                    <div className="topic-header-row">
                      <div>
                        <h3>{topic.title}</h3>
                        {topic.description && (
                          <p style={{ marginTop: 6, color: '#475569', fontSize: '0.92rem' }}>
                            {topic.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="topic-info">
                      <span className="subject-badge" style={{ color: topic.subject?.color || '#3b82f6' }}>
                        {topic.subject?.name || 'General'}
                      </span>
                      <span
                        className={`topic-type-badge ${topic.topicType === 'current_affairs' ? 'current-affairs' : 'general-topic'}`}
                      >
                        {topic.topicType === 'current_affairs' ? 'Current Affairs' : 'General'}
                      </span>
                      <span className="priority-badge" style={{ backgroundColor: '#f59e0b' }}>
                        {topic.priority}
                      </span>
                      <span className="difficulty-badge">{topic.difficulty}</span>
                    </div>

                    <div className="revision-details">
                      <span>
                        <FiClock style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Revision{' '}
                        {dueRevision
                          ? dueRevision.index + 1
                          : (topic.revisionSchedule?.length || 0)}{' '}
                        of {topic.revisionSchedule?.length || 9}
                      </span>
                      <span className="revision-status due">Due today</span>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (dueRevision) {
                            handleMarkRevision(topic._id, dueRevision.index);
                          } else {
                            handleMarkAsRead(topic._id);
                          }
                        }}
                        disabled={isCompleting}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <FiCheck /> {isCompleting ? 'Completing...' : 'Mark as Done'}
                      </button>
                      <Link
                        to={`/topics`}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <FiBook /> View Details
                      </Link>
                    </div>

                    {dueRevision && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef9c3', borderRadius: 12, border: '1px solid #fde68a', fontSize: '0.9rem', color: '#713f12' }}>
                        <FiCalendar style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Due revision: Day {dueRevision.index + 1} — scheduled{' '}
                        {new Date(dueRevision.scheduledDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#f0fdf4',
                borderRadius: 20,
                border: '2px dashed #86efac',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ margin: '0 0 8px', color: '#166534' }}>All caught up!</h3>
              <p style={{ margin: 0, color: '#15803d' }}>
                No topics are due for revision today. Come back tomorrow or add new topics to study.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TodayReviewsPage;
