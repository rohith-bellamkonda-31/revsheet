const Topic = require('../models/Topic');
const Notification = require('../models/Notification');

// Spaced repetition notification schedule
const SPACED_REPETITION_DAYS = [1, 3, 5, 7, 11, 31, 62, 124, 228];

/**
 * Check and create notifications for topics that are due for review
 */
const checkAndCreateNotifications = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all topics that have a pending review scheduled for today
    const topicsForReview = await Topic.find({
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

    console.log(`Found ${topicsForReview.length} topics for review`);

    for (const topic of topicsForReview) {
      // Check if notification already exists for this topic today
      const existingNotification = await Notification.findOne({
        topic: topic._id,
        createdAt: {
          $gte: now,
          $lte: endOfDay,
        },
      });

      if (!existingNotification) {
        const dayCount = topic.repetitionCount + 1;
        const notification = new Notification({
          user: topic.user,
          topic: topic._id,
          type: 'review_reminder',
          message: `Time to review: "${topic.title}" - Day ${dayCount} of spaced repetition`,
          dayCount,
        });

        await notification.save();
        console.log(`Notification created for topic: ${topic.title}`);
      }
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

/**
 * Get progress statistics for a user
 */
const getUserProgress = async (userId) => {
  try {
    const totalTopics = await Topic.countDocuments({ user: userId });
    const completedTopics = await Topic.countDocuments({
      user: userId,
      isRead: true,
    });
    const pendingTopics = totalTopics - completedTopics;

    const upcomingTopics = await Topic.countDocuments({
      user: userId,
      isRead: false,
      nextReviewDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
    });

    return {
      totalTopics,
      completedTopics,
      pendingTopics,
      upcomingTopics,
      completionPercentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

module.exports = {
  checkAndCreateNotifications,
  getUserProgress,
  SPACED_REPETITION_DAYS,
};
