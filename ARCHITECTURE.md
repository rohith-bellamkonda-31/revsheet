# Architecture & Implementation Guide for RevSheet

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (React)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Navbar │ Dashboard │ Subjects │ Topics │ Notifications  │ │
│  └────────────────────────────────────────────────────────┘ │
│  State: Zustand Auth Store                                  │
│  HTTP: Axios with JWT Auth                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API Calls
┌──────────────────▼──────────────────────────────────────────┐
│                 SERVER SIDE (Express)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Auth Routes │ Topics Routes │ Subjects │ Notifications  │ │
│  └────────────────────────────────────────────────────────┘ │
│  Middleware: JWT Verification, CORS                         │
│  Cron Jobs: Notification Check (hourly)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ Queries/Updates
┌──────────────────▼──────────────────────────────────────────┐
│              MONGODB DATABASE                               │
│  Collections: Users, Subjects, Topics, Notifications        │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Topic with Spaced Repetition

1. **User Creates Topic** (TopicsPage.js)
   - Form submission with title, subject, priority, difficulty
   - `topicsAPI.create(formData)`

2. **Backend Receives Request** (routes/topics.js)
   - Validates input with express-validator
   - Checks user authorization
   - Creates Topic document with initial nextReviewDate (Day 1)

3. **Topic Saved** (models/Topic.js)
   - MongoDB stores topic with repetitionCount = 0
   - nextReviewDate = Date.now() + 1 day

4. **User Reviews and Marks Complete**
   - Calls `topicsAPI.markAsRead(topicId)`
   - Backend calls `topic.markAsRead()` method

5. **Spaced Repetition Logic** (Topic Model)
   ```javascript
   markAsRead() {
     this.isRead = true;
     this.repetitionCount += 1;
     const nextDay = SPACED_REPETITION_DAYS[this.repetitionCount];
     this.nextReviewDate = Date.now() + (nextDay * 24 * 60 * 60 * 1000);
   }
   ```

6. **Notification Creation** (routes/topics.js)
   - After marking as read, if nextDay exists, create Notification
   - Save to notifications collection

7. **Cron Job** (server.js)
   - Every hour, checks topics where nextReviewDate is today
   - Creates notifications for due topics
   - User sees in Notifications page

## Component Hierarchy

```
App
├── Router
│   ├── LoginPage
│   ├── RegisterPage
│   └── PrivateRoute
│       ├── Navbar
│       ├── DashboardPage
│       │   ├── StatsCard (x4)
│       │   └── Subject Cards
│       ├── SubjectsPage
│       │   ├── Modal
│       │   └── Subject Cards
│       ├── TopicsPage
│       │   ├── Modal
│       │   └── Topic Cards
│       └── NotificationsPage
│           └── Notification Items
```

## State Management (Zustand)

### Auth Store
```javascript
{
  user: { id, name, email }
  token: JWT token
  isAuthenticated: boolean
  setAuth(user, token)
  logout()
  checkAuth()
}
```

## API Call Flow

### Example: Create Topic
1. User fills form in TopicsPage
2. `handleSubmit()` validates form data
3. Calls `topicsAPI.create(formData)`
4. Axios includes `Authorization: Bearer ${token}` header
5. Server validates JWT in auth middleware
6. Controller creates topic in DB
7. Response returned with populated topic
8. UI updates list and shows toast notification

## Notification System

### Notification Triggers
1. **User Marks Topic Complete**: Creates notification for next review date
2. **Cron Job (Hourly)**: Checks and creates notifications for due topics
3. **Manual Refresh**: User can manually check notifications

### Notification Lifecycle
- Created when topic is marked as read or on schedule
- Stored in DB with isRead flag
- User can mark as read in Notifications page
- Auto-deleted after 90 days (TTL index)

## Security Features

1. **Authentication**: JWT tokens issued on login/register
2. **Authorization**: Auth middleware checks token on protected routes
3. **Password Hashing**: bcryptjs with 10 salt rounds
4. **Input Validation**: express-validator on all inputs
5. **User Isolation**: All queries filtered by user ID

## Performance Optimizations

1. **Lazy Loading**: Only load visible data
2. **Memoization**: React components wrapped in React.memo where needed
3. **Debouncing**: Search queries debounced
4. **Pagination**: Notifications limited to 50 per page
5. **Caching**: Auth data stored in localStorage

## Error Handling

1. **Frontend**: try-catch with toast notifications
2. **Backend**: Express error middleware catches exceptions
3. **Validation**: Input validation with meaningful error messages
4. **Network**: Axios interceptors for retry logic (can be added)

## Scaling Considerations

### Current Limitations
- Single MongoDB instance
- No caching layer (Redis)
- No rate limiting

### For Production Scale
1. Add Redis for session/cache management
2. Implement rate limiting with express-rate-limit
3. Add database indexing on frequently queried fields
4. Implement pagination for large datasets
5. Add compression middleware

## Testing Strategy

### Unit Tests (Jest)
```javascript
// Example test for Topic.markAsRead()
test('markAsRead increases repetitionCount', () => {
  const topic = new Topic({ repetitionCount: 0 });
  topic.markAsRead();
  expect(topic.repetitionCount).toBe(1);
});
```

### Integration Tests (Supertest)
```javascript
// Test API endpoint
test('POST /api/topics creates topic', async () => {
  const res = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test', subjectId: '...' });
  expect(res.status).toBe(201);
});
```

### E2E Tests (Cypress)
```javascript
// Test user workflow
cy.visit('/login');
cy.get('input[type="email"]').type('user@test.com');
cy.get('input[type="password"]').type('password');
cy.get('button[type="submit"]').click();
cy.url().should('include', '/dashboard');
```

## Future Enhancements

1. **Offline Support**: Service Worker for offline access
2. **Mobile App**: React Native version
3. **Collaboration**: Share study plans with friends
4. **AI Integration**: Topic recommendation based on performance
5. **Advanced Analytics**: Learning curve analysis
6. **Export**: PDF/CSV export of progress
7. **Integration**: Calendar sync, reminder integrations
8. **Gamification**: Badges, streaks, leaderboards

## Troubleshooting Common Issues

### Issue: Notifications not generating
**Solution**: Check cron job in server.js, ensure MongoDB is running, check topic nextReviewDate values

### Issue: Topics not appearing after creation
**Solution**: Clear browser cache, check API response, verify subject ID is correct

### Issue: Authentication failing
**Solution**: Verify JWT_SECRET matches, check token expiry, clear localStorage

---

For more details, refer to README.md and SETUP.md files.
