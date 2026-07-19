const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects for user
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId })
      .populate('topics')
      .exec();

    // Add topic count to each subject
    const subjectsWithStats = subjects.map((subject) => ({
      ...subject.toObject(),
      topicCount: subject.topics.length,
      completedCount: subject.topics.filter((t) => t.isRead).length,
    }));

    res.json(subjectsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create subject
router.post(
  '/',
  auth,
  [body('name').notEmpty().withMessage('Subject name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, icon, color } = req.body;

      const subject = new Subject({
        name,
        description,
        icon: icon || '📚',
        color: color || '#3b82f6',
        user: req.userId,
      });

      await subject.save();
      res.status(201).json(subject);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update subject
router.put('/:id', auth, async (req, res) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, icon, color } = req.body;

    if (name) subject.name = name;
    if (description) subject.description = description;
    if (icon) subject.icon = icon;
    if (color) subject.color = color;

    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all topics in subject
    await Topic.deleteMany({ subject: req.params.id });

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
