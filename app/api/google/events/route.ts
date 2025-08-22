import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - in real app, you'd use Google Calendar API
let mockEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { email: 'john@example.com', displayName: 'John Doe' },
      { email: 'jane@example.com', displayName: 'Jane Smith' },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Get the user's access token from session/database
    // 2. Call Google Calendar API to fetch events
    // 3. Return the events in the expected format
    
    return NextResponse.json({ events: mockEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, you would:
    // 1. Get the user's access token from session/database
    // 2. Call Google Calendar API to create the event
    // 3. Generate meet link if requested
    // 4. Return the created event
    
    const newEvent = {
      id: Date.now().toString(),
      ...body,
      meetLink: body.createMeetLink ? `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}` : undefined,
    };
    
    mockEvents.push(newEvent);
    
    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
