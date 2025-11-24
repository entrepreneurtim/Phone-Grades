import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';
import { RubricScorerService } from '@/lib/services/rubric-scorer';
import { SentimentScorerService } from '@/lib/services/sentiment-scorer';
import { InsightsGeneratorService } from '@/lib/services/insights-generator';
import { getGradeBreakdown } from '@/lib/utils/grading';

export async function POST(
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

    // Check if transcript exists
    if (!callRecord.transcript || callRecord.transcript.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No transcript available for scoring' },
        { status: 400 }
      );
    }

    // Score the call using rubric scorer
    const rubricScores = await RubricScorerService.scoreCall(
      callRecord.transcript,
      callRecord.practiceInfo,
      callRecord.startTime || callRecord.createdAt,
      callRecord.startTime
    );

    // Score sentiment
    const sentimentScores = await SentimentScorerService.scoreCall(
      callRecord.transcript
    );

    // Calculate overall score
    const overallScore = rubricScores.total + sentimentScores.total;

    // Get letter grades
    const gradeBreakdown = getGradeBreakdown(
      rubricScores.total,
      sentimentScores.total
    );

    // Generate insights
    const insights = InsightsGeneratorService.generateInsights(
      rubricScores,
      sentimentScores,
      callRecord.transcript
    );

    // Update call record with scores
    await StorageService.updateCallRecord(callId, {
      rubricScores,
      sentimentScores,
      overallScore,
      letterGrade: gradeBreakdown.overall,
    });

    return NextResponse.json({
      success: true,
      scores: {
        rubric: rubricScores,
        sentiment: sentimentScores,
        overall: overallScore,
        grades: gradeBreakdown,
      },
      insights,
    });
  } catch (error: any) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Check if scores exist
    if (!callRecord.rubricScores || !callRecord.sentimentScores) {
      return NextResponse.json(
        { success: false, error: 'Call not yet scored' },
        { status: 400 }
      );
    }

    // Generate insights
    const insights = InsightsGeneratorService.generateInsights(
      callRecord.rubricScores,
      callRecord.sentimentScores,
      callRecord.transcript || []
    );

    const gradeBreakdown = getGradeBreakdown(
      callRecord.rubricScores.total,
      callRecord.sentimentScores.total
    );

    return NextResponse.json({
      success: true,
      scores: {
        rubric: callRecord.rubricScores,
        sentiment: callRecord.sentimentScores,
        overall: callRecord.overallScore,
        grades: gradeBreakdown,
      },
      insights,
    });
  } catch (error: any) {
    console.error('Get scores error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
