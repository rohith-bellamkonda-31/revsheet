import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { subjectsAPI } from '../services/api';
import '../styles/subjects.css';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📚', color: '#3b82f6' });

  const ICONS = ['📚', '🎯', '📖', '🔬', '📊', '🌍', '✏️', '💡', '🎓'];
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to load subjects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({ ...subject });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', description: '', icon: '📚', color: '#3b82f6' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      if (editingSubject) {
        await subjectsAPI.update(editingSubject._id, formData);
        toast.success('Subject updated');
      } else {
        await subjectsAPI.create(formData);
        toast.success('Subject created');
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to save subject');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsAPI.delete(id);
        toast.success('Subject deleted');
        fetchSubjects();
      } catch (error) {
        toast.error('Failed to delete subject');
        console.error(error);
      }
    }
  };

  if (loading) {
    return <div className="page-container loading">Loading...</div>;
  }

  return (
    <motion.div
      className="page-container subjects-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Subjects</h1>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <FiPlus /> Add Subject
        </button>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject._id}
            className="subject-card-large clickable-subject-card"
            style={{ backgroundColor: subject.color + '20', borderColor: subject.color, cursor: 'pointer' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ translateY: -5 }}
            onClick={() => navigate(`/subject/${subject._id}`)}
          >
            <div className="subject-header">
              <span className="subject-icon-large">{subject.icon}</span>
              <div className="subject-actions">
                <button
                  className="action-btn"
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(subject); }}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  className="action-btn delete"
                  onClick={(e) => { e.stopPropagation(); handleDelete(subject._id); }}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <h3>{subject.name}</h3>
            {subject.description && <p className="subject-description">{subject.description}</p>}
            <div className="subject-stats">
              <span>{subject.topicCount} topics</span>
              <span>{subject.completedCount} completed</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${subject.topicCount > 0 ? (subject.completedCount / subject.topicCount) * 100 : 0}%`,
                  backgroundColor: subject.color,
                }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="empty-state">
          <p>No subjects yet. Create one to organize your studies!</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingSubject ? 'Edit Subject' : 'Create New Subject'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitText={editingSubject ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label>Subject Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Indian History"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Icon</label>
          <div className="icon-picker">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${formData.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default SubjectsPage;
