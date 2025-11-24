import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/services/twilio';
import { StorageService } from '@/lib/services/storage';

export async function POST(request: NextRequest) {
  try {
    const { callId, digit } = await request.json();

    if (!callId || !digit) {
      return NextResponse.json(
        { success: false, error: 'Call ID and digit are required' },
        { status: 400 }
      );
    }

    // Get call record
    const callRecord = await StorageService.getCallRecord(callId);
    if (!callRecord || !callRecord.callSid) {
      return NextResponse.json(
        { success: false, error: 'Call not found' },
        { status: 404 }
      );
    }

    // Send DTMF digit
    const result = await TwilioService.sendDTMF({
      callSid: callRecord.callSid,
      digits: digit,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('IVR navigation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
