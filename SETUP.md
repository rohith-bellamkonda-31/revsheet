# RevSheet - Setup & Configuration Guide

## Quick Start

### 1. Install Root Dependencies
```bash
npm run install-all
```

This will install dependencies for both server and client.

### 2. Configure Environment Variables

**Server (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/revsheet
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running locally or update MONGODB_URI to your MongoDB Atlas connection string.

### 4. Run Both Services
```bash
npm run dev
```

This will start both the backend server (port 5000) and React frontend (port 3000) concurrently.

## 🗄️ Database Schema

### User Collection
- name: String
- email: String (unique)
- password: String (hashed)
- subjects: [ObjectId]
- timestamps

### Subject Collection
- name: String (required)
- description: String
- icon: String (emoji)
- color: String (hex)
- user: ObjectId (ref: User)
- topics: [ObjectId]
- timestamps

### Topic Collection
- title: String (required)
- description: String
- subject: ObjectId (ref: Subject)
- user: ObjectId (ref: User)
- dateAdded: Date
- nextReviewDate: Date
- isRead: Boolean
- readDate: Date
- repetitionCount: Number
- notificationsSent: Array
- priority: 'low' | 'medium' | 'high'
- difficulty: 'easy' | 'moderate' | 'hard'
- notes: String
- bookmarked: Boolean
- timestamps

### Notification Collection
- user: ObjectId (ref: User)
- topic: ObjectId (ref: Topic)
- type: 'review_reminder' | 'completion'
- message: String
- dayCount: Number
- isRead: Boolean
- readAt: Date
- timestamps (with 90-day expiry)

## 🔐 Security Notes

- All passwords are hashed using bcryptjs with 10 salt rounds
- JWT tokens expire in 7 days
- Use a strong JWT_SECRET in production
- Implement HTTPS in production
- Add CORS_ORIGIN environment variable for production

## 📊 Monitoring Notifications

The system checks for topics due for review every hour using node-cron. To modify this:

Edit `server/server.js` line 40:
```javascript
// Change from '0 * * * *' to your desired cron schedule
cron.schedule('0 * * * *', async () => {
  // notification check logic
});
```

## 🚀 Production Deployment

### Environment Variables for Production
```
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/revsheet
JWT_SECRET=generate_a_strong_random_key
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Build Frontend
```bash
cd client
npm run build
```

### Serve Production Build
```bash
cd server
NODE_ENV=production npm start
```

Then serve the `client/build` folder using a static file server or deploy to CDN.

## 🔗 API Response Format

All API responses follow this format:

**Success (2xx)**
```json
{
  "data": {...},
  "message": "Success message"
}
```

**Error (4xx, 5xx)**
```json
{
  "message": "Error message",
  "error": "Error details"
}
```

## 🧪 Testing the API

Use Postman or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Create Subject
curl -X POST http://localhost:5000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"History","icon":"📚","color":"#3b82f6"}'
```

## 📱 Mobile Responsive

The app is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (below 768px)

## 🎓 Educational Use

This tracker is designed specifically for UPSC preparation with:
- 9-level spaced repetition (proven learning technique)
- Subject-based organization
- Difficulty assessment
- Priority management

Good luck with your UPSC preparation! 🎯
