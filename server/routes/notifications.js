const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications for user
router.get('/', auth, async (req, res) => {
  try {
    const { read } = req.query;
    let filter = { user: req.userId };

    if (read === 'true') {
      filter.isRead = true;
    } else if (read === 'false') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('topic', 'title description')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    const unreadCount = await Notification.countDocuments({
      user: req.userId,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread notification count
router.get('/count/unread', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.userId,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
