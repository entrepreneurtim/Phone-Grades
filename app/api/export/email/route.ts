import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';

export async function POST(request: NextRequest) {
  try {
    const { callId, email } = await request.json();

    if (!callId || !email) {
      return NextResponse.json(
        { success: false, error: 'Call ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get call record
    const callRecord = await StorageService.getCallRecord(callId);
    if (!callRecord) {
      return NextResponse.json(
        { success: false, error: 'Call not found' },
        { status: 404 }
      );
    }

    // TODO: Implement email sending using nodemailer or SendGrid
    // For now, just log the request
    console.log(`Email report requested for call ${callId} to ${email}`);
    console.log('Practice:', callRecord.practiceInfo.practiceName);
    console.log('Score:', callRecord.overallScore);

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Email functionality coming soon. Report logged to console.',
    });
  } catch (error: any) {
    console.error('Email export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
