import { NextRequest, NextResponse } from 'next/server';

/**
 * PROXY ENDPOINT FOR API REQUESTS 🔄
 * 
 * This endpoint forwards requests to either our local API server (dev)
 * or production API server based on the environment.
 * 
 * It accepts:
 * - 'mode' query parameter that can be passed to the API
 * - 'env' query parameter to specify which environment to use (dev/prod)
 */

// API ENDPOINT CONFIGURATION 🌐
const API_ENDPOINTS = {
  dev: 'http://localhost:8000/api/query',
  prod: process.env.PROD_API_URL || 'https://knowballs-backend-4808b557c795.herokuapp.com/api/query'
};

export async function POST(request: NextRequest) {
  try {
    // Extract parameters from the URL query parameters
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'answer';
    // const env = searchParams.get('env') || 'dev'; // Default to dev environment
    // check if we are in production
    const isProduction = process.env.NODE_ENV === 'production';

    const env = isProduction ? 'prod' : 'dev';
    
    // Get the request body
    const body = await request.json();
    
    // Determine which API endpoint to use
    const apiUrl = isProduction ? API_ENDPOINTS.prod : API_ENDPOINTS.dev;
    
    // FORWARD THE REQUEST TO THE APPROPRIATE API 🚀
    console.log(`🔄 Forwarding request to ${env} environment: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        mode: mode, // Include the mode in the request body
      }),
    });
    
    // Check if the API request was successful
    if (!apiResponse.ok) {
      // LOG THE ERROR DETAILS FOR DEBUGGING 🔍
      console.error(`❌ API ERROR (${env}): ${apiResponse.status} - ${apiResponse.statusText}`);
      
      // Return the error response with the same status code
      return NextResponse.json(
        { error: `API request failed with status ${apiResponse.status}` },
        { status: apiResponse.status }
      );
    }
    
    // Get the response data
    const data = await apiResponse.json();
    
    // Return the API response
    return NextResponse.json(data);
  } catch (error) {
    // HANDLE ANY UNEXPECTED ERRORS 💥
    console.error('❌ PROXY ERROR:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

/**
 * GET HANDLER FOR API PROXY ✨
 * 
 * This handler provides information about the proxy endpoint.
 * It returns details about available environments and how to use the endpoint.
 */
export async function GET() {
  return NextResponse.json(
    { 
      message: 'This endpoint accepts POST requests for both dev and prod environments',
      status: 'ok',
      environments: {
        dev: API_ENDPOINTS.dev,
        prod: API_ENDPOINTS.prod
      },
      usage: 'Send POST requests with a JSON body and optional query parameters: ?env=dev|prod&mode=answer'
    },
    { status: 200 }
  );
} 