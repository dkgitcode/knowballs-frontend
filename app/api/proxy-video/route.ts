import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PROXY ENDPOINT FOR VIDEO FILES 🎬
// This endpoint bypasses CORS restrictions by fetching videos server-side
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client to check auth
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // VERIFY USER IS AUTHORIZED 🔒
    if (!session?.user?.email || session.user.email !== 'danjkim11@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get the target URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    // VALIDATE THE URL PARAMETER ✅
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }
    
    // ONLY ALLOW NBA VIDEO DOMAINS FOR SECURITY 🔒
    if (!url.startsWith('https://videos.nba.com/')) {
      return NextResponse.json(
        { error: 'Only NBA video URLs are allowed' },
        { status: 403 }
      );
    }
    
    // FETCH THE VIDEO FROM THE NBA SERVERS 🏀
    const response = await fetch(url, {
      headers: {
        // Add a realistic user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.nba.com/',
      },
    });
    
    // CHECK IF THE REQUEST WAS SUCCESSFUL
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // GET THE VIDEO DATA AS AN ARRAY BUFFER
    const videoData = await response.arrayBuffer();
    
    // RETURN THE VIDEO WITH APPROPRIATE HEADERS
    return new NextResponse(videoData, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Proxy video error:', error);
    
    return NextResponse.json(
      { error: 'Failed to proxy video request' },
      { status: 500 }
    );
  }
} 