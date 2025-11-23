import OpenAI from 'openai';
import { TranscriptSegment, SentimentScores, SentimentDimension } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class SentimentScorerService {
  /**
   * Score sentiment and soft skills (30 points total)
   * 5 dimensions × 6 points each
   */
  static async scoreCall(transcript: TranscriptSegment[]): Promise<SentimentScores> {
    const receptionistMessages = transcript
      .filter((s) => s.speaker === 'receptionist')
      .map((s) => s.text)
      .join('\n');

    if (!receptionistMessages) {
      return this.getZeroScore();
    }

    // Score all 5 dimensions
    const warmth = await this.scoreWarmth(receptionistMessages);
    const confidence = await this.scoreConfidence(receptionistMessages);
    const clarity = await this.scoreClarity(receptionistMessages);
    const empathy = await this.scoreEmpathy(receptionistMessages);
    const professionalTone = await this.scoreProfessionalTone(receptionistMessages);

    const total =
      warmth.points +
      confidence.points +
      clarity.points +
      empathy.points +
      professionalTone.points;

    return {
      warmth,
      confidence,
      clarity,
      empathy,
      professionalTone,
      total,
    };
  }

  /**
   * Warmth (0-6 pts)
   */
  private static async scoreWarmth(receptionistMessages: string): Promise<SentimentDimension> {
    const prompt = `Analyze the warmth and friendliness in these receptionist messages from a dental office call.

Messages:
${receptionistMessages}

Score 0-6 based on:
- 6 points: Genuinely warm, welcoming, makes caller feel valued
- 4-5 points: Friendly and pleasant
- 2-3 points: Neutral, professional but not particularly warm
- 0-1 points: Cold, robotic, or unwelcoming

Provide a brief justification (1-2 sentences).

Return JSON: { "points": number, "justification": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: Math.min(6, Math.max(0, result.points || 0)),
      justification: result.justification || 'Unable to assess',
    };
  }

  /**
   * Confidence (0-6 pts)
   */
  private static async scoreConfidence(receptionistMessages: string): Promise<SentimentDimension> {
    const prompt = `Analyze the confidence level in these receptionist messages from a dental office call.

Messages:
${receptionistMessages}

Score 0-6 based on:
- 6 points: Very confident, authoritative, knows answers immediately
- 4-5 points: Confident and self-assured
- 2-3 points: Somewhat uncertain, hesitant
- 0-1 points: Very uncertain, frequently unsure or apologetic

Provide a brief justification (1-2 sentences).

Return JSON: { "points": number, "justification": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: Math.min(6, Math.max(0, result.points || 0)),
      justification: result.justification || 'Unable to assess',
    };
  }

  /**
   * Clarity (0-6 pts)
   */
  private static async scoreClarity(receptionistMessages: string): Promise<SentimentDimension> {
    const prompt = `Analyze the clarity of communication in these receptionist messages from a dental office call.

Messages:
${receptionistMessages}

Score 0-6 based on:
- 6 points: Crystal clear, easy to understand, well-organized responses
- 4-5 points: Clear and understandable
- 2-3 points: Somewhat unclear or confusing at times
- 0-1 points: Confusing, rambling, or hard to follow

Provide a brief justification (1-2 sentences).

Return JSON: { "points": number, "justification": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: Math.min(6, Math.max(0, result.points || 0)),
      justification: result.justification || 'Unable to assess',
    };
  }

  /**
   * Empathy (0-6 pts)
   */
  private static async scoreEmpathy(receptionistMessages: string): Promise<SentimentDimension> {
    const prompt = `Analyze the empathy and understanding in these receptionist messages from a dental office call.

Messages:
${receptionistMessages}

Score 0-6 based on:
- 6 points: Highly empathetic, acknowledges concerns, validates feelings
- 4-5 points: Shows understanding and consideration
- 2-3 points: Minimal empathy, mostly transactional
- 0-1 points: No empathy, dismissive of concerns

Provide a brief justification (1-2 sentences).

Return JSON: { "points": number, "justification": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: Math.min(6, Math.max(0, result.points || 0)),
      justification: result.justification || 'Unable to assess',
    };
  }

  /**
   * Professional Tone (0-6 pts)
   */
  private static async scoreProfessionalTone(
    receptionistMessages: string
  ): Promise<SentimentDimension> {
    const prompt = `Analyze the professional tone in these receptionist messages from a dental office call.

Messages:
${receptionistMessages}

Score 0-6 based on:
- 6 points: Highly professional, polished, appropriate language
- 4-5 points: Professional and appropriate
- 2-3 points: Somewhat casual or informal
- 0-1 points: Unprofessional, inappropriate, or too casual

Provide a brief justification (1-2 sentences).

Return JSON: { "points": number, "justification": string }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      points: Math.min(6, Math.max(0, result.points || 0)),
      justification: result.justification || 'Unable to assess',
    };
  }

  /**
   * Get zero score (for failed calls)
   */
  private static getZeroScore(): SentimentScores {
    const emptyDimension: SentimentDimension = {
      points: 0,
      justification: 'No receptionist messages to analyze',
    };

    return {
      warmth: emptyDimension,
      confidence: emptyDimension,
      clarity: emptyDimension,
      empathy: emptyDimension,
      professionalTone: emptyDimension,
      total: 0,
    };
  }
}
