import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiClock, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { topicsAPI, subjectsAPI } from '../services/api';
import '../styles/topics.css';

const TopicsPage = () => {
  const { subjectId } = useParams();
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [expandedTopicIds, setExpandedTopicIds] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialTopicType =
    location.pathname === '/current-affairs'
      ? 'current_affairs'
      : searchParams.get('topicType') || 'all';

  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    subjectId: subjectId || '',
    priority: 'medium',
    difficulty: 'moderate',
    topicType: initialTopicType === 'current_affairs' ? 'current_affairs' : 'general',
    notes: '',
  });
  const [topicTypeFilter, setTopicTypeFilter] = useState(initialTopicType);

  const SPACED_REPETITION_DAYS = [1, 3, 5, 7, 11, 31, 62, 124, 228];
  const COLOR_PALETTE = ['#000000', '#ef4444', '#047857', '#0c4a6e', '#d97706', '#9333ea'];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isTopicFullyComplete = (topic) => !topic.nextReviewDate;

  const isTopicDue = (topic) => {
    if (!topic.nextReviewDate) return false;
    const next = new Date(topic.nextReviewDate);
    const now = new Date();
    return next <= now;
  };

  const getRevisionLabel = (topic) => {
    if (isTopicFullyComplete(topic)) {
      return `All ${SPACED_REPETITION_DAYS.length} revisions complete`;
    }
    return `Revision ${Math.min(topic.repetitionCount + 1, SPACED_REPETITION_DAYS.length)} of ${SPACED_REPETITION_DAYS.length}`;
  };

  const getUpcomingReviews = (topic) => {
    const schedule = topic.revisionSchedule || [];
    return schedule.map((rev) => ({
      label: `Rev ${rev.index + 1}`,
      date: new Date(rev.scheduledDate),
      status: rev.status,
      revision: rev,
    }));
  };

  const isRevisionDue = (revision) => {
    if (!revision || revision.status === 'done') return false;
    const scheduled = new Date(revision.scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduled <= today;
  };

  const applyEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleNotesChange = (e) => {
    setFormData({ ...formData, notes: e.target.innerHTML });
  };

  const handleImageUrlAdd = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
      }));
    });
  };

  const openImageLightbox = (src) => {
    setSelectedImage(src);
  };

  const closeImageLightbox = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      editorRef.current.innerHTML = formData.notes || '';
    }
  }, [isModalOpen]);

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

  const fetchTopics = async (subject = null, status = null, topicType = null) => {
    try {
      const response = await topicsAPI.getAll(
        subject,
        status || (filterStatus !== 'all' ? filterStatus : null),
        topicType || (topicTypeFilter !== 'all' ? topicTypeFilter : null)
      );
      const sortedTopics = response.data.slice().sort((a, b) => new Date(b.dateAdded || b.createdAt) - new Date(a.dateAdded || a.createdAt));
      setTopics(sortedTopics);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    fetchTopics(
      selectedSubjectId || subjectId,
      filterStatus !== 'all' ? filterStatus : null,
      topicTypeFilter !== 'all' ? topicTypeFilter : null
    );
  }, [filterStatus, selectedSubjectId, topicTypeFilter, subjectId]);

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
        setFormData({
        title: topic.title,
        description: topic.description,
        images: topic.images || (topic.imageUrl ? [topic.imageUrl] : []),
        subjectId: topic.subject._id,
        priority: topic.priority,
        difficulty: topic.difficulty,
        topicType: topic.topicType || 'general',
        notes: topic.notes,
      });
    } else {
      setEditingTopic(null);
      setFormData({
        title: '',
        description: '',
        images: [],
        subjectId: selectedSubjectId || subjects[0]?._id || '',
        priority: 'medium',
        difficulty: 'moderate',
        topicType: topicTypeFilter === 'current_affairs' ? 'current_affairs' : 'general',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Topic title is required');
      return;
    }

    if (!formData.subjectId) {
      toast.error('Please select a subject');
      return;
    }

    try {
      if (editingTopic) {
        await topicsAPI.update(editingTopic._id, formData);
        toast.success('Topic updated');
      } else {
        await topicsAPI.create(formData);
        toast.success('Topic created');
      }
      setIsModalOpen(false);
      fetchTopics(selectedSubjectId, filterStatus !== 'all' ? filterStatus : null, topicTypeFilter !== 'all' ? topicTypeFilter : null);
    } catch (error) {
      toast.error('Failed to save topic');
      console.error(error);
    }
  };

  const handleMarkAsRead = async (topicId) => {
    try {
      await topicsAPI.markAsRead(topicId);
      toast.success('Revision marked complete! Next review scheduled.');
      fetchTopics(selectedSubjectId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark topic');
      console.error(error);
    }
  };

  const handleMarkRevision = async (topicId, revisionIndex) => {
    try {
      await topicsAPI.markRevision(topicId, revisionIndex);
      toast.success('Revision completed for that specific review day.');
      fetchTopics(selectedSubjectId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark revision');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await topicsAPI.delete(id);
        toast.success('Topic deleted');
        fetchTopics(selectedSubjectId);
      } catch (error) {
        toast.error('Failed to delete topic');
        console.error(error);
      }
    }
  };

  const handleSearch = () => setSearchText(searchInput.trim());
  const clearSearch = () => { setSearchInput(''); setSearchText(''); };
  const toggleTopicExpansion = (topicId) => setExpandedTopicIds((prev) => prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]);

  const getPriorityColor = (priority) => {
    const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
    return colors[priority] || '#3b82f6';
  };

  const filteredTopics = topics.filter((topic) => {
    if (!searchText) return true;
    const query = searchText.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description?.toLowerCase().includes(query) ||
      topic.subject.name.toLowerCase().includes(query)
    );
  });

  // Deduplicate topics by _id to avoid rendering duplicates
  const uniqueTopics = filteredTopics.filter((t, i, arr) => arr.findIndex(x => x._id === t._id) === i);

  if (loading) return <div className="page-container loading">Loading...</div>;

  return (
    <motion.div className="page-container topics-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="page-header">
        <div>
          <h1>{topicTypeFilter === 'current_affairs' ? 'Current Affairs' : 'Topics'}</h1>
          <p>Manage your study topics with spaced repetition and keep Current Affairs notes separate.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><FiPlus /> Add Topic</button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Section:</label>
          <div className="status-buttons">
            <button className={`filter-btn ${topicTypeFilter === 'all' ? 'active' : ''}`} onClick={() => setTopicTypeFilter('all')}>All Topics</button>
            <button className={`filter-btn ${topicTypeFilter === 'general' ? 'active' : ''}`} onClick={() => setTopicTypeFilter('general')}>Static</button>
            <button className={`filter-btn ${topicTypeFilter === 'current_affairs' ? 'active' : ''}`} onClick={() => setTopicTypeFilter('current_affairs')}>Current Affairs</button>
          </div>
        </div>

        <div className="filter-group">
          <label>Subject:</label>
          <select value={selectedSubjectId} onChange={(e) => { setSelectedSubjectId(e.target.value); setFilterStatus('all'); }}>
            <option value="">All Subjects</option>
            {subjects.map((subject) => (<option key={subject._id} value={subject._id}>{subject.name}</option>))}
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Search:</label>
          <div className="search-row">
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search topics, subjects..." />
            <button className="btn btn-secondary search-btn" onClick={handleSearch}><FiSearch /> Search</button>
            <button className="btn btn-light search-clear" onClick={clearSearch}>Clear</button>
          </div>
        </div>
      </div>

      <div className="topics-list">
        <AnimatePresence>
          {uniqueTopics.length > 0 ? (
            uniqueTopics.map((topic, index) => (
              <motion.div
                key={topic._id}
                className={`topic-card ${topic.isRead ? 'completed' : 'pending'} ${expandedTopicIds.includes(topic._id) ? 'expanded' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ translateY: -3 }}
              >
                <div className="topic-main">
                  <div className="topic-header-row">
                    <div>
                      <h3>{topic.title}</h3>
                      {(topic.images?.length > 0 ? topic.images : topic.imageUrl ? [topic.imageUrl] : []).length > 0 && (
                        <div className="topic-image-grid">
                          {(topic.images?.length > 0 ? topic.images : topic.imageUrl ? [topic.imageUrl] : []).map((image, index) => (
                            <button key={`${topic._id}-${index}`} type="button" className="topic-image-button" onClick={() => openImageLightbox(image)}>
                              <img src={image} alt={`${topic.title} image ${index + 1}`} className="topic-image-thumb" />
                            </button>
                          ))}
                        </div>
                      )}
                      {topic.description && <p className="topic-description">{topic.description}</p>}
                    </div>
                    <div className="topic-header-actions">
                      <div className="action-buttons">
                        {!isTopicFullyComplete(topic) && (<button className="action-btn mark-read" onClick={() => handleMarkAsRead(topic._id)} title={isTopicDue(topic) ? 'Mark this revision as completed' : 'Not due yet'} disabled={!isTopicDue(topic)}><FiCheck /></button>)}
                        <button className="action-btn edit" onClick={() => handleOpenModal(topic)} title="Edit"><FiEdit2 /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(topic._id)} title="Delete"><FiTrash2 /></button>
                      </div>
                      <button className={`action-btn expand-toggle ${expandedTopicIds.includes(topic._id) ? 'close' : 'open'}`} onClick={() => toggleTopicExpansion(topic._id)}>{expandedTopicIds.includes(topic._id) ? 'Close' : 'Show'}</button>
                    </div>
                  </div>

                  <div className="topic-info">
                    <span className="subject-badge" style={{ color: topic.subject.color }}>{topic.subject.name}</span>
                    <span className={`topic-type-badge ${topic.topicType === 'current_affairs' ? 'current-affairs' : 'general-topic'}`}>{topic.topicType === 'current_affairs' ? 'Current Affairs' : 'General'}</span>
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(topic.priority) }}>{topic.priority}</span>
                    <span className={`difficulty-badge ${topic.difficulty}`}>{topic.difficulty}</span>
                  </div>

                  <div className="revision-details">
                    <span>{getRevisionLabel(topic)}</span>
                    <span className={`revision-status ${isTopicDue(topic) ? 'due' : ''}`}>{isTopicFullyComplete(topic) ? 'Fully complete' : isTopicDue(topic) ? 'Due now' : `Due ${formatDate(topic.nextReviewDate)}`}</span>
                  </div>

                  {topic.notes && <div className="topic-notes" dangerouslySetInnerHTML={{ __html: topic.notes }} />}

                  {expandedTopicIds.includes(topic._id) && (
                    <div className="revision-timeline">
                      {getUpcomingReviews(topic).map((review, ri) => (
                        <motion.div key={ri} className={`revision-step ${review.status}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                          <div className="revision-meta-row">
                            <span className="revision-label"><FiClock className="revision-icon" /> {review.label}</span>
                            <span className="revision-date">{review.date.toLocaleDateString()}</span>
                          </div>
                          <div className="revision-status-row">
                            <span className={`revision-tag ${review.status}`}>{review.status === 'done' ? 'Done' : review.status === 'due' ? 'Due today' : 'Upcoming'}</span>
                            {review.status !== 'done' && isRevisionDue(review.revision) && (<button className="btn btn-secondary btn-small" onClick={() => handleMarkRevision(topic._id, review.revision.index)}>Complete</button>)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                 
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state"><p>No topics yet. Create one to start studying!</p></div>
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} title={editingTopic ? 'Edit Topic' : 'Create New Topic'} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} submitText={editingTopic ? 'Update' : 'Create'}>
        <div className="form-group">
          <label>Topic Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., The Mughal Empire" />
        </div>

        <div className="form-group">
          <label>Subject</label>
          <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}>
            <option value="">Select a subject</option>
            {subjects.map((subject) => (<option key={subject._id} value={subject._id}>{subject.name}</option>))}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the topic" rows="3" />
        </div>

        <div className="form-group image-upload-group">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageFiles} />
          <div className="image-url-row">
            <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="Paste an image URL to attach" />
            <button type="button" className="btn btn-secondary" onClick={handleImageUrlAdd}>Add</button>
          </div>
          {formData.images.length > 0 && (
            <div className="image-preview-row">
              {formData.images.map((image, index) => (
                <div key={index} className="image-chip">
                  <span>Image {index + 1}</span>
                  <button type="button" onClick={() => handleImageRemove(index)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Section</label>
          <select value={formData.topicType} onChange={(e) => setFormData({ ...formData, topicType: e.target.value })}>
            <option value="general">Static Topic</option>
            <option value="current_affairs">Current Affairs</option>
          </select>
        </div>

        <div className="form-group notes-group">
          <label>Notes</label>
          <div className="editor-toolbar">
            <button type="button" onClick={() => applyEditorCommand('bold')}><strong>B</strong></button>
            <button type="button" onClick={() => applyEditorCommand('italic')}><em>I</em></button>
            <button type="button" onClick={() => applyEditorCommand('underline')}><u>U</u></button>
            <button type="button" onClick={() => applyEditorCommand('hiliteColor', '#fff59d')}>Highlight</button>
            <button type="button" onClick={() => applyEditorCommand('removeFormat')}>Clear</button>
            <div className="color-picker-toolbar">
              {COLOR_PALETTE.map((color) => (
                <button key={color} type="button" className="color-button" style={{ backgroundColor: color }} onClick={() => applyEditorCommand('foreColor', color)} />
              ))}
            </div>
          </div>
          <div ref={editorRef} className="notes-editor notes-rich-editor" contentEditable suppressContentEditableWarning onInput={handleNotesChange} onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData('text/plain'); document.execCommand('insertText', false, text); }} />
          <small className="notes-hint">Use the editor toolbar for bold, italic, underline, highlight, and colored text.</small>
        </div>
      </Modal>

      {selectedImage && (
        <div className="image-lightbox-overlay" onClick={closeImageLightbox}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-lightbox-close" onClick={closeImageLightbox}>&times;</button>
            <img src={selectedImage} alt="Enlarged preview" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TopicsPage;
