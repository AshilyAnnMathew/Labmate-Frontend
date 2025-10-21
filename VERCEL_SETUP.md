# ⚙️ Vercel Configuration

## Your Frontend URL
https://labmate-frontend.vercel.app/

---

## Environment Variable to Add in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **labmate-frontend** project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**

### Variable to Add:

**Name:**
```
VITE_API_URL
```

**Value:**
```
https://labmate-backend.onrender.com/api
```

**Environments:** Select all (Production, Preview, Development)

5. Click **Save**

---

## Redeploy After Adding Variable

1. Go to **Deployments** tab
2. Click **...** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait ~1-2 minutes for deployment

---

## ✅ Done!

Your frontend will now connect to your backend at:
- Backend: https://labmate-backend.onrender.com

