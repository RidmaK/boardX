import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - in real app, you'd use Google Calendar API
let mockEvents = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { email: 'john@example.com', displayName: 'John Doe' },
      { email: 'jane@example.com', displayName: 'Jane Smith' },
    ],
  },
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // In a real implementation, you would:
    // 1. Get the user's access token from session/database
    // 2. Call Google Calendar API to update the event
    // 3. Return the updated event
    
    const eventIndex = mockEvents.findIndex(event => event.id === params.id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    mockEvents[eventIndex] = {
      ...mockEvents[eventIndex],
      ...body,
    };
    
    return NextResponse.json({ event: mockEvents[eventIndex] });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you would:
    // 1. Get the user's access token from session/database
    // 2. Call Google Calendar API to delete the event
    
    const eventIndex = mockEvents.findIndex(event => event.id === params.id);
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    mockEvents.splice(eventIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
