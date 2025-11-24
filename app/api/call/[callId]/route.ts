import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const callId = params.callId;
    const callRecord = await StorageService.getCallRecord(callId);

    if (!callRecord) {
      return NextResponse.json(
        { success: false, error: 'Call not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      call: callRecord,
    });
  } catch (error: any) {
    console.error('Get call error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
