import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/services/twilio';
import { StorageService } from '@/lib/services/storage';
import { PracticeInfo } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const practiceInfo: PracticeInfo = await request.json();

    // Validate required fields
    if (!practiceInfo.practiceName || !practiceInfo.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Practice name and phone number are required' },
        { status: 400 }
      );
    }

    // Create call record
    const callRecord = await StorageService.createCallRecord(practiceInfo);

    // Get webhook URL
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Initiate Twilio call
    const result = await TwilioService.initiateCall({
      to: practiceInfo.phoneNumber,
      callId: callRecord.id,
      webhookUrl,
    });

    if (!result.success) {
      // Update call record with failure
      await StorageService.updateCallRecord(callRecord.id, {
        status: 'failed',
      });

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Update call record with Twilio call SID
    await StorageService.updateCallRecord(callRecord.id, {
      callSid: result.callSid,
      status: 'ringing',
    });

    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      callSid: result.callSid,
    });
  } catch (error: any) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
