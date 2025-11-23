import OpenAI from 'openai';
import {
  TranscriptSegment,
  RubricScores,
  SpeedToAnswerScore,
  GreetingScore,
  NewPatientScore,
  InsuranceScore,
  OfferScore,
  PriceFramingScore,
  BookingAttemptsScore,
  ContactInfoScore,
  ObjectionHandlingScore,
  ScoringEvidence,
  PracticeInfo,
} from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class RubricScorerService {
  /**
   * Score a call based on the objective rubric (70 points total)
   */
  static async scoreCall(
    transcript: TranscriptSegment[],
    practiceInfo: PracticeInfo,
    callStartTime: Date,
    firstAnswerTime?: Date
  ): Promise<RubricScores> {
    // Calculate individual scores
    const speedToAnswer = this.scoreSpeedToAnswer(callStartTime, firstAnswerTime);
    const greeting = await this.scoreGreeting(transcript, practiceInfo);
    const newPatientAcceptance = await this.scoreNewPatientAcceptance(transcript);
    const insuranceHandling = await this.scoreInsuranceHandling(transcript, practiceInfo);
    const offerMention = await this.scoreOfferMention(transcript, practiceInfo);
    const priceFraming = await this.scorePriceFraming(transcript);
    const bookingAttempts = this.scoreBookingAttempts(transcript);
    const contactInfoCapture = this.scoreContactInfoCapture(transcript);
    const objectionHandling = await this.scoreObjectionHandling(transcript);

    // Collect evidence
    const evidence: ScoringEvidence = {
      greeting: greeting.evidence ? [{ quote: greeting.evidence, timestamp: 0 }] : [],
      newPatient: newPatientAcceptance.evidence ? [{ quote: newPatientAcceptance.evidence, timestamp: 0 }] : [],
      insurance: insuranceHandling.evidence ? [{ quote: insuranceHandling.evidence, timestamp: 0 }] : [],
      offer: offerMention.evidence ? [{ quote: offerMention.evidence, timestamp: 0 }] : [],
      priceFraming: priceFraming.evidence ? [{ quote: priceFraming.evidence, timestamp: 0 }] : [],
      bookingAttempts: bookingAttempts.attempts.map((quote, i) => ({ quote, timestamp: i })),
      contactInfo: contactInfoCapture.evidence ? [{ quote: contactInfoCapture.evidence, timestamp: 0 }] : [],
      objectionHandling: objectionHandling.evidence ? [{ quote: objectionHandling.evidence, timestamp: 0 }] : [],
    };

    // Calculate total
    const total =
      speedToAnswer.points +
      greeting.points +
      newPatientAcceptance.points +
      insuranceHandling.points +
      offerMention.points +
      priceFraming.points +
      bookingAttempts.points +
      contactInfoCapture.points +
      objectionHandling.points;

    return {
      speedToAnswer,
      greetingIdentification: greeting,
      newPatientAcceptance,
      insuranceHandling,
      offerMention,
      priceFraming,
      bookingAttempts,
      contactInfoCapture,
      objectionHandling,
      total,
      evidence,
    };
  }

  /**
   * 1) Speed to Answer (0-10 pts)
   */
  private static scoreSpeedToAnswer(
    callStartTime: Date,
    firstAnswerTime?: Date
  ): SpeedToAnswerScore {
    if (!firstAnswerTime) {
      return {
        points: 0,
        category: '30+ sec / voicemail',
      };
    }

    const seconds = (firstAnswerTime.getTime() - callStartTime.getTime()) / 1000;

    if (seconds <= 10) {
      return { points: 10, seconds, category: '≤10 sec' };
    } else if (seconds <= 20) {
      return { points: 7, seconds, category: '11-20 sec' };
    } else if (seconds <= 30) {
      return { points: 4, seconds, category: '21-30 sec' };
    } else {
      return { points: 0, seconds, category: '30+ sec / voicemail' };
    }
  }

  /**
   * 2) Greeting & Identification (0-6 pts)
   */
  private static async scoreGreeting(
    transcript: TranscriptSegment[],
    practiceInfo: PracticeInfo
  ): Promise<GreetingScore> {
    const receptionistMessages = transcript
      .filter((s) => s.speaker === 'receptionist')
      .map((s) => s.text);

    if (receptionistMessages.length === 0) {
      return { points: 0, category: 'no greeting' };
    }

    const firstMessage = receptionistMessages[0].toLowerCase();

    // Check for practice name
    const hasPracticeName = firstMessage.includes(practiceInfo.practiceName.toLowerCase());

    // Check for staff name (look for "this is", "my name is", "I'm")
    const hasStaffName =
      /\b(this is|my name is|i'm|speaking with)\s+\w+/i.test(firstMessage);

    if (hasPracticeName && hasStaffName) {
      return {
        points: 6,
        category: 'name + staff',
        evidence: receptionistMessages[0],
      };
    } else if (hasPracticeName) {
      return {
        points: 4,
        category: 'name only',
        evidence: receptionistMessages[0],
      };
    } else if (/\b(hello|hi|good morning|good afternoon)\b/i.test(firstMessage)) {
      return {
        points: 2,
        category: 'generic',
        evidence: receptionistMessages[0],
      };
    } else {
      return { points: 0, category: 'no greeting' };
    }
  }

  /**
   * 3) New Patient Acceptance Clarity (0-6 pts)
   */
  private static async scoreNewPatientAcceptance(
    transcript: TranscriptSegment[]
  ): Promise<NewPatientScore> {
    const fullTranscript = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    const prompt = `Analyze this dental office phone call transcript and score the receptionist's response to the new patient inquiry.

Transcript:
${fullTranscript}

Score based on these criteria:
- 6 points: Clear yes + next step ("Yes, we'd love to have you! Let me get you scheduled...")
- 4 points: Clear yes only ("Yes, we are accepting new patients")
- 2 points: Hesitant ("We might have room" or "Let me check")
- 0 points: No or dismissive ("We're not taking new patients" or ignores question)

Return JSON: { "points": number, "category": string, "evidence": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: result.points || 0,
      category: result.category || 'no/dismissive',
      evidence: result.evidence,
    };
  }

  /**
   * 4) Insurance Handling (0-8 pts)
   */
  private static async scoreInsuranceHandling(
    transcript: TranscriptSegment[],
    practiceInfo: PracticeInfo
  ): Promise<InsuranceScore> {
    const fullTranscript = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    const prompt = `Analyze this dental office phone call transcript and score the receptionist's insurance handling.

Insurance asked about: ${practiceInfo.insuranceType || 'Delta Dental'}

Transcript:
${fullTranscript}

Score based on these criteria:
- 8 points: Clear answer + keeps booking flow moving
- 6 points: "Bring card, we'll verify" + moves forward
- 5 points: Clear answer but conversation stalls
- 2 points: Insurance becomes a gate (won't move forward without verification)
- 0 points: Wrong/confusing/no answer

Return JSON: { "points": number, "category": string, "evidence": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: result.points || 0,
      category: result.category || 'wrong/none',
      evidence: result.evidence,
    };
  }

  /**
   * 5) Offer Mention (0-10 pts)
   */
  private static async scoreOfferMention(
    transcript: TranscriptSegment[],
    practiceInfo: PracticeInfo
  ): Promise<OfferScore> {
    const fullTranscript = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    const prompt = `Analyze this dental office phone call transcript and score how the receptionist mentioned new patient offers/specials.

${practiceInfo.primaryOffer ? `Expected offer: ${practiceInfo.primaryOffer}` : 'No specific offer provided'}

Transcript:
${fullTranscript}

Score based on these criteria:
- 10 points: Specific offer with details ("$99 cleaning, exam, and x-rays")
- 7 points: Vague offer mentioned ("We have a new patient special")
- 3 points: "Check our website" or uncertainty
- 0 points: No mention at all

Return JSON: { "points": number, "category": string, "evidence": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: result.points || 0,
      category: result.category || 'no mention',
      evidence: result.evidence,
    };
  }

  /**
   * 6) Price Framing (0-6 pts)
   */
  private static async scorePriceFraming(
    transcript: TranscriptSegment[]
  ): Promise<PriceFramingScore> {
    const fullTranscript = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    const prompt = `Analyze this dental office phone call transcript and score how the receptionist handled pricing questions.

Transcript:
${fullTranscript}

Score based on these criteria:
- 6 points: Value framing before number ("With our comprehensive exam including x-rays, it's $150")
- 4 points: Range + value ("Typically $120-$180 depending on what you need")
- 2 points: Raw price only ("It's $150")
- 0 points: Avoidance ("You'll need to call insurance" or doesn't answer)

Return JSON: { "points": number, "category": string, "evidence": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: result.points || 0,
      category: result.category || 'avoidance',
      evidence: result.evidence,
    };
  }

  /**
   * 7) Booking Attempts (0-12 pts)
   */
  private static scoreBookingAttempts(
    transcript: TranscriptSegment[]
  ): BookingAttemptsScore {
    const receptionistMessages = transcript
      .filter((s) => s.speaker === 'receptionist')
      .map((s) => s.text);

    const bookingKeywords = [
      /\b(schedule|book|appointment|come in|available|calendar|when can you)\b/i,
      /\b(what day|this week|next week|monday|tuesday|wednesday|thursday|friday)\b/i,
      /\b(let me get you|let's get you|i can get you in)\b/i,
    ];

    const attempts: string[] = [];

    for (const message of receptionistMessages) {
      const hasBookingLanguage = bookingKeywords.some((regex) => regex.test(message));
      if (hasBookingLanguage && !attempts.includes(message)) {
        attempts.push(message);
      }
    }

    const count = attempts.length;
    let points = 0;

    if (count >= 3) points = 12;
    else if (count === 2) points = 8;
    else if (count === 1) points = 4;

    return { points, count, attempts };
  }

  /**
   * 8) Contact Info Capture (0-6 pts)
   */
  private static scoreContactInfoCapture(
    transcript: TranscriptSegment[]
  ): ContactInfoScore {
    const receptionistMessages = transcript
      .filter((s) => s.speaker === 'receptionist')
      .map((s) => s.text);

    const fullText = receptionistMessages.join(' ').toLowerCase();

    const asksForName = /\b(your name|what's your name|may I have your name|can I get your name)\b/i.test(fullText);
    const asksForContact = /\b(phone number|email|contact|callback|reach you)\b/i.test(fullText);

    if (asksForName && asksForContact) {
      return {
        points: 6,
        category: 'name + contact',
        evidence: receptionistMessages.find(m => /name|phone|email/i.test(m)),
      };
    } else if (asksForName || asksForContact) {
      return {
        points: 3,
        category: 'one item',
        evidence: receptionistMessages.find(m => /name|phone|email/i.test(m)),
      };
    } else {
      return { points: 0, category: 'no attempt' };
    }
  }

  /**
   * 9) Objection Handling (0-6 pts)
   */
  private static async scoreObjectionHandling(
    transcript: TranscriptSegment[]
  ): Promise<ObjectionHandlingScore> {
    const fullTranscript = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    // Check if caller expressed hesitation
    const hasObjection = transcript.some(
      (s) =>
        s.speaker === 'ai' &&
        /\b(not sure|check my schedule|let me think|need to|maybe|i'll call back)\b/i.test(s.text)
    );

    if (!hasObjection) {
      // No objection to handle, give neutral score
      return {
        points: 3,
        category: 'mild reassurance',
        evidence: 'No objection raised',
      };
    }

    const prompt = `Analyze this dental office phone call transcript and score how the receptionist handled the caller's hesitation/objection.

Transcript:
${fullTranscript}

Score based on these criteria:
- 6 points: Provides reassurance + creates easy next step ("No problem! I can hold a spot for you and call tomorrow to confirm")
- 3 points: Mild reassurance ("That's fine, just give us a call when you're ready")
- 0 points: Lets lead walk away with no follow-up attempt

Return JSON: { "points": number, "category": string, "evidence": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: result.points || 0,
      category: result.category || 'lets lead walk',
      evidence: result.evidence,
    };
  }
}
