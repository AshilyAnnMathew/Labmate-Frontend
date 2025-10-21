# Google OAuth Setup Guide for LabMate360

This guide will walk you through setting up Google OAuth authentication for your LabMate360 application.

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- MongoDB database running
- LabMate360 backend and frontend setup

## Step 1: Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" or "New Project"
3. Click "New Project"
4. Enter a project name (e.g., "LabMate360")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and then "Enable"
4. Also enable "Google Identity and Access Management (IAM) API"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: LabMate360
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
8. Click "Update" then "Save and Continue"
9. On the "Test users" page, add test users (for testing phase)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Give it a name (e.g., "LabMate360 Web Client")
5. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

Create or update your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Other existing environment variables...
```

## Step 6: Install Dependencies

The following dependencies should already be installed:
```bash
npm install passport passport-google-oauth20 passport-jwt jsonwebtoken
```

## Step 7: Database Schema Updates

The User model has been updated to support Google OAuth:

```javascript
// New fields added to User model:
googleId: {
  type: String,
  unique: true,
  sparse: true
},
provider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local'
}
```

## Step 8: Testing the Implementation

### Backend Testing

1. Start your backend server:
   ```bash
   cd labmate/backend
   npm start
   ```

2. Test the Google OAuth endpoint:
   ```bash
   curl http://localhost:5000/api/auth/google
   ```
   This should redirect to Google's OAuth page.

### Frontend Testing

1. Start your frontend development server:
   ```bash
   cd labmate
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`
3. Click the "Continue with Google" button
4. Complete the Google OAuth flow
5. Verify that you're redirected back to the appropriate dashboard

## Step 9: Production Deployment

### Environment Variables for Production

Update your production environment variables:

```env
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

### Google Cloud Console Production Setup

1. Update the OAuth consent screen:
   - Change from "Testing" to "Production"
   - Verify your domain
   - Complete all required verification steps

2. Update the OAuth 2.0 Client ID:
   - Add production redirect URIs
   - Remove development URIs if not needed

## Step 10: Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use HTTPS in production
3. **Domain Verification**: Verify your domain in Google Cloud Console
4. **Rate Limiting**: Consider implementing rate limiting for OAuth endpoints
5. **CSRF Protection**: The current implementation uses session-based OAuth which is secure

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

2. **"access_denied" Error**
   - Check OAuth consent screen configuration
   - Ensure test users are added for testing phase

3. **"invalid_client" Error**
   - Verify Client ID and Client Secret are correct
   - Check environment variables are loaded properly

4. **Frontend Not Redirecting**
   - Check CORS configuration
   - Verify FRONTEND_URL environment variable

### Debug Steps

1. Check backend logs for OAuth flow errors
2. Verify environment variables are loaded:
   ```javascript
   console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
   ```
3. Test OAuth endpoints directly with curl or Postman
4. Check browser network tab for failed requests

## Features Implemented

✅ Google OAuth login and signup
✅ Automatic user creation for new Google users
✅ Account linking for existing users with same email
✅ JWT token generation for authenticated users
✅ Role-based redirection after login
✅ Error handling and user feedback
✅ Secure password handling (optional for Google users)

## API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle OAuth callback
- `POST /api/auth/google/token` - Token exchange (alternative method)

## Frontend Components

- `Login.jsx` - Updated with Google login button
- `SignUp.jsx` - Updated with Google signup button
- `GoogleAuthCallback.jsx` - Handles OAuth callback
- `api.js` - Updated with Google OAuth API methods

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google Cloud Console documentation
3. Check application logs for detailed error messages
4. Verify all environment variables are correctly set

---

**Note**: This implementation follows OAuth 2.0 best practices and includes proper error handling, security measures, and user experience considerations.
