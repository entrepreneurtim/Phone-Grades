import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const callId = params.callId;

    // Get call record
    const callRecord = await StorageService.getCallRecord(callId);
    if (!callRecord) {
      return NextResponse.json(
        { success: false, error: 'Call not found' },
        { status: 404 }
      );
    }

    // TODO: Implement PDF generation using jsPDF
    // For now, return a simple text response
    const content = `
AI Patient Conversion Scorecard
${callRecord.practiceInfo.practiceName}

Overall Score: ${callRecord.overallScore || 'N/A'} / 100
Letter Grade: ${callRecord.letterGrade || 'N/A'}

Objective Score: ${callRecord.rubricScores?.total || 'N/A'} / 70
Sentiment Score: ${callRecord.sentimentScores?.total || 'N/A'} / 30

Status: ${callRecord.status}
Date: ${callRecord.createdAt.toLocaleDateString()}

Full PDF generation coming soon...
    `;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="scorecard-${callId}.txt"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
