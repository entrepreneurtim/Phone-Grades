// Core Types for AI Patient Scorecard

export interface PracticeInfo {
  practiceName: string;
  phoneNumber: string;
  city?: string;
  state?: string;
  primaryOffer?: string;
  insuranceType?: string;
}

export interface CallRecord {
  id: string;
  practiceInfo: PracticeInfo;
  callSid?: string;
  audioUrl?: string;
  transcript?: TranscriptSegment[];
  status: 'initiating' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'voicemail';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  rubricScores?: RubricScores;
  sentimentScores?: SentimentScores;
  overallScore?: number;
  letterGrade?: LetterGrade;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptSegment {
  speaker: 'ai' | 'receptionist';
  text: string;
  timestamp: number; // seconds from start
  confidence?: number;
}

// Objective Rubric Scoring (70 points total)
export interface RubricScores {
  speedToAnswer: SpeedToAnswerScore;
  greetingIdentification: GreetingScore;
  newPatientAcceptance: NewPatientScore;
  insuranceHandling: InsuranceScore;
  offerMention: OfferScore;
  priceFraming: PriceFramingScore;
  bookingAttempts: BookingAttemptsScore;
  contactInfoCapture: ContactInfoScore;
  objectionHandling: ObjectionHandlingScore;
  total: number; // 0-70
  evidence: ScoringEvidence;
}

export interface SpeedToAnswerScore {
  points: number; // 0-10
  seconds?: number;
  category: '≤10 sec' | '11-20 sec' | '21-30 sec' | '30+ sec / voicemail';
}

export interface GreetingScore {
  points: number; // 0-6
  category: 'name + staff' | 'name only' | 'generic' | 'no greeting';
  evidence?: string;
}

export interface NewPatientScore {
  points: number; // 0-6
  category: 'clear yes + next step' | 'clear yes' | 'hesitant' | 'no/dismissive';
  evidence?: string;
}

export interface InsuranceScore {
  points: number; // 0-8
  category: 'clear + booking' | 'clear but stalls' | 'verify + forward' | 'gatekeeping' | 'wrong/none';
  evidence?: string;
}

export interface OfferScore {
  points: number; // 0-10
  category: 'specific + details' | 'vague' | 'check website' | 'no mention';
  evidence?: string;
}

export interface PriceFramingScore {
  points: number; // 0-6
  category: 'value framing' | 'range + value' | 'raw price' | 'avoidance';
  evidence?: string;
}

export interface BookingAttemptsScore {
  points: number; // 0-12
  count: number;
  attempts: string[]; // actual quotes
}

export interface ContactInfoScore {
  points: number; // 0-6
  category: 'name + contact' | 'one item' | 'no attempt';
  evidence?: string;
}

export interface ObjectionHandlingScore {
  points: number; // 0-6
  category: 'reassurance + next step' | 'mild reassurance' | 'lets lead walk';
  evidence?: string;
}

export interface ScoringEvidence {
  [key: string]: {
    quote: string;
    timestamp: number;
  }[];
}

// Sentiment Scoring (30 points total)
export interface SentimentScores {
  warmth: SentimentDimension;
  confidence: SentimentDimension;
  clarity: SentimentDimension;
  empathy: SentimentDimension;
  professionalTone: SentimentDimension;
  total: number; // 0-30
}

export interface SentimentDimension {
  points: number; // 0-6
  justification: string;
}

export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeBreakdown {
  overall: LetterGrade;
  objective: LetterGrade;
  sentiment: LetterGrade;
}

// IVR Navigation
export interface IVRState {
  detected: boolean;
  options?: string[];
  selectedOption?: string;
  retryCount: number;
  needsUserAssist: boolean;
}

// WebSocket Messages
export interface WSMessage {
  type: 'audio' | 'status' | 'transcript' | 'ivr' | 'error';
  data: any;
}

// AI Caller State
export interface CallerState {
  currentStep: number;
  hasAskedAboutNewPatients: boolean;
  hasAskedAboutInsurance: boolean;
  hasAskedAboutPricing: boolean;
  hasAskedAboutOffers: boolean;
  hasAskedAboutAvailability: boolean;
  bookingAttempts: number;
  objections: string[];
}

// Insights & Recommendations
export interface CallInsights {
  bestMoment?: {
    quote: string;
    timestamp: number;
    reason: string;
  };
  missedOpportunity?: {
    quote: string;
    timestamp: number;
    reason: string;
  };
  keyMoments: {
    bookingAttempts: string[];
    offerExplanations: string[];
  };
  recommendations: string[];
}

// Export Options
export interface ExportRequest {
  callId: string;
  format: 'pdf' | 'email';
  email?: string;
}
