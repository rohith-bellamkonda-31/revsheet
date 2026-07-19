const mongoose = require('mongoose');

// Spaced repetition pattern: 1, 3, 5, 7, 11, 31, 62, 124, 228 days
const SPACED_REPETITION_DAYS = [1, 3, 5, 7, 11, 31, 62, 124, 228];

const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    nextReviewDate: {
      type: Date,
      default: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readDate: {
      type: Date,
    },
    repetitionCount: {
      type: Number,
      default: 0,
    },
    revisionSchedule: [
      {
        index: Number,
        daysAfterStart: Number,
        scheduledDate: Date,
        status: {
          type: String,
          enum: ['pending', 'done'],
          default: 'pending',
        },
        completedAt: Date,
      },
    ],
    notificationsSent: [
      {
        day: Number,
        sentDate: Date,
        viewed: Boolean,
      },
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard'],
      default: 'moderate',
    },
    imageUrl: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    topicType: {
      type: String,
      enum: ['general', 'current_affairs'],
      default: 'general',
    },
    notes: {
      type: String,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Instance method to initialize the revision schedule
TopicSchema.methods.initializeRevisionSchedule = function () {
  if (this.revisionSchedule && this.revisionSchedule.length === SPACED_REPETITION_DAYS.length) {
    return;
  }

  const startDate = this.dateAdded || new Date();
  this.revisionSchedule = SPACED_REPETITION_DAYS.map((days, index) => ({
    index,
    daysAfterStart: days,
    scheduledDate: new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000),
    status: 'pending',
  }));
  const nextPending = this.revisionSchedule.find((rev) => rev.status === 'pending');
  this.nextReviewDate = nextPending ? nextPending.scheduledDate : null;
  this.isRead = false;
};

TopicSchema.methods.calculateNextReview = function () {
  const nextPending = this.revisionSchedule.find((rev) => rev.status === 'pending');
  this.nextReviewDate = nextPending ? nextPending.scheduledDate : null;
  this.isRead = !nextPending;
};

TopicSchema.methods.getNextNotificationDay = function () {
  const nextPending = this.revisionSchedule.find((rev) => rev.status === 'pending');
  return nextPending ? nextPending.daysAfterStart : null;
};

TopicSchema.methods.markRevisionComplete = function (revisionIndex) {
  const revision = this.revisionSchedule.find((rev) => rev.index === revisionIndex);
  if (!revision) {
    throw new Error('Revision not found');
  }

  revision.status = 'done';
  revision.completedAt = new Date();
  this.repetitionCount = this.revisionSchedule.filter((rev) => rev.status === 'done').length;
  this.readDate = new Date();
  this.calculateNextReview();

  return this.save();
};

TopicSchema.methods.markAsRead = function () {
  const now = new Date();
  const nextDue = this.revisionSchedule.find(
    (rev) => rev.status === 'pending' && rev.scheduledDate <= now
  );
  if (!nextDue) {
    throw new Error('No revision is currently due');
  }

  return this.markRevisionComplete(nextDue.index);
};

// Static method to get all topics that need notification today
TopicSchema.statics.getTopicsForNotification = async function (userId) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    user: userId,
    revisionSchedule: {
      $elemMatch: {
        status: 'pending',
        scheduledDate: {
          $gte: now,
          $lte: endOfDay,
        },
      },
    },
  });
};

TopicSchema.pre('save', function (next) {
  if (this.isNew) {
    this.initializeRevisionSchedule();
  }
  next();
});

module.exports = mongoose.model('Topic', TopicSchema);
