# 🚀 START HERE - LabMate360 Configuration

## ✅ Your Apps Are Deployed!

- **Frontend:** https://labmate-frontend.vercel.app/
- **Backend:** https://labmate-backend.onrender.com

**But they need to be connected!** Follow this simple guide.

---

## 🎯 3 Simple Steps (10 minutes)

### 📱 Step 1: Configure Vercel (2 min)

**Open this file:** `VERCEL_SETUP.md`

**Quick action:**
1. Go to Vercel Dashboard
2. Add environment variable: `VITE_API_URL` = `https://labmate-backend.onrender.com/api`
3. Redeploy

---

### ⚙️ Step 2: Configure Render (3 min)

**Open this file:** `RENDER_SETUP.md`

**Quick action:**
1. Go to Render Dashboard
2. Update `FRONTEND_URL` = `https://labmate-frontend.vercel.app`
3. Update `CORS_ORIGIN` = `https://labmate-frontend.vercel.app`
4. Save (auto-redeploys)

---

### 🔐 Step 3: Configure Google OAuth (2 min) - *Optional*

**Open this file:** `GOOGLE_OAUTH_SETUP.md`

**Only if using Google Login!**
- Add production URLs to Google Cloud Console

---

### ✅ Step 4: Test (5 min)

**Backend Test:**
Visit: https://labmate-backend.onrender.com/api/health

**Frontend Test:**
Visit: https://labmate-frontend.vercel.app/

---

## 📚 All Setup Files

1. **START_HERE.md** (this file) - Overview
2. **VERCEL_SETUP.md** - Vercel configuration
3. **RENDER_SETUP.md** - Render configuration
4. **GOOGLE_OAUTH_SETUP.md** - Google OAuth (optional)
5. **DEPLOYMENT_CONFIG.md** - Complete guide with troubleshooting

---

## 🎉 That's It!

After these steps, your app will be fully functional at:
**https://labmate-frontend.vercel.app/**

---

## ⏱️ Time: ~10 minutes
## 🔧 Difficulty: Easy (copy-paste values)
## 💰 Cost: $0 (free tiers)

**Begin with Step 1** → Open `VERCEL_SETUP.md`

