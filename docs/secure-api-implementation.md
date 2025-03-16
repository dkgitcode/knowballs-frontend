# Secure API Implementation 🔒

This document explains how we've implemented secure API calls between our Next.js frontend and the external API server.

## Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Next.js Client │──────▶  Next.js API    │──────▶  External API   │
│  (Browser)      │      │  (Server)       │      │  Server         │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Supabase Auth  │◀─────▶  Supabase Auth  │      │  JWT Validation │
│  (Client SDK)   │      │  (Server SDK)   │      │                 │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Security Flow

1. **Client Authentication**:
   - User logs in via Supabase Auth in the browser
   - Supabase provides a JWT token stored in cookies

2. **API Request Flow**:
   - Client makes request to `/api/proxy` in our Next.js app
   - Next.js middleware validates the authentication
   - If authenticated, the request is forwarded to the external API with:
     - The JWT token in the Authorization header
     - User information in the request body

3. **External API Validation**:
   - External API validates the JWT token
   - If valid, processes the request and returns data
   - If invalid, returns 401 Unauthorized

## Implementation Details

### 1. Next.js API Proxy (`/app/api/proxy/route.ts`)

This route:
- Validates that the user is authenticated with Supabase
- Forwards the request to the external API with authentication information
- Returns the response from the external API to the client

### 2. Middleware Protection (`middleware.ts`)

The middleware:
- Runs on all `/api/proxy/*` routes
- Checks for valid Supabase session
- Rejects unauthenticated requests with 401 status

### 3. Client-Side Implementation (`components/main-content.tsx`)

The client:
- Makes requests to the internal `/api/proxy` endpoint instead of directly to the external API
- Handles authentication errors appropriately
- Provides a better user experience by showing login prompts when needed

### 4. External API JWT Validation

The external API:
- Validates the JWT token from the Authorization header
- Extracts user information
- Ensures the request is legitimate before processing

## Environment Variables

Make sure to set these environment variables in your Next.js app:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXTERNAL_API_URL=your-external-api-url
```

## Benefits of This Approach

1. **Enhanced Security** 🛡️
   - No direct access to your external API from the client
   - Authentication is handled server-side
   - JWT tokens provide cryptographic verification

2. **Better User Experience** 🌟
   - Clear authentication error messages
   - Seamless integration with your app's authentication flow

3. **Simplified External API** 🧩
   - External API only needs to validate JWT tokens
   - No need to implement complex authentication logic

4. **Centralized Control** 🎮
   - All authentication logic is in one place
   - Easier to update and maintain

## Testing the Implementation

To test this implementation:
1. Ensure you have a valid Supabase account set up
2. Configure your external API to validate JWT tokens
3. Make requests from your authenticated Next.js app
4. Verify that unauthenticated requests are rejected 