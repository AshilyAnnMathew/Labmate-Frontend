# 🚀 LabMate360 - Production Configuration Guide

## Your Deployment URLs

- **Frontend (Vercel):** https://labmate-frontend.vercel.app/
- **Backend (Render):** https://labmate-backend.onrender.com

---

## Configuration Steps (10 minutes total)

### ✅ Step 1: Configure Vercel Frontend (2 min)

📄 **See:** `VERCEL_SETUP.md`

**Quick Summary:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://labmate-backend.onrender.com/api`
3. Save and Redeploy

---

### ✅ Step 2: Configure Render Backend (3 min)

📄 **See:** `RENDER_SETUP.md`

**Quick Summary:**
1. Go to Render Dashboard → Your Service → Environment
2. Update `FRONTEND_URL` = `https://labmate-frontend.vercel.app`
3. Update `CORS_ORIGIN` = `https://labmate-frontend.vercel.app`
4. Update `GOOGLE_CALLBACK_URL` = `https://labmate-backend.onrender.com/api/auth/google/callback`
5. Save (auto-redeploys)

---

### ✅ Step 3: Update Google OAuth (2 min) - *Optional*

📄 **See:** `GOOGLE_OAUTH_SETUP.md`

**Only if using Google Login!**

1. Go to Google Cloud Console → Credentials
2. Add production URLs to your OAuth client

---

### ✅ Step 4: Test Everything (5 min)

#### Test Backend
Visit: https://labmate-backend.onrender.com/api/health

Should see:
```json
{
  "success": true,
  "message": "LabMate360 Backend API is running",
  "environment": "production"
}
```

⚠️ **Note:** First request may take 30 seconds (Render free tier cold start)

#### Test Frontend
1. Visit: https://labmate-frontend.vercel.app/
2. Press `F12` to open DevTools
3. Check Console tab - should see **NO CORS errors**
4. Try logging in or using features

#### What to Check:
- ✅ Frontend loads
- ✅ No CORS errors in console
- ✅ API calls work
- ✅ Login works
- ✅ Google OAuth works (if configured)

---

## 🎯 Configuration Summary

| Platform | What to Configure | Value |
|----------|------------------|-------|
| **Vercel** | `VITE_API_URL` | `https://labmate-backend.onrender.com/api` |
| **Render** | `FRONTEND_URL` | `https://labmate-frontend.vercel.app` |
| **Render** | `CORS_ORIGIN` | `https://labmate-frontend.vercel.app` |
| **Render** | `GOOGLE_CALLBACK_URL` | `https://labmate-backend.onrender.com/api/auth/google/callback` |
| **Google Console** | Authorized Origins | `https://labmate-frontend.vercel.app` |
| **Google Console** | Redirect URIs | `https://labmate-backend.onrender.com/api/auth/google/callback` |

---

## 🔍 Troubleshooting

### CORS Error in Browser Console
**Error:** `Access-Control-Allow-Origin`

**Fix:**
1. Verify `CORS_ORIGIN` in Render is exactly: `https://labmate-frontend.vercel.app`
2. NO trailing slash!
3. Save and wait for Render to redeploy (~2 min)

### API Calls Return 404
**Fix:**
1. Verify Vercel `VITE_API_URL` includes `/api` at the end
2. Should be: `https://labmate-backend.onrender.com/api`

### Backend Very Slow (30+ seconds)
**Reason:** Render free tier spins down after 15 min of inactivity

**Solutions:**
- Accept it (it's normal for free tier)
- Upgrade to Render paid tier ($7/month) - no cold starts
- Use a cron job to ping backend every 10 min

### Google OAuth Fails
**Fix:**
1. Verify redirect URI in Google Console matches exactly
2. Must use HTTPS (not HTTP)
3. No trailing slashes

---

## 📊 Your App Architecture

```
User Browser
    ↓
Vercel (https://labmate-frontend.vercel.app/)
    ↓ API Calls
Render (https://labmate-backend.onrender.com)
    ↓ Database Queries
MongoDB Atlas
```

---

## ✅ Post-Configuration Checklist

- [ ] Vercel has `VITE_API_URL` environment variable
- [ ] Frontend redeployed in Vercel
- [ ] Render has `FRONTEND_URL` updated
- [ ] Render has `CORS_ORIGIN` updated
- [ ] Render has `GOOGLE_CALLBACK_URL` updated (if using OAuth)
- [ ] Backend redeployed in Render (automatic)
- [ ] Google OAuth URLs updated (if using OAuth)
- [ ] Backend health check returns success
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] Login works
- [ ] All features work correctly

---

## 🎉 Success!

Once configured, your LabMate360 app will be fully operational at:

**👉 https://labmate-frontend.vercel.app/**

Share this URL with your users!

---

## 📝 Quick Reference Files

- `VERCEL_SETUP.md` - Vercel configuration steps
- `RENDER_SETUP.md` - Render configuration steps  
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth setup
- `DEPLOYMENT_CONFIG.md` - This file (overview)

---

## ⏱️ Time Estimate

- Vercel setup: 2 minutes
- Render setup: 3 minutes
- Google OAuth: 2 minutes (if needed)
- Testing: 5 minutes
- **Total: ~10 minutes**

---

**Ready?** Start with `VERCEL_SETUP.md` → Then `RENDER_SETUP.md` → Test!

