# AI Patient Conversion Scorecard

A professional web-based tool that simulates mystery-shopper phone calls to dental practices, providing real-time call playback, AI-powered transcription, and comprehensive scoring based on objective rubrics and sentiment analysis.

## 🎯 Overview

The AI Patient Conversion Scorecard helps dental practices evaluate and improve their phone conversion rates by:

- **Live Mystery Calls**: Automated AI caller that simulates a realistic new patient inquiry
- **Real-Time Playback**: Listen to the call live as it happens through your browser
- **IVR Navigation**: Automatically handles phone tree menus or provides manual assist
- **Dual Scoring System**:
  - Objective Rubric (70 pts): Algorithmic scoring based on repeatable criteria
  - Sentiment Analysis (30 pts): AI-powered evaluation of soft skills and tone
- **Detailed Reports**: Comprehensive scorecard with evidence, insights, and recommendations
- **Export Options**: PDF reports and email delivery

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Telephony**: Twilio Programmable Voice + Media Streams
- **AI Services**:
  - OpenAI GPT-4 for conversation and scoring
  - OpenAI Whisper for transcription
- **Database**: In-memory storage (easily swappable with Supabase)
- **Real-time**: WebSockets for live audio streaming

### Key Components

```
app/
├── page.tsx                  # Landing page with practice form
├── call/[callId]/           # Live call interface
├── scorecard/[callId]/      # Scorecard report
└── api/
    ├── call/                # Call management endpoints
    ├── score/               # Scoring engine endpoints
    ├── export/              # PDF and email export
    └── webhook/             # Twilio webhooks

components/
├── ui/                      # Form, modal, call interface
└── scorecard/               # Score displays and breakdowns

lib/
├── services/                # Business logic
│   ├── twilio.ts           # Twilio integration
│   ├── ai-caller.ts        # AI conversation logic
│   ├── rubric-scorer.ts    # Objective scoring (70 pts)
│   ├── sentiment-scorer.ts # Sentiment scoring (30 pts)
│   ├── insights-generator.ts
│   └── storage.ts          # Data persistence
├── types/                   # TypeScript definitions
└── utils/                   # Helper functions
```

## 📋 Prerequisites

- Node.js 18+ and npm
- Twilio account with:
  - Phone number capable of making outbound calls
  - Programmable Voice API access
  - TwiML Apps configured
- OpenAI API key with GPT-4 access
- (Optional) Supabase account for production database

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd Phone-Grades
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxx

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Optional: Supabase (for production)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 3. Twilio Setup

#### Create a TwiML Application

1. Go to Twilio Console → Voice → TwiML → TwiML Apps
2. Create new TwiML App
3. Set Voice Request URL to: `https://your-domain.com/api/webhook/twiml`
4. Set Status Callback URL to: `https://your-domain.com/api/webhook/status`
5. Copy the TwiML App SID to your `.env` file

#### Configure Your Twilio Phone Number

1. Go to Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Under Voice Configuration:
   - Configure with: TwiML App
   - Select your TwiML App
4. Save

### 4. Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Production Deployment

#### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

After deployment:
1. Set environment variables in Vercel dashboard
2. Update Twilio webhook URLs to your Vercel domain
3. Ensure your Vercel deployment supports WebSockets (may need custom configuration)

#### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS (EC2, ECS, or Amplify)
- Google Cloud Run
- Azure App Service

**Important**: Ensure your deployment platform supports:
- WebSocket connections (for live audio streaming)
- Sufficient memory for AI processing (recommended: 1GB+)
- HTTPS (required for Twilio webhooks)

## 📊 Scoring System

### Objective Rubric (70 points)

| Category | Max Points | Criteria |
|----------|------------|----------|
| Speed to Answer | 10 | ≤10s = 10pts, 11-20s = 7pts, 21-30s = 4pts, >30s = 0pts |
| Greeting & ID | 6 | Name + Staff = 6pts, Name only = 4pts, Generic = 2pts |
| New Patient Acceptance | 6 | Clear yes + next step = 6pts, Clear yes = 4pts, Hesitant = 2pts |
| Insurance Handling | 8 | Clear + booking = 8pts, Verify + forward = 6pts, Gatekeeping = 2pts |
| Offer Mention | 10 | Specific + details = 10pts, Vague = 7pts, Check website = 3pts |
| Price Framing | 6 | Value framing = 6pts, Range + value = 4pts, Raw price = 2pts |
| Booking Attempts | 12 | 3+ attempts = 12pts, 2 attempts = 8pts, 1 attempt = 4pts |
| Contact Info Capture | 6 | Name + contact = 6pts, One item = 3pts, None = 0pts |
| Objection Handling | 6 | Reassurance + next step = 6pts, Mild = 3pts, Lets walk = 0pts |

### Sentiment Scoring (30 points)

Each dimension scored 0-6 points:
- **Warmth**: Friendliness and welcoming tone
- **Confidence**: Certainty and authority
- **Clarity**: Clear communication
- **Empathy**: Understanding and validation
- **Professional Tone**: Appropriate and polished

### Letter Grades

- **A**: 90-100 points
- **B**: 80-89 points
- **C**: 70-79 points
- **D**: 60-69 points
- **F**: <60 points

## 🎭 How It Works

### User Flow

1. **Practice enters information**: Name, phone number, optional details (insurance, offers)
2. **Consent modal**: User confirms authorization to test the number
3. **Call initiated**: Twilio places outbound call to practice
4. **Live playback**: User hears the call in real-time through the browser
5. **IVR handling**: Auto-navigation or manual assist for phone menus
6. **AI conversation**: Simulated patient asks about:
   - New patient acceptance
   - Insurance coverage
   - Pricing and offers
   - Availability
   - Gives objections to test booking skills
7. **Call ends**: After 3-4 minutes or natural conclusion
8. **Processing**: Transcription with speaker diarization
9. **Scoring**: Both rubric and sentiment analysis run
10. **Report**: Comprehensive scorecard with insights and recommendations

### AI Caller Script

The AI caller follows a natural conversation flow:

```
Opening: "Hi, I'm looking for a new dentist. Are you accepting new patients?"

Key Questions:
- "Do you take [Insurance]?"
- "How much is a cleaning or exam?"
- "Do you have any new patient specials?"
- "Do you have anything available this week?"

Objections:
- "I'm not sure, I need to check my schedule"
- "What's the next step if I wanted to come in?"

Closing: "Thank you, that was really helpful!"
```

The AI adapts based on receptionist responses while ensuring all key topics are covered.

## 🔧 Customization

### Modify Scoring Criteria

Edit `/lib/services/rubric-scorer.ts` to adjust point values or add new categories.

### Change AI Caller Behavior

Edit `/lib/services/ai-caller.ts` to modify:
- Conversation flow
- Questions asked
- Objection handling
- Personality traits

### Adjust Sentiment Dimensions

Edit `/lib/services/sentiment-scorer.ts` to change:
- Scoring dimensions
- Point allocations
- Evaluation criteria

## 🗄️ Database Migration (Production)

The default implementation uses in-memory storage. For production, migrate to Supabase:

### 1. Create Supabase Tables

```sql
CREATE TABLE call_records (
  id TEXT PRIMARY KEY,
  practice_info JSONB NOT NULL,
  call_sid TEXT,
  audio_url TEXT,
  transcript JSONB,
  status TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  rubric_scores JSONB,
  sentiment_scores JSONB,
  overall_score INTEGER,
  letter_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_call_records_created_at ON call_records(created_at DESC);
CREATE INDEX idx_call_records_status ON call_records(status);
```

### 2. Update Storage Service

Uncomment the Supabase implementation in `/lib/services/storage.ts`

### 3. Add Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🐛 Troubleshooting

### Calls Not Connecting

- Verify Twilio credentials are correct
- Check that your Twilio number is active
- Ensure webhook URLs are publicly accessible (use ngrok for local testing)
- Verify the destination number is valid

### WebSocket Errors

- Check that `NEXT_PUBLIC_WS_URL` is set correctly
- Ensure your hosting platform supports WebSocket connections
- For Vercel, you may need to use a separate WebSocket server

### Scoring Errors

- Verify OpenAI API key has GPT-4 access
- Check that the transcript is properly formatted
- Review OpenAI API rate limits

### Audio Not Playing

- Ensure Twilio Media Streams are enabled
- Check browser console for WebSocket errors
- Verify audio permissions in browser

## 📝 API Endpoints

### Call Management

- `POST /api/call/initiate` - Start a new mystery call
- `GET /api/call/[callId]` - Get call details
- `POST /api/call/ivr` - Send DTMF digits for IVR navigation

### Scoring

- `POST /api/score/[callId]` - Generate scores for a call
- `GET /api/score/[callId]` - Retrieve existing scores

### Export

- `GET /api/export/pdf/[callId]` - Download PDF report
- `POST /api/export/email` - Email report to address

### Webhooks (Twilio)

- `POST /api/webhook/twiml` - TwiML for call routing
- `POST /api/webhook/status` - Call status updates
- `POST /api/webhook/recording` - Recording complete notification

## 🔒 Security Considerations

- Never commit `.env` file to version control
- Use HTTPS in production for all webhooks
- Validate Twilio webhook signatures
- Implement rate limiting for API endpoints
- Store sensitive data (recordings, transcripts) securely
- Comply with recording consent laws in your jurisdiction

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues or questions, please open a GitHub issue or contact support.

---

**Built with ❤️ for dental practices looking to improve their phone conversion rates.**
