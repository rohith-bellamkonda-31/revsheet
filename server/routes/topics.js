const express = require('express');
const { body, validationResult } = require('express-validator');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all topics for user
router.get('/', auth, async (req, res) => {
  try {
    const { subjectId, status, topicType } = req.query;
    let filter = { user: req.userId };

    if (subjectId) {
      filter.subject = subjectId;
    }

    if (topicType) {
      filter.topicType = topicType;
    }

    if (status === 'pending') {
      filter.isRead = false;
    } else if (status === 'completed') {
      filter.isRead = true;
    }

    const topics = await Topic.find(filter)
      .populate('subject', 'name icon color')
      .sort({ nextReviewDate: 1 })
      .exec();

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single topic
router.get('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('subject');
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create topic
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('subjectId').notEmpty().withMessage('Subject is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, imageUrl, images, subjectId, priority, difficulty, notes, topicType } = req.body;

      const subject = await Subject.findById(subjectId);
      if (!subject || subject.user.toString() !== req.userId) {
        return res.status(403).json({ message: 'Invalid subject' });
      }

      const topic = new Topic({
        title,
        description,
        imageUrl,
        images: images || (imageUrl ? [imageUrl] : []),
        subject: subjectId,
        user: req.userId,
        priority: priority || 'medium',
        difficulty: difficulty || 'moderate',
        topicType: topicType || 'general',
        notes,
      });

      await topic.save();

      // Add topic to subject
      await Subject.findByIdAndUpdate(subjectId, {
        $push: { topics: topic._id },
      });

      const populatedTopic = await Topic.findById(topic._id).populate('subject');
      res.status(201).json(populatedTopic);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update topic
router.put('/:id', auth, async (req, res) => {
  try {
    let topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, imageUrl, images, priority, difficulty, notes, bookmarked, topicType } = req.body;

    if (title !== undefined) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (imageUrl !== undefined) topic.imageUrl = imageUrl;
    if (images !== undefined) topic.images = images;
    if (priority !== undefined) topic.priority = priority;
    if (difficulty !== undefined) topic.difficulty = difficulty;
    if (notes !== undefined) topic.notes = notes;
    if (topicType !== undefined) topic.topicType = topicType;
    if (bookmarked !== undefined) topic.bookmarked = bookmarked;

    await topic.save();
    await topic.populate('subject');

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark topic's current due revision as completed
router.patch('/:id/mark-read', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!topic.revisionSchedule || topic.revisionSchedule.length === 0) {
      topic.initializeRevisionSchedule();
    }

    await topic.markAsRead();

    const populatedTopic = await Topic.findById(topic._id).populate('subject');
    res.json(populatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error', error: error.message });
  }
});

// Mark a specific revision complete
router.patch('/:id/revision/:revisionIndex/complete', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!topic.revisionSchedule || topic.revisionSchedule.length === 0) {
      topic.initializeRevisionSchedule();
    }

    const revisionIndex = parseInt(req.params.revisionIndex, 10);
    if (Number.isNaN(revisionIndex)) {
      return res.status(400).json({ message: 'Invalid revision index' });
    }

    await topic.markRevisionComplete(revisionIndex);

    const populatedTopic = await Topic.findById(topic._id).populate('subject');
    res.json(populatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Server error', error: error.message });
  }
});

// Delete topic
router.delete('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Topic.findByIdAndDelete(req.params.id);

    // Remove from subject
    await Subject.findByIdAndUpdate(topic.subject, {
      $pull: { topics: req.params.id },
    });

    // Remove associated notifications
    await Notification.deleteMany({ topic: req.params.id });

    res.json({ message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get topics for today's notifications
router.get('/notifications/today', auth, async (req, res) => {
  try {
    const topics = await Topic.getTopicsForNotification(req.userId);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
