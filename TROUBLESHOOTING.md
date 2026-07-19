# RevSheet - Verification Checklist & Troubleshooting

## ✅ Pre-Launch Verification Checklist

### 1. Project Structure Verification
```bash
# Run this to verify all files exist:

✓ Root Level:
  □ README.md
  □ QUICK_START.md
  □ SETUP.md
  □ ARCHITECTURE.md
  □ PROJECT_OVERVIEW.md
  □ UI_FLOW_GUIDE.md
  □ package.json
  □ .gitignore

✓ Server Directory (RevSheet/server/):
  □ server.js
  □ package.json
  □ .env.example
  □ models/ (User.js, Subject.js, Topic.js, Notification.js)
  □ routes/ (auth.js, subjects.js, topics.js, notifications.js)
  □ middleware/ (auth.js)
  □ utils/ (notifications.js)

✓ Client Directory (RevSheet/client/):
  □ package.json
  □ public/index.html
  □ src/
    □ App.js
    □ App.css
    □ index.js
    □ pages/ (LoginPage, RegisterPage, DashboardPage, SubjectsPage, TopicsPage, NotificationsPage)
    □ components/ (Navbar, Modal, StatsCard, PrivateRoute)
    □ services/ (api.js)
    □ store/ (authStore.js)
    □ styles/ (All CSS files)
```

### 2. Dependencies Verification
```bash
# Backend dependencies should include:
✓ express
✓ mongoose
✓ cors
✓ dotenv
✓ bcryptjs
✓ jsonwebtoken
✓ express-validator
✓ node-cron

# Frontend dependencies should include:
✓ react
✓ react-router-dom
✓ axios
✓ zustand
✓ framer-motion
✓ react-hot-toast
✓ react-icons
✓ date-fns
```

### 3. Environment Configuration
```bash
✓ server/.env file created (copy from .env.example)
✓ PORT set to 5000
✓ MONGODB_URI correctly configured
✓ JWT_SECRET set to a secure value
✓ NODE_ENV set to 'development'

✓ client/package.json has proxy: "http://localhost:5000"
```

### 4. Code Quality Checks
```bash
✓ No console.error() statements without try-catch
✓ All imports are correct
✓ No hardcoded URLs (use environment variables)
✓ API endpoints match between frontend and backend
✓ Component props are properly destructured
✓ Modal state management is consistent
```

## 🚀 Launch Verification

### Before Starting:
```bash
# 1. Ensure MongoDB is running
mongod  # or connect to MongoDB Atlas if using cloud

# 2. Install all dependencies
cd RevSheet
npm run install-all

# 3. Create .env file in server/
cp server/.env.example server/.env
# Edit server/.env and add your MongoDB URI

# 4. Verify Node.js version
node --version  # Should be v14 or higher

# 5. Verify npm version
npm --version   # Should be v6 or higher
```

### Starting the Application:
```bash
# From project root (RevSheet/)
npm run dev

# This will start:
# - Backend: http://localhost:5000
# - Frontend: http://localhost:3000
```

## 🧪 Post-Launch Testing

### 1. Backend Health Check
```bash
# Test if server is running:
curl http://localhost:5000/api/health
# Expected: {"status": "Server is running"}
```

### 2. Authentication Flow Test
```bash
# Register a new user:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Expected: {token, user{id, name, email}}
```

### 3. Create Subject Test
```bash
# Save the token from registration, then:
curl -X POST http://localhost:5000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"History","icon":"📚","color":"#3b82f6"}'

# Expected: Subject object with _id
```

### 4. Frontend Functionality Test
```
1. Open http://localhost:3000
2. Should redirect to /login
3. Click "Register here" link
4. Fill in registration form
5. Click Register → Should redirect to dashboard
6. Check that navbar is visible
7. Create a subject from Subjects page
8. Add a topic from Topics page
9. Mark topic as complete
10. Check Notifications page
11. Verify stats update on Dashboard
```

## 🐛 Common Issues & Solutions

### Issue: Cannot connect to MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Start MongoDB: mongod (if local)
2. OR update MONGODB_URI in .env to MongoDB Atlas
3. Check MongoDB is running: mongo
4. Restart server: npm run dev
```

### Issue: Port 5000 already in use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
1. Kill process on port 5000:
   Windows: netstat -ano | findstr :5000 → taskkill /PID {pid} /F
   Mac/Linux: lsof -i :5000 → kill -9 {pid}
2. OR change PORT in server/.env
3. Restart server
```

### Issue: Port 3000 already in use
```
Error: Port 3000 is already in use

Solution:
1. Change port in client/package.json scripts
2. OR: set PORT=3001 in terminal before npm start
3. OR kill process on port 3000 (see above)
```

### Issue: Module not found errors
```
Error: Cannot find module 'express'

Solution:
1. Ensure you're in correct directory:
   cd server/
2. Run: npm install
3. Verify node_modules/ folder exists
4. Restart server: npm run dev
```

### Issue: JWT authentication failing
```
Error: Token is not valid / No token

Solution:
1. Ensure JWT_SECRET is set in server/.env
2. Check token is being sent: Authorization: Bearer {token}
3. Verify token hasn't expired (7 days)
4. Clear localStorage and re-login: localStorage.clear()
```

### Issue: CORS errors in browser console
```
Error: Access to XMLHttpRequest has been blocked by CORS policy

Solution:
1. Verify CORS is enabled in server.js: app.use(cors())
2. Check client package.json has proxy setting
3. Ensure backend is running on http://localhost:5000
4. Clear browser cache and restart frontend
```

### Issue: Topics not showing after creation
```
Solution:
1. Verify subject was selected correctly
2. Check MongoDB for inserted data: db.topics.find()
3. Ensure API response is 201 (created)
4. Clear browser cache: Ctrl+Shift+Del
5. Check browser console for errors
```

### Issue: Notifications not generating
```
Solution:
1. Verify nextReviewDate is set correctly in topic
2. Check cron job is running (server logs)
3. Ensure MongoDB has notifications collection
4. Manually test: curl /api/topics/notifications/today
5. Check server date/time is correct
```

### Issue: Styling looks broken
```
Solution:
1. Clear browser cache: Ctrl+Shift+Del
2. Hard refresh: Ctrl+Shift+R
3. Check CSS files are importing in index.js
4. Verify all CSS files are in src/styles/ directory
5. Check for CSS syntax errors in browser DevTools
```

## 🔍 Debugging Tips

### Enable Debug Logging
```javascript
// In server.js, add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// In client API calls:
axios.interceptors.request.use(config => {
  console.log('API Call:', config);
  return config;
});
```

### Check Database
```bash
# Connect to MongoDB:
mongo
use revsheet
db.topics.find()
db.subjects.find()
db.users.find()
db.notifications.find()

# Check data:
db.topics.count()
db.topics.find().limit(5).pretty()
```

### Browser DevTools
```
1. Open DevTools: F12
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for localStorage tokens
5. Check Storage → Cookies for session data
```

### Server Logs
```bash
# Watch server logs:
npm run dev

# Look for:
✓ "MongoDB connected"
✓ "Server running on port 5000"
✗ Connection errors
✗ Authentication errors
✗ Database operation errors
```

## ✨ Performance Verification

### Frontend Performance
```
- Pages load in < 2 seconds
- Modals open smoothly
- No lag on interactions
- Animations are smooth
- Responsive design works
```

### Backend Performance
```
- API endpoints respond in < 500ms
- No memory leaks (check with: node --inspect server.js)
- Database queries are indexed
- Cron jobs run on schedule
```

## 🔐 Security Verification

### Checklist
```
✓ Passwords are hashed (check DB: db.users.findOne() → password hash)
✓ JWT tokens are validated
✓ All routes require authentication (except auth routes)
✓ User data is isolated by userId
✓ No sensitive data in console logs
✓ CORS is properly configured
✓ Input validation is working
```

## 📝 Pre-Deployment Checklist

```
✓ All environment variables configured
✓ No console.logs with sensitive data
✓ Error handling for all API calls
✓ Loading states implemented
✓ Empty states handled
✓ Responsive design tested on mobile
✓ All features tested
✓ Database backup taken
✓ .env file not committed to git
✓ Production URLs configured
```

## 🆘 Still Having Issues?

### Check Logs
```
1. Backend: npm run dev → Check terminal output
2. Frontend: Browser Console → F12 → Console tab
3. Database: Use MongoDB Compass to inspect collections
4. Network: Browser DevTools → Network tab → See requests/responses
```

### Verify Assumptions
```
1. Is MongoDB running?
2. Is Node.js version correct? (v14+)
3. Is npm version correct? (v6+)
4. Are all files created?
5. Are all dependencies installed?
6. Are environment variables set?
7. Is the PORT available?
8. Is the JWT_SECRET unique?
```

### Reset & Restart
```bash
# Complete reset:
rm -rf node_modules package-lock.json
npm run install-all
npm run dev

# If that doesn't work:
1. Close both servers
2. Kill any Node processes
3. Restart MongoDB
4. Clear browser cache
5. npm run dev (try again)
```

---

**If issues persist, refer to README.md or check terminal output for specific error messages!** 🔧
