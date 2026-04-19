# Cuemath AI Tutor Screener

> An AI-powered voice interviewer that screens tutor candidates in 5 minutes — with adaptive conversation, real-time speech recognition, and instant dimensional scorecards.

## Live Demo
[Deployed URL here]

## Video Walkthrough
[Loom/YouTube link here]

---

## What I Built

**Problem 3: The AI Tutor Screener**

An end-to-end tutor screening system that:
1. Conducts a real **voice conversation** with candidates using the browser's Web Speech API
2. Asks **5 structured questions** with adaptive **follow-ups** (10 total exchanges)
3. Uses Claude Sonnet to **analyze the full transcript** after the interview
4. Generates a **detailed scorecard** across 5 dimensions with specific evidence
5. Saves results to an **Interviewer Dashboard** for HR review

---

## Key Decisions & Tradeoffs

### Why Problem 3?
Most candidates pick Problem 1 (Flashcard Engine) — it's the obvious choice. Problem 3 is genuinely hard to build well: voice interfaces are messy, real conversations require careful orchestration, and assessment rubrics need nuance. I chose it precisely because it's harder, and because a great execution would stand out.

### Voice-First Design
I used the Web Speech API (SpeechRecognition + SpeechSynthesis) instead of Whisper/cloud transcription. The tradeoff: Whisper is more accurate but requires a backend round-trip during the interview, introducing latency that breaks conversational flow. Browser-native STT is slightly less accurate but feels instantaneous — critical for a real-time voice interview. For a production system, I'd use Whisper on the backend with streaming WebSockets.

### Adaptive Follow-Ups
Every question has a scripted follow-up that digs deeper. This isn't random — it's designed to surface dimension-specific signals:
- "What would you do differently?" → reveals self-awareness (patience)
- "How would you check if they understood?" → reveals teaching quality (simplicity)

### Assessment Architecture
Rather than scoring during the interview (noisy, unreliable), I collect the full transcript and send it to Claude in one structured prompt after the interview completes. This gives Claude full context and produces much more coherent, evidence-based scores.

### Security
The API key is stored server-side and proxied through `/api/analyze`. No keys in the frontend bundle. The client sends the raw prompt; the server adds authentication.

---

## Dimension Rubric

| Dimension | What We Look For |
|-----------|-----------------|
| Communication Clarity | Organized, easy-to-follow explanations without jargon |
| Warmth & Empathy | Genuine care for student confidence and emotional state |
| Ability to Simplify | Uses analogies, examples, and scaffolding effectively |
| Patience | Calm, methodical approach to confusion and frustration |
| English Fluency | Natural vocabulary, appropriate register, coherent flow |

---

## Architecture

```
Frontend (React + Vite)
├── LandingPage — Candidate intake form
├── InterviewPage — Voice recording + AI TTS conversation
├── ScorecardPage — AI-powered dimensional analysis
└── DashboardPage — HR view of all candidates

Backend (Express)
└── /api/analyze — Secure Anthropic API proxy
```

---

## What I'd Improve With More Time

1. **Whisper transcription** — Replace browser STT with a Whisper backend for better accuracy, especially for non-native English speakers with accents
2. **WebSocket streaming** — Stream the AI's assessment in real-time rather than waiting for the full response
3. **Adaptive questioning** — Use Claude to dynamically generate follow-ups based on the candidate's actual answer, not pre-scripted ones
4. **Calibration** — Run 50+ interviews and calibrate the rubric against human interviewer decisions to reduce bias
5. **Audio recording** — Record and store the audio clip alongside the transcript, so HR can replay specific moments
6. **Multi-language support** — Many great tutors may be more comfortable in Hindi; offer the interview in their language
7. **Database** — Replace localStorage with a proper DB (PostgreSQL via Supabase) for persistent candidate storage

---

## Interesting Challenges

**Challenge 1: SpeechSynthesis voice selection**
Chrome's default TTS voice sounds robotic. Found that filtering for Google-branded `en-US` voices produces a much more natural interviewer. Added fallback chains for Firefox and Safari.

**Challenge 2: Timer + Recording coordination**
The 90-second recording timer needs to stop cleanly when the user manually stops recording — otherwise it fires the stop event twice. Solved with `clearInterval` in both the manual stop handler and the `onend` callback.

**Challenge 3: Sequential async voice interactions**
The interview has a strict phase sequence (speak question → wait for answer → speak follow-up → etc.). Managing this with async/await and React state required careful sequencing to avoid race conditions where the UI would jump ahead before TTS finished.

---

## Local Setup

```bash
# Clone the repo
git clone [repo-url]
cd cuemath-tutor-screener

# Install dependencies
npm install

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Build frontend
npm run build

# Run full stack
node server.js
# → App running at http://localhost:3000
```

For frontend dev only (no backend):
```bash
npm run dev
# API calls go directly to Anthropic (add key to ScorecardPage temporarily)
```

---

## Deployment (Render)

1. Push to GitHub
2. Create new Render Web Service
3. Build command: `npm install && npm run build`
4. Start command: `node server.js`
5. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Inline CSS with design system tokens
- **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)
- **AI**: Claude Sonnet via Anthropic API
- **Backend**: Express.js (API proxy)
- **Deployment**: Render / Vercel

---

*Built for the Cuemath AI Builder Challenge, April 2026*
