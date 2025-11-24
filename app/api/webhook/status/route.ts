import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json({ success: false, error: 'Missing callId' }, { status: 400 });
    }

    const formData = await request.formData();
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const timestamp = formData.get('Timestamp') as string;

    console.log(`Call ${callId} status update: ${callStatus}`);

    // Update call record based on status
    const updates: any = {};

    switch (callStatus) {
      case 'ringing':
        updates.status = 'ringing';
        break;

      case 'in-progress':
        updates.status = 'in-progress';
        updates.startTime = timestamp ? new Date(timestamp) : new Date();
        break;

      case 'completed':
        updates.status = 'completed';
        updates.endTime = timestamp ? new Date(timestamp) : new Date();
        if (callDuration) {
          updates.duration = parseInt(callDuration, 10);
        }
        break;

      case 'failed':
      case 'busy':
      case 'no-answer':
        updates.status = 'failed';
        break;
    }

    await StorageService.updateCallRecord(callId, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Status webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
