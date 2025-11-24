import {
  RubricScores,
  SentimentScores,
  CallInsights,
  TranscriptSegment,
} from '@/lib/types';

export class InsightsGeneratorService {
  /**
   * Generate insights and recommendations from scores
   */
  static generateInsights(
    rubricScores: RubricScores,
    sentimentScores: SentimentScores,
    transcript: TranscriptSegment[]
  ): CallInsights {
    const recommendations = this.generateRecommendations(rubricScores, sentimentScores);
    const bestMoment = this.findBestMoment(rubricScores, transcript);
    const missedOpportunity = this.findMissedOpportunity(rubricScores, transcript);
    const keyMoments = this.extractKeyMoments(rubricScores);

    return {
      bestMoment,
      missedOpportunity,
      keyMoments,
      recommendations,
    };
  }

  /**
   * Generate top 3 recommendations based on lowest scores
   */
  private static generateRecommendations(
    rubricScores: RubricScores,
    sentimentScores: SentimentScores
  ): string[] {
    const recommendations: Array<{ score: number; text: string }> = [];

    // Rubric-based recommendations
    if (rubricScores.speedToAnswer.points < 7) {
      recommendations.push({
        score: rubricScores.speedToAnswer.points,
        text: `Improve answer speed: Calls should be answered within 10 seconds. Consider adding staff or implementing a call routing system.`,
      });
    }

    if (rubricScores.greetingIdentification.points < 4) {
      recommendations.push({
        score: rubricScores.greetingIdentification.points,
        text: `Enhance greeting protocol: Staff should always include the practice name and their own name when answering calls.`,
      });
    }

    if (rubricScores.bookingAttempts.points < 8) {
      recommendations.push({
        score: rubricScores.bookingAttempts.points,
        text: `Increase booking attempts: Front desk should make at least 2-3 attempts to schedule the appointment during the call.`,
      });
    }

    if (rubricScores.offerMention.points < 7) {
      recommendations.push({
        score: rubricScores.offerMention.points,
        text: `Proactively mention new patient offers: Staff should clearly explain special promotions with specific details early in the conversation.`,
      });
    }

    if (rubricScores.contactInfoCapture.points < 3) {
      recommendations.push({
        score: rubricScores.contactInfoCapture.points,
        text: `Capture caller information: Even if they don't book, always collect name and phone number for follow-up.`,
      });
    }

    if (rubricScores.objectionHandling.points < 4) {
      recommendations.push({
        score: rubricScores.objectionHandling.points,
        text: `Improve objection handling: When callers hesitate, offer to hold a tentative appointment or schedule a callback.`,
      });
    }

    if (rubricScores.priceFraming.points < 4) {
      recommendations.push({
        score: rubricScores.priceFraming.points,
        text: `Frame pricing with value: Always explain what's included before mentioning the price.`,
      });
    }

    // Sentiment-based recommendations
    if (sentimentScores.warmth.points < 4) {
      recommendations.push({
        score: sentimentScores.warmth.points,
        text: `Increase warmth and friendliness: Train staff to use a welcoming tone and make callers feel valued.`,
      });
    }

    if (sentimentScores.confidence.points < 4) {
      recommendations.push({
        score: sentimentScores.confidence.points,
        text: `Build confidence: Ensure staff know answers to common questions about pricing, insurance, and availability.`,
      });
    }

    if (sentimentScores.empathy.points < 4) {
      recommendations.push({
        score: sentimentScores.empathy.points,
        text: `Show more empathy: Acknowledge caller concerns and validate their needs before moving to solutions.`,
      });
    }

    // Sort by lowest score and return top 3
    recommendations.sort((a, b) => a.score - b.score);
    return recommendations.slice(0, 3).map((r) => r.text);
  }

  /**
   * Find the best moment in the call
   */
  private static findBestMoment(
    rubricScores: RubricScores,
    transcript: TranscriptSegment[]
  ): CallInsights['bestMoment'] {
    // Check for strong booking attempt
    if (rubricScores.bookingAttempts.attempts.length > 0) {
      const bestAttempt = rubricScores.bookingAttempts.attempts[0];
      return {
        quote: bestAttempt,
        timestamp: 0,
        reason: 'Strong booking attempt - actively trying to schedule the patient',
      };
    }

    // Check for good offer explanation
    if (rubricScores.offerMention.points >= 7 && rubricScores.offerMention.evidence) {
      return {
        quote: rubricScores.offerMention.evidence,
        timestamp: 0,
        reason: 'Excellent explanation of new patient offer with specific details',
      };
    }

    // Check for great greeting
    if (rubricScores.greetingIdentification.points === 6 && rubricScores.greetingIdentification.evidence) {
      return {
        quote: rubricScores.greetingIdentification.evidence,
        timestamp: 0,
        reason: 'Professional greeting with practice name and staff identification',
      };
    }

    return undefined;
  }

  /**
   * Find the biggest missed opportunity
   */
  private static findMissedOpportunity(
    rubricScores: RubricScores,
    transcript: TranscriptSegment[]
  ): CallInsights['missedOpportunity'] {
    // No booking attempts
    if (rubricScores.bookingAttempts.count === 0) {
      return {
        quote: 'Throughout the call',
        timestamp: 0,
        reason: 'Never attempted to schedule an appointment - missed conversion opportunity',
      };
    }

    // Didn't capture contact info
    if (rubricScores.contactInfoCapture.points === 0) {
      return {
        quote: 'Throughout the call',
        timestamp: 0,
        reason: 'Failed to capture caller contact information for follow-up',
      };
    }

    // Didn't mention offer
    if (rubricScores.offerMention.points === 0) {
      return {
        quote: 'Throughout the call',
        timestamp: 0,
        reason: 'Never mentioned new patient specials or promotions',
      };
    }

    // Let lead walk on objection
    if (rubricScores.objectionHandling.points === 0 && rubricScores.objectionHandling.evidence) {
      return {
        quote: rubricScores.objectionHandling.evidence,
        timestamp: 0,
        reason: 'Caller expressed hesitation but receptionist didn\'t attempt to overcome it',
      };
    }

    return undefined;
  }

  /**
   * Extract key moments for display
   */
  private static extractKeyMoments(rubricScores: RubricScores) {
    return {
      bookingAttempts: rubricScores.bookingAttempts.attempts,
      offerExplanations: rubricScores.offerMention.evidence
        ? [rubricScores.offerMention.evidence]
        : [],
    };
  }
}
