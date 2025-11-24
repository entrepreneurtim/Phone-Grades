import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/services/storage';
import { AICallerService } from '@/lib/services/ai-caller';
import { TranscriptSegment } from '@/lib/types';

// Store active conversations in memory
const activeConversations = new Map<string, AICallerService>();

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callId = searchParams.get('callId');
    const step = searchParams.get('step') || '0';

    if (!callId) {
      return new NextResponse('Missing callId', { status: 400 });
    }

    // Get call record
    const callRecord = await StorageService.getCallRecord(callId);
    if (!callRecord) {
      return new NextResponse('Call not found', { status: 404 });
    }

    // Get or create AI caller service
    let aiCaller = activeConversations.get(callId);
    if (!aiCaller) {
      aiCaller = new AICallerService(callRecord.practiceInfo);
      activeConversations.set(callId, aiCaller);
    }

    // Get form data from Twilio
    const formData = await request.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;

    // Determine what the AI should say next
    let aiMessage: string;
    const stepNum = parseInt(step, 10);

    if (stepNum === 0) {
      // First message - greeting
      aiMessage = aiCaller.getOpeningMessage();

      // Update call status
      await StorageService.updateCallRecord(callId, {
        status: 'in-progress',
        startTime: new Date(),
      });
    } else {
      // Process receptionist's response and generate next message
      if (speechResult) {
        // Add to transcript
        const transcript: TranscriptSegment = {
          speaker: 'receptionist',
          text: speechResult,
          timestamp: stepNum * 10, // approximate timing
          confidence: parseFloat(confidence) || undefined,
        };

        const existingTranscript = callRecord.transcript || [];
        existingTranscript.push(transcript);
        await StorageService.updateCallRecord(callId, {
          transcript: existingTranscript,
        });

        // Generate AI response
        aiMessage = await aiCaller.generateResponse(speechResult);

        // Add AI message to transcript
        const aiTranscript: TranscriptSegment = {
          speaker: 'ai',
          text: aiMessage,
          timestamp: stepNum * 10 + 5,
        };
        existingTranscript.push(aiTranscript);
        await StorageService.updateCallRecord(callId, {
          transcript: existingTranscript,
        });
      } else {
        // No response detected, prompt again
        aiMessage = "I'm sorry, I didn't catch that. Could you repeat?";
      }
    }

    // Check if conversation should end
    const shouldEnd = aiCaller.shouldEndConversation();
    const nextStep = stepNum + 1;

    // Generate TwiML response
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

    let twiml: string;

    if (shouldEnd || nextStep > 12) {
      // End the call
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(aiMessage)}</Say>
  <Pause length="2"/>
  <Say voice="Polly.Joanna">Thank you so much for your help. Have a great day!</Say>
  <Hangup/>
</Response>`;

      // Clean up and mark as completed
      activeConversations.delete(callId);
      await StorageService.updateCallRecord(callId, {
        status: 'completed',
        endTime: new Date(),
      });
    } else {
      // Continue conversation - AI speaks and listens for response
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${escapeXml(aiMessage)}</Say>
  <Gather
    input="speech"
    action="${baseUrl}/api/call/conversation?callId=${callId}&amp;step=${nextStep}"
    method="POST"
    speechTimeout="3"
    timeout="10"
    language="en-US"
  >
    <Pause length="5"/>
  </Gather>
  <Redirect>${baseUrl}/api/call/conversation?callId=${callId}&amp;step=${nextStep}</Redirect>
</Response>`;
    }

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('Conversation error:', error);

    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">I apologize, but we're experiencing technical difficulties. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
