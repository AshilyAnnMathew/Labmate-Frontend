# 🚀 LabMate360 - AI-Powered Smart Clinical Laboratory Software

[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black)](https://labmate-frontend.vercel.app/)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7)](https://labmate-backend.onrender.com)

> **Live App:** [https://labmate-frontend.vercel.app/](https://labmate-frontend.vercel.app/)

---

## 📋 Project Overview

LabMate360 is a modern, full-stack clinical laboratory management system with role-based access, AI-powered features, and comprehensive booking management.

### Tech Stack

**Frontend:**
- React 19.1.1
- Vite
- Tailwind CSS
- Framer Motion
- Google Maps API
- Google Gemini AI

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Google OAuth 2.0
- Razorpay Payments
- Nodemailer

---

## 🌐 Deployment Information

### Live URLs

- **Frontend:** https://labmate-frontend.vercel.app/
- **Backend:** https://labmate-backend.onrender.com
- **Backend Health Check:** https://labmate-backend.onrender.com/api/health

### Deployment Platforms

- **Frontend**: Vercel (Auto-deploy from Git)
- **Backend**: Render (Auto-deploy from Git)
- **Database**: MongoDB Atlas (Cloud)

---

## ⚙️ Configuration Status

### ✅ Code Configuration (Complete)

- ✅ Frontend uses environment variables for API URL
- ✅ Backend uses environment variables for CORS
- ✅ No hardcoded URLs in codebase
- ✅ All routes properly configured with `/api` prefix

### 🔧 Platform Configuration (Required)

You need to add environment variables to the deployment platforms:

#### **Quick Setup (10 minutes):**

1. **Open:** `START_HERE.md` 
2. **Follow:** 3 simple steps
3. **Test:** Your live app!

#### **Detailed Guides:**

- `VERCEL_SETUP.md` - Configure Vercel
- `RENDER_SETUP.md` - Configure Render
- `GOOGLE_OAUTH_SETUP.md` - Configure Google OAuth
- `DEPLOYMENT_CONFIG.md` - Complete deployment guide

---

## 🚀 Quick Start

### Platform Configuration

#### 1. Vercel (Frontend)
```bash
# Add this environment variable in Vercel Dashboard:
VITE_API_URL=https://labmate-backend.onrender.com/api
```

#### 2. Render (Backend)
```bash
# Update these environment variables in Render Dashboard:
FRONTEND_URL=https://labmate-frontend.vercel.app
CORS_ORIGIN=https://labmate-frontend.vercel.app
GOOGLE_CALLBACK_URL=https://labmate-backend.onrender.com/api/auth/google/callback
```

#### 3. Test
Visit: https://labmate-frontend.vercel.app/

---

## 📁 Project Structure

```
labmate/
├── src/                        # Frontend React application
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components
│   ├── services/              # API service layer
│   ├── contexts/              # React contexts
│   └── layouts/               # Layout components
├── backend/                   # Backend Node.js application
│   ├── config/               # Configuration files
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic
│   └── server.js             # Entry point
└── Configuration Files        # Deployment guides (see below)
```

---

## 📚 Configuration Documentation

| File | Purpose |
|------|---------|
| **START_HERE.md** | Quick start guide (begin here) |
| **VERCEL_SETUP.md** | Vercel environment configuration |
| **RENDER_SETUP.md** | Render environment configuration |
| **GOOGLE_OAUTH_SETUP.md** | Google OAuth setup (optional) |
| **DEPLOYMENT_CONFIG.md** | Complete deployment guide |
| **CONFIGURE_NOW.md** | Step-by-step checklist |
| **CONFIGURATION_SUMMARY.txt** | Quick reference card |
| **VERCEL_ENV_CONFIG.txt** | Copy-paste Vercel variables |
| **RENDER_ENV_CONFIG.txt** | Copy-paste Render variables |

---

## 🎯 Features

### User Roles

- **Admin**: System-wide management, analytics, reports
- **Local Admin**: Lab-specific management
- **Staff**: Handle bookings, upload reports
- **Patient/User**: Book tests, view reports

### Key Features

- 🔐 JWT & Google OAuth Authentication
- 📱 Responsive Design (Mobile-first)
- 💳 Razorpay Payment Integration
- 📧 Email Notifications
- 📍 Google Maps Integration
- 🤖 AI-Powered Features (Gemini)
- 📊 Analytics & Reports
- 📄 PDF Report Generation
- 🔍 Advanced Search & Filters
- 🎨 Modern UI with Framer Motion

---

## 🛠️ Development

### Local Development Setup

#### Frontend
```bash
cd labmate
npm install
npm run dev
```

#### Backend
```bash
cd labmate/backend
npm install
npm run dev
```

### Environment Variables

**Frontend** (create `.env.local`):
```bash
VITE_API_URL=http://localhost:5000/api
```

**Backend** (create `.env`):
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
# ... other variables (see backend/env.example)
```

---

## 🧪 Testing

### Test Backend
```bash
curl https://labmate-backend.onrender.com/api/health
```

Should return:
```json
{
  "success": true,
  "message": "LabMate360 Backend API is running",
  "environment": "production"
}
```

### Test Frontend
1. Visit: https://labmate-frontend.vercel.app/
2. Open DevTools (F12)
3. Check for CORS errors (should be none)
4. Test login and features

---

## ⚠️ Known Limitations (Free Tier)

- **Render**: Backend sleeps after 15 min of inactivity (30s cold start)
- **File Storage**: Ephemeral disk (files deleted on restart)
- **Solution**: Upgrade to paid tier or use S3/Cloudinary

---

## 💰 Deployment Costs

### Current (Free Tier)
- **MongoDB Atlas**: $0 (512MB)
- **Render**: $0 (with cold starts)
- **Vercel**: $0 (100GB bandwidth)
- **Total**: $0/month

### Recommended (Production)
- **MongoDB Atlas**: $0-9/month
- **Render Standard**: $7/month (no cold starts)
- **Vercel Pro**: $20/month (optional)
- **File Storage (S3)**: $5-10/month
- **Total**: $12-46/month

---

## 📊 Architecture

```
User Browser
    ↓
Vercel CDN (Frontend)
    ↓ HTTPS/API Calls
Render (Backend API)
    ↓ MongoDB Protocol
MongoDB Atlas (Database)
```

---

## 🔒 Security

- ✅ HTTPS enforced (SSL auto-configured)
- ✅ CORS properly configured
- ✅ JWT token authentication
- ✅ Environment variables (no secrets in code)
- ✅ Input validation
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting recommended
- ✅ File upload restrictions

---

## 📈 Performance

- ⚡ Vite build optimization
- 🌐 Vercel global CDN
- 💾 MongoDB indexing
- 📦 Code splitting
- 🖼️ Image optimization
- 🔄 API request caching

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support

### Troubleshooting

**CORS Errors:**
- Check `CORS_ORIGIN` in Render matches Vercel URL exactly

**API 404 Errors:**
- Verify `VITE_API_URL` in Vercel includes `/api`

**Slow Backend:**
- Normal for free tier (cold start)
- Upgrade to Render paid tier

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

## 👨‍💻 Development Team

LabMate360 - AI-Powered Clinical Laboratory Management

---

## ✅ Getting Started Checklist

- [ ] Read `START_HERE.md`
- [ ] Configure Vercel environment variables
- [ ] Configure Render environment variables
- [ ] Update Google OAuth (if using)
- [ ] Test backend health endpoint
- [ ] Test frontend application
- [ ] Verify no CORS errors
- [ ] Test all major features
- [ ] Share app with users!

---

**🚀 Ready to configure?** → Open `START_HERE.md`

**🌐 Visit live app:** → https://labmate-frontend.vercel.app/

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Deployed & Configured
