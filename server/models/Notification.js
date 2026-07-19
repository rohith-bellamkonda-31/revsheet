const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    type: {
      type: String,
      enum: ['review_reminder', 'completion'],
      default: 'review_reminder',
    },
    message: {
      type: String,
      required: true,
    },
    dayCount: {
      type: Number,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7776000, // Auto-delete after 90 days
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
