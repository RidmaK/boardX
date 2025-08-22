import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Revoke the user's access token with Google
    // 2. Clear the stored tokens from your database
    // 3. Update the user's connection status
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
