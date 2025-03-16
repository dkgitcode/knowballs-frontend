# External API Authentication Guide 🔒

This document explains how to validate Supabase JWT tokens in your external API server to ensure requests are coming from authenticated users in our Next.js application.

## Overview

When a user makes a request to our Next.js application, the following happens:

1. The request is first authenticated using Supabase in our Next.js API route
2. If authenticated, we forward the request to your external API with:
   - The user's Supabase JWT token in the `Authorization` header
   - User information in the request body
   - The original query parameters

## Validating the JWT Token in Your External API

### Option 1: Using Supabase's JWT Verification

```javascript
// Example using Node.js and jose library
import { jwtVerify } from 'jose';

// MIDDLEWARE TO VERIFY SUPABASE JWT TOKEN 🔑
async function verifyAuthToken(req, res, next) {
  try {
    // GET THE JWT TOKEN FROM THE AUTHORIZATION HEADER 📝
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // GET YOUR SUPABASE JWT SECRET FROM ENVIRONMENT VARIABLES 🔐
    // This should be the same as your SUPABASE_JWT_SECRET
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('SUPABASE_JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // VERIFY THE JWT TOKEN 🛡️
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret)
    );
    
    // TOKEN IS VALID! ✅
    // Add the user info to the request object for use in route handlers
    req.user = {
      id: payload.sub,
      email: payload.email,
      // Add any other user data from the payload you need
    };
    
    // PROCEED TO THE NEXT MIDDLEWARE OR ROUTE HANDLER 🚀
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default verifyAuthToken;
```

### Option 2: Using Supabase Admin API to Verify

If you prefer to validate the token directly with Supabase:

```javascript
// Example using Node.js and fetch
async function verifyWithSupabase(req, res, next) {
  try {
    // GET THE JWT TOKEN FROM THE AUTHORIZATION HEADER 📝
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // VERIFY TOKEN WITH SUPABASE AUTH API 🔄
    const response = await fetch('https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    const userData = await response.json();
    
    // TOKEN IS VALID! ✅
    // Add the user info to the request object
    req.user = userData;
    
    // PROCEED TO THE NEXT MIDDLEWARE OR ROUTE HANDLER 🚀
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Failed to verify token' });
  }
}
```

## Environment Variables Required

Make sure to set these environment variables in your external API server:

```
SUPABASE_URL=https://YOUR_SUPABASE_PROJECT.supabase.co
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (if using Option 2)
```

## Security Considerations

- NEVER expose your Supabase JWT secret or service role key in client-side code 🚫
- Always use HTTPS for all API communications 🔒
- Consider implementing rate limiting to prevent abuse 🛡️
- Add additional validation based on user roles or permissions as needed 👮‍♀️

## Testing the Authentication

You can test if the authentication is working correctly by:

1. Making a request to your Next.js app's API endpoint
2. Checking if the request reaches your external API with valid authentication
3. Verifying that unauthenticated requests are properly rejected

## Troubleshooting

- If tokens are being rejected, check that the JWT secret matches exactly between Supabase and your API
- Ensure clock synchronization between servers to prevent time-based validation issues
- Check token expiration times - Supabase tokens typically expire after 1 hour by default 