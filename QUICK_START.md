# RevSheet - Quick Reference Guide

## 🚀 5-Minute Quick Start

### Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)

### Installation
```bash
# Clone/Create project
cd RevSheet

# Install all dependencies
npm run install-all

# Setup environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI
```

### Start Development
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📋 Core Features at a Glance

| Feature | Location | How To Use |
|---------|----------|-----------|
| **Create Subject** | Subjects Page | Click "Add Subject" button |
| **Add Topic** | Topics Page | Click "Add Topic", select subject |
| **Mark Complete** | Topic Card | Click checkmark button |
| **View Progress** | Dashboard | See stats and recent topics |
| **Get Reminders** | Notifications | Auto-generated based on schedule |
| **Track Notifications** | Navbar Badge | Shows unread count |

## 🔄 Spaced Repetition Workflow

```
Day 0: Create Topic (added to "Next Review: Day 1")
    ↓
Day 1: ⏰ Notification → User Reviews → Mark Complete
    ↓
Day 3: ⏰ Notification → User Reviews → Mark Complete
    ↓
Day 5: ⏰ Notification → User Reviews → Mark Complete
    ↓
... (continues: 7, 11, 31, 62, 124, 228)
    ↓
Day 228: Final Review → Topic Mastered ✅
```

## 📱 UI Elements

### Badges
- **Priority Badges**: 🟢 Low | 🟡 Medium | 🔴 High
- **Difficulty**: Easy | Moderate | Hard
- **Status**: Pending | ✓ Completed

### Colors
- Primary (Blue): #3b82f6
- Success (Green): #10b981
- Warning (Orange): #f59e0b
- Danger (Red): #ef4444

## 🔌 API Summary

### Authentication
```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Topics (Main CRUD)
```bash
GET    /api/topics              # All topics or filtered
POST   /api/topics              # Create
PUT    /api/topics/:id          # Update
PATCH  /api/topics/:id/mark-read # Mark complete
DELETE /api/topics/:id          # Delete
```

### Subjects
```bash
GET    /api/subjects            # All subjects
POST   /api/subjects            # Create
PUT    /api/subjects/:id        # Update
DELETE /api/subjects/:id        # Delete
```

### Notifications
```bash
GET    /api/notifications       # All notifications
PATCH  /api/notifications/:id/read  # Mark read
GET    /api/notifications/count/unread  # Unread count
```

## 💾 Database Quick Reference

### Key Collections

**Topics Collection Sample**
```json
{
  "_id": "ObjectId",
  "title": "The Mughal Empire",
  "subject": "ObjectId(SubjectId)",
  "user": "ObjectId(UserId)",
  "isRead": false,
  "repetitionCount": 0,
  "nextReviewDate": "2024-12-20T00:00:00.000Z",
  "priority": "high",
  "difficulty": "moderate",
  "notes": "Focus on Akbar's reign",
  "createdAt": "2024-12-19T00:00:00.000Z"
}
```

**Subject Collection Sample**
```json
{
  "_id": "ObjectId",
  "name": "History",
  "icon": "📚",
  "color": "#3b82f6",
  "user": "ObjectId(UserId)",
  "topics": ["ObjectId", "ObjectId"],
  "createdAt": "2024-12-19T00:00:00.000Z"
}
```

## 🎯 Common Tasks

### Create New Subject
1. Go to **Subjects** page
2. Click **"+ Add Subject"**
3. Fill name, icon, color
4. Click **"Create"**

### Add Topic to Subject
1. Go to **Topics** page
2. Click **"+ Add Topic"**
3. Fill: Title, Subject, Priority, Difficulty
4. Optionally add notes
5. Click **"Create"**

### Complete a Topic (Start Spaced Repetition)
1. Find topic in **Topics** page or **Dashboard**
2. Click ✓ (checkmark) button
3. System calculates next review date
4. Notification scheduled automatically

### Track Progress
1. Go to **Dashboard**
2. See stats: Total, Completed, Pending, Upcoming
3. View recent topics
4. Check subject progress bars

### Manage Notifications
1. Click 🔔 (Bell) in navbar
2. See all notifications
3. Click ✓ to mark as read
4. Filter by status: All / Unread / Read

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check email/password, ensure account exists |
| Topics not showing | Verify subject was selected, check filters |
| Notifications not appearing | Check topic nextReviewDate, restart server |
| 404 errors | Verify all dependencies installed: `npm run install-all` |
| MongoDB error | Check connection string, ensure MongoDB running |

## 📊 Performance Tips

- Mark topics complete regularly to maintain momentum
- Check notifications daily for optimal learning
- Use high priority for important topics
- Review recommended days even if not notified
- Export progress periodically (future feature)

## 🔐 Security Reminders

- Never share your JWT token
- Change JWT_SECRET in production
- Use strong passwords
- Clear browser cache if issues occur

## 📚 File Structure Reference

```
server/
├── models/
│   ├── User.js          # User schema
│   ├── Subject.js       # Subject schema
│   ├── Topic.js         # Topic with spaced repetition logic
│   └── Notification.js  # Notification schema
├── routes/
│   ├── auth.js          # Auth endpoints
│   ├── subjects.js      # Subject endpoints
│   ├── topics.js        # Topic endpoints
│   └── notifications.js # Notification endpoints
├── middleware/
│   └── auth.js          # JWT verification
└── utils/
    └── notifications.js # Notification helpers

client/src/
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── SubjectsPage.js
│   ├── TopicsPage.js
│   └── NotificationsPage.js
├── components/
│   ├── Navbar.js
│   ├── Modal.js
│   ├── StatsCard.js
│   └── PrivateRoute.js
├── services/
│   └── api.js           # All API calls
├── store/
│   └── authStore.js     # Zustand auth state
└── styles/
    ├── App.css
    ├── navbar.css
    ├── dashboard.css
    ├── modal.css
    ├── subjects.css
    ├── topics.css
    └── notifications.css
```

## 🎓 Learning Resources

- **MongoDB**: https://docs.mongodb.com/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/
- **Spaced Repetition**: https://en.wikipedia.org/wiki/Spaced_repetition

## 💡 Pro Tips

1. **Batch create topics** for each subject at the start of study session
2. **Set priorities** to focus on harder topics first
3. **Add detailed notes** for complex topics
4. **Review the pattern** to understand spaced repetition
5. **Trust the system** - don't over-study, follow the schedule

---

**Happy Studying! For more details, check README.md and ARCHITECTURE.md** 📚
