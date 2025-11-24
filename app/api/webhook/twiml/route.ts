import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callId = searchParams.get('callId');

    if (!callId) {
      return new NextResponse('Missing callId', { status: 400 });
    }

    // Get the base URL for webhooks
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate TwiML response that starts the AI conversation
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>${baseUrl}/api/call/conversation?callId=${callId}&amp;step=0</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('TwiML generation error:', error);
    return new NextResponse('Error generating TwiML', { status: 500 });
  }
}
