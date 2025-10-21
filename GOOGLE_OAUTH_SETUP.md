# 🔐 Google OAuth Configuration for Production

## Only complete this if you're using Google OAuth login!

---

## Update Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **OAuth 2.0 Client ID**

---

## Add Production URLs

### Authorized JavaScript Origins

Click **+ ADD URI** and add:
```
https://labmate-frontend.vercel.app
```

Keep the existing `http://localhost:5173` for local development.

### Authorized Redirect URIs

Click **+ ADD URI** and add:
```
https://labmate-backend.onrender.com/api/auth/google/callback
```

Keep the existing `http://localhost:5000/api/auth/google/callback` for local development.

---

## Save

1. Click **SAVE** at the bottom
2. Wait a few seconds for changes to propagate

---

## ✅ Done!

Google OAuth will now work in production!

---

## Your OAuth URLs Summary:

**Development:**
- Origin: http://localhost:5173
- Callback: http://localhost:5000/api/auth/google/callback

**Production:**
- Origin: https://labmate-frontend.vercel.app
- Callback: https://labmate-backend.onrender.com/api/auth/google/callback

