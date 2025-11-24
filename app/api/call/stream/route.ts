import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';

/**
 * Simple polling endpoint for call status updates
 * This replaces WebSocket for better Vercel compatibility
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Missing callId' },
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

    // Return current call status
    return NextResponse.json({
      success: true,
      data: {
        status: callRecord.status,
        transcript: callRecord.transcript || [],
        duration: callRecord.duration,
        startTime: callRecord.startTime,
        endTime: callRecord.endTime,
      },
    });
  } catch (error: any) {
    console.error('Stream status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
