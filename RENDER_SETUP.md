# ⚙️ Render Configuration

## Your Backend URL
https://labmate-backend.onrender.com

---

## Environment Variables to Update in Render

1. Go to: https://dashboard.render.com/
2. Select your **labmate-backend** service
3. Click **Environment** in left sidebar

---

## Variables to Update:

### 1. FRONTEND_URL
**Current value:** Probably `http://localhost:5173`  
**Change to:**
```
https://labmate-frontend.vercel.app
```

### 2. CORS_ORIGIN
**Current value:** Probably `http://localhost:5173`  
**Change to:**
```
https://labmate-frontend.vercel.app
```

### 3. GOOGLE_CALLBACK_URL (if using Google OAuth)
**Current value:** Probably `http://localhost:5000/api/auth/google/callback`  
**Change to:**
```
https://labmate-backend.onrender.com/api/auth/google/callback
```

### Other Variables (Keep as they are):
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI=<your_mongodb_uri>`
- `JWT_SECRET=<your_jwt_secret>`
- `GOOGLE_CLIENT_ID=<your_client_id>`
- `GOOGLE_CLIENT_SECRET=<your_client_secret>`
- `EMAIL_SERVICE=gmail`
- `EMAIL_USER=<your_email>`
- `EMAIL_PASS=<your_password>`
- `RAZORPAY_KEY_ID=<your_key>`
- `RAZORPAY_KEY_SECRET=<your_secret>`
- `MAX_FILE_SIZE=10485760`
- `UPLOAD_PATH=uploads`

---

## Save Changes

1. Click **Save Changes** at the bottom
2. Render will automatically redeploy
3. Wait ~2-3 minutes for deployment

---

## ✅ Done!

Your backend will now accept requests from:
- Frontend: https://labmate-frontend.vercel.app

