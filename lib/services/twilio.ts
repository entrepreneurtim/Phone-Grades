import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export interface InitiateCallParams {
  to: string;
  callId: string;
  webhookUrl: string;
}

export interface SendDTMFParams {
  callSid: string;
  digits: string;
}

export class TwilioService {
  /**
   * Initiate an outbound call
   */
  static async initiateCall(params: InitiateCallParams) {
    try {
      const call = await client.calls.create({
        to: params.to,
        from: phoneNumber,
        url: `${params.webhookUrl}/api/webhook/twiml?callId=${params.callId}`,
        statusCallback: `${params.webhookUrl}/api/webhook/status?callId=${params.callId}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
        recordingStatusCallback: `${params.webhookUrl}/api/webhook/recording?callId=${params.callId}`,
        // Enable media streams for live audio
        twiml: this.generateInitialTwiML(params.callId, params.webhookUrl),
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
      };
    } catch (error: any) {
      console.error('Twilio call initiation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate call',
      };
    }
  }

  /**
   * Generate initial TwiML for the call
   */
  static generateInitialTwiML(callId: string, webhookUrl: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://${webhookUrl.replace('https://', '')}/api/call/media-stream?callId=${callId}" />
  </Start>
  <Pause length="1"/>
  <Connect>
    <Stream url="wss://${webhookUrl.replace('https://', '')}/api/call/media-stream?callId=${callId}" />
  </Connect>
</Response>`;
  }

  /**
   * Send DTMF digits during an active call
   */
  static async sendDTMF(params: SendDTMFParams) {
    try {
      await client.calls(params.callSid).update({
        twiml: `<Response><Play digits="${params.digits}"/></Response>`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('DTMF send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send DTMF',
      };
    }
  }

  /**
   * Hang up an active call
   */
  static async hangupCall(callSid: string) {
    try {
      await client.calls(callSid).update({ status: 'completed' });
      return { success: true };
    } catch (error: any) {
      console.error('Hangup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to hangup call',
      };
    }
  }

  /**
   * Get call details
   */
  static async getCallDetails(callSid: string) {
    try {
      const call = await client.calls(callSid).fetch();
      return {
        success: true,
        call: {
          sid: call.sid,
          status: call.status,
          duration: call.duration,
          startTime: call.startTime,
          endTime: call.endTime,
        },
      };
    } catch (error: any) {
      console.error('Get call details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get call details',
      };
    }
  }

  /**
   * Get recording URL
   */
  static async getRecordingUrl(recordingSid: string): Promise<string | null> {
    try {
      const recording = await client.recordings(recordingSid).fetch();
      return `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;
    } catch (error) {
      console.error('Get recording URL error:', error);
      return null;
    }
  }
}
