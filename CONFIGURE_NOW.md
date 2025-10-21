# 🎯 Configure Your Deployment RIGHT NOW

Your apps are deployed! Now let's connect them together.

## Your URLs:
- ✅ **Frontend**: https://labmate-frontend.vercel.app/
- ✅ **Backend**: https://labmate-backend.onrender.com

---

## 🔴 ACTION 1: Configure Vercel (2 minutes)

### Go to Vercel Dashboard

1. **Open**: https://vercel.com/dashboard
2. **Click** on your `labmate-frontend` project
3. **Click** `Settings` tab
4. **Click** `Environment Variables` in left sidebar

### Add This Variable

Click **Add New**:

**Name (Key)**:
```
VITE_API_URL
```

**Value**:
```
https://labmate-backend.onrender.com/api
```

**Environment**: All (Production, Preview, Development)

5. **Click** `Save`

### Redeploy Frontend

6. **Click** `Deployments` tab at top
7. **Find** the latest deployment
8. **Click** the `...` (three dots) button
9. **Click** `Redeploy`
10. **Click** `Redeploy` again to confirm

✅ **Wait ~1 minute** for deployment to complete

---

## 🔴 ACTION 2: Configure Render (3 minutes)

### Go to Render Dashboard

1. **Open**: https://dashboard.render.com/
2. **Click** on your `labmate-backend` service
3. **Click** `Environment` in left sidebar

### Update These Variables

**Find** `FRONTEND_URL` and **change** to:
```
https://labmate-frontend.vercel.app
```

**Find** `CORS_ORIGIN` and **change** to:
```
https://labmate-frontend.vercel.app
```

**Find** `GOOGLE_CALLBACK_URL` and **change** to:
```
https://labmate-backend.onrender.com/api/auth/google/callback
```

4. **Click** `Save Changes` at the bottom

✅ **Wait ~2 minutes** for automatic redeployment

---

## 🔴 ACTION 3: Update Google OAuth (2 minutes)

**Only if you're using Google Login!** (If not, skip this)

### Go to Google Cloud Console

1. **Open**: https://console.cloud.google.com/
2. **Click** `APIs & Services` → `Credentials`
3. **Click** your OAuth 2.0 Client ID

### Add Production URLs

**Authorized JavaScript origins** - Click `+ ADD URI`:
```
https://labmate-frontend.vercel.app
```

**Authorized redirect URIs** - Click `+ ADD URI`:
```
https://labmate-backend.onrender.com/api/auth/google/callback
```

4. **Click** `SAVE` at the bottom

✅ **Done!** Google OAuth is configured

---

## ✅ ACTION 4: Test Everything (5 minutes)

### Test 1: Backend Health Check

**Open this URL in a new tab**:
```
https://labmate-backend.onrender.com/api/health
```

**You should see**:
```json
{
  "success": true,
  "message": "LabMate360 Backend API is running",
  "environment": "production"
}
```

⚠️ **If it takes 30+ seconds**: Backend was sleeping (normal for free tier)  
❌ **If you see an error**: Check Render logs

---

### Test 2: Frontend Works

**Open**:
```
https://labmate-frontend.vercel.app/
```

**Check**:
- ✅ Page loads
- ✅ No errors in browser console (Press F12 to check)
- ✅ Navigation works

---

### Test 3: Frontend ↔ Backend Connection

1. **Open** https://labmate-frontend.vercel.app/
2. **Press F12** to open DevTools
3. **Click** `Console` tab
4. **Try to login** or use any feature that calls the API
5. **Check Console** for errors:

**✅ GOOD** - No CORS errors  
**❌ BAD** - See red CORS error → Go back and check Render `CORS_ORIGIN`

---

### Test 4: Complete Feature Test

**Test these if applicable**:
- [ ] User registration works
- [ ] Login works
- [ ] Dashboard loads
- [ ] API calls succeed (check Network tab in F12)
- [ ] Google OAuth login works (if configured)
- [ ] No 404 errors for API calls

---

## 🎉 Success Checklist

After all actions, you should have:

- [x] Vercel has `VITE_API_URL` environment variable
- [x] Vercel frontend redeployed
- [x] Render has correct `FRONTEND_URL` 
- [x] Render has correct `CORS_ORIGIN`
- [x] Render backend redeployed
- [x] Google OAuth URLs updated (if using)
- [x] Backend health check returns success
- [x] Frontend loads without errors
- [x] No CORS errors in browser console
- [x] API calls work correctly

---

## 🚨 Troubleshooting

### Problem: CORS Error in Browser Console

**Error**: `blocked by CORS policy`

**Fix**:
1. Go to Render → Environment
2. Check `CORS_ORIGIN` is **exactly**: `https://labmate-frontend.vercel.app`
3. **No trailing slash!**
4. Save and wait for redeploy

---

### Problem: API Calls Return 404

**Error**: `404 Not Found` for API calls

**Fix**:
1. Check Vercel `VITE_API_URL` includes `/api` at the end
2. Should be: `https://labmate-backend.onrender.com/api`
3. Redeploy Vercel

---

### Problem: Backend Very Slow (30+ seconds)

**Cause**: Render free tier spins down after 15 min

**Solutions**:
- **Accept it** (it's free tier behavior)
- **Upgrade** to Render Standard ($7/month) - no cold starts
- **Use cron job** to ping backend every 10 min (keeps it awake)

---

### Problem: Google OAuth Fails

**Error**: Redirect URI mismatch

**Fix**:
1. Go to Google Console
2. Check redirect URI is **exactly**:
   `https://labmate-backend.onrender.com/api/auth/google/callback`
3. Must use HTTPS (not HTTP)
4. No trailing slash
5. Save and try again

---

## 📊 What Happens After Configuration

**Your App Architecture**:

```
User Browser
    ↓
Vercel (Frontend)
    ↓ API Calls
Render (Backend)
    ↓ Database Queries
MongoDB Atlas (Database)
```

**All connected via**:
- Environment variables
- CORS configuration
- OAuth redirect URIs

---

## 💡 Next Steps After Configuration

1. **Monitor** your deployments:
   - Vercel Analytics: Check traffic
   - Render Logs: Check for errors
   - MongoDB Atlas: Monitor database

2. **Test thoroughly**:
   - All user flows
   - All features
   - Different browsers
   - Mobile devices

3. **Share** your app:
   - Your app is live at: https://labmate-frontend.vercel.app/
   - Share with users, testers, stakeholders

4. **Optional upgrades**:
   - Custom domain (Vercel + Render)
   - Render paid tier ($7/mo) - no cold starts
   - File storage (S3/Cloudinary)
   - Monitoring tools

---

## ⏱️ Time Required

- **Vercel Config**: 2 minutes
- **Render Config**: 3 minutes
- **Google OAuth**: 2 minutes
- **Testing**: 5 minutes
- **Total**: ~12 minutes

---

## 🎯 You're Almost There!

Follow the 4 actions above, and your app will be fully operational!

**Start with ACTION 1** ↑↑↑

---

**Need help?** Check `PRODUCTION_CONFIGURATION.md` for detailed troubleshooting.

