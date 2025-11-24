import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { CallerState, TranscriptSegment, PracticeInfo } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AICallerService {
  private state: CallerState;
  private practiceInfo: PracticeInfo;
  private conversationHistory: ChatCompletionMessageParam[];

  constructor(practiceInfo: PracticeInfo) {
    this.practiceInfo = practiceInfo;
    this.state = {
      currentStep: 0,
      hasAskedAboutNewPatients: false,
      hasAskedAboutInsurance: false,
      hasAskedAboutPricing: false,
      hasAskedAboutOffers: false,
      hasAskedAboutAvailability: false,
      bookingAttempts: 0,
      objections: [],
    };
    this.conversationHistory = [];
  }

  /**
   * Generate the next response from the AI caller
   */
  async generateResponse(receptionistMessage?: string): Promise<string> {
    // Add receptionist message to history
    if (receptionistMessage) {
      this.conversationHistory.push({
        role: 'user',
        content: receptionistMessage,
      });
    }

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt();

    // Get next response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory,
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0].message.content || '';

    // Update conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
    });

    // Update state based on response
    this.updateState(response);

    return response;
  }

  /**
   * Build the system prompt for the AI caller
   */
  private buildSystemPrompt(): string {
    const insuranceType = this.practiceInfo.insuranceType || 'Delta Dental';

    let prompt = `You are a potential new patient calling a dental practice. You are friendly, slightly hesitant about making appointments, and need some convincing to book.

PRACTICE INFORMATION:
- Practice Name: ${this.practiceInfo.practiceName}
${this.practiceInfo.primaryOffer ? `- They offer: ${this.practiceInfo.primaryOffer}` : ''}

YOUR ROLE:
- You're looking for a new dentist
- You have ${insuranceType} insurance
- You're cost-conscious but willing to book if the conversation goes well
- You should ask natural follow-up questions
- Don't commit to booking too quickly - give them opportunities to sell you

CONVERSATION FLOW (natural, not scripted):
`;

    // Determine what to ask next based on state
    if (!this.state.hasAskedAboutNewPatients) {
      prompt += `\n1. Start by asking if they accept new patients`;
    } else if (!this.state.hasAskedAboutInsurance) {
      prompt += `\n2. Ask if they take ${insuranceType} insurance`;
    } else if (!this.state.hasAskedAboutOffers) {
      prompt += `\n3. Ask about new patient specials or promotions`;
    } else if (!this.state.hasAskedAboutPricing) {
      prompt += `\n4. Ask about pricing for a cleaning or exam`;
    } else if (!this.state.hasAskedAboutAvailability) {
      prompt += `\n5. Ask about availability this week or next`;
    } else if (this.state.bookingAttempts < 2) {
      prompt += `\n6. If they try to book you, say you need to check your schedule first`;
    } else {
      prompt += `\n7. Thank them and end the conversation politely`;
    }

    prompt += `\n\nIMPORTANT:
- Keep responses conversational and natural (1-2 sentences max)
- Sound like a real person, not a script
- Give them opportunities to explain offers and overcome objections
- Let them try to book you at least 2-3 times before accepting or declining
- End naturally after getting enough information

Current conversation context: You've asked ${this.state.currentStep} questions so far.`;

    return prompt;
  }

  /**
   * Update internal state based on what was said
   */
  private updateState(response: string) {
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('new patient') || lowerResponse.includes('looking for a dentist')) {
      this.state.hasAskedAboutNewPatients = true;
    }

    if (lowerResponse.includes('insurance') || lowerResponse.includes('delta') || lowerResponse.includes('cigna')) {
      this.state.hasAskedAboutInsurance = true;
    }

    if (lowerResponse.includes('special') || lowerResponse.includes('promotion') || lowerResponse.includes('offer')) {
      this.state.hasAskedAboutOffers = true;
    }

    if (lowerResponse.includes('cost') || lowerResponse.includes('price') || lowerResponse.includes('how much')) {
      this.state.hasAskedAboutPricing = true;
    }

    if (lowerResponse.includes('available') || lowerResponse.includes('appointment') || lowerResponse.includes('this week')) {
      this.state.hasAskedAboutAvailability = true;
    }

    if (lowerResponse.includes('check my schedule') || lowerResponse.includes('not sure')) {
      this.state.objections.push(response);
    }

    if (lowerResponse.includes('thank')) {
      this.state.currentStep = 999; // Signal end of conversation
    }

    this.state.currentStep++;
  }

  /**
   * Get the opening message
   */
  getOpeningMessage(): string {
    const messages = [
      `Hi, I'm looking for a new dentist. Are you accepting new patients?`,
      `Hello! I was hoping to find a new dental office. Do you have availability for new patients?`,
      `Hi there, I'm looking for a dentist in the area. Are you taking new patients?`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Check if conversation should end
   */
  shouldEndConversation(): boolean {
    return (
      this.state.currentStep > 10 ||
      this.state.currentStep === 999 ||
      this.conversationHistory.length > 20
    );
  }

  /**
   * Get current state (for debugging/logging)
   */
  getState(): CallerState {
    return { ...this.state };
  }
}
