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
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;

    console.log(`Recording ${recordingSid} status: ${recordingStatus}`);

    if (recordingStatus === 'completed' && recordingUrl) {
      // Store the recording URL
      const audioUrl = `${recordingUrl}.mp3`;
      await StorageService.updateCallRecord(callId, { audioUrl });

      console.log(`Recording saved for call ${callId}: ${audioUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Recording webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
