# Cuemath AI Tutor Screener

> An AI-powered voice interviewer that screens tutor candidates in 5 minutes — with adaptive questions, real-time speech recognition (duplicate-free), and instant dimensional scorecards.

## Live Demo
https://cuemath-tutor-screener.onrender.com/

## Video Walkthrough
[Your Loom link here]

---

## Problem Chosen
**Problem 3: The AI Tutor Screener**

---

## What I Built

A production-ready tutor screening system with 4 screens:

1. **Landing Page** — Professional candidate intake matching Cuemath's brand
2. **Interview Page** — Real voice conversation: AI speaks questions via TTS, records answers, 5 questions × follow-up = 10 exchanges
3. **Scorecard Page** — Claude Sonnet analyzes the full transcript and generates a dimensional assessment with evidence
4. **HR Dashboard** — Interviewer view with search, filtering by recommendation, and candidate detail panel

---

## Key Technical Decisions

### The Speech Recognition Bug (and how I fixed it)

The most critical issue was duplicate text in voice transcription. The root cause: using `continuous: true` with `interimResults: true` and naively appending `finalText + interimText` causes words to repeat because the engine re-emits previously-seen words in the interim stream.

**Fix:** 
- `continuous: false` — single utterance mode, engine auto-stops after a speech pause
- Only `sessionFinal` accumulates within one recognition session
- `interimText` is a single live preview, never accumulated
- `onend` commits `sessionFinal` to the persistent `finalTextRef` and restarts if still recording
- Result: clean, zero-duplicate transcription

### Why Problem 3?
~60% of applicants choose Problem 1 (flashcards). Problem 3 requires voice UX, real-time state orchestration, and an assessment rubric — harder to build well, far more impressive when done right.

### Assessment Architecture
Rather than scoring during the interview (noisy), I collect the full transcript and send it to Claude in one structured prompt after completion. Claude has full context and produces evidence-based, calibrated scores.

### Security
- API key stored server-side only (`server.js`)
- Client calls `/api/analyze` (our proxy), never Anthropic directly
- Key never appears in frontend bundle, browser network tab, or GitHub

### Edge Cases Handled
- **One-word answers** → triggers `shortAnswerFollowUp` to prompt more
- **No-speech timeout** → 90-second recording limit with visual countdown
- **Browser not Chrome** → clear error message with guidance
- **Microphone denied** → explicit error with instructions
- **API failure** → graceful fallback scorecard, never blank screen
- **Long tangents** → submission always available; candidate controls pacing

---

## What I'd Improve With More Time

1. **Whisper transcription** — For non-native English speakers with accents, browser STT accuracy drops. A Whisper backend with WebSocket streaming would be more inclusive.
2. **Truly adaptive AI questions** — Use Claude to generate follow-ups based on the actual answer content (not pre-scripted), making conversations feel genuinely responsive.
3. **Audio recording** — Store the audio file alongside the transcript so HR can replay specific moments.
4. **Calibration against human interviews** — Run 50+ interviews, compare AI scores to human interviewer decisions, and tune the rubric prompt for better correlation.
5. **Multi-language support** — Many great tutors may prefer to interview in Hindi.

---

## Architecture

```
Frontend (React 18 + Vite)
├── LandingPage      — Candidate intake
├── InterviewPage    — Voice conversation engine
│   ├── useTTS       — Text-to-speech (AI interviewer voice)
│   └── useSpeech    — Speech recognition (fixed, no duplicates)
├── ScorecardPage    — AI-powered dimensional analysis
└── DashboardPage    — HR candidate review

Backend (Express 4)
└── /api/analyze     — Secure Anthropic API proxy (key never exposed)
```

---

## Setup & Run

```bash
# Clone and install
npm install
npm install express@4

# Run locally (frontend dev mode, no backend)
npm run dev

# Build and run full stack
npm run build
ANTHROPIC_API_KEY=sk-ant-... node server.js
# → http://localhost:3000
```

---

## Deploy to Render

1. Push to GitHub (public repo, `.env` in `.gitignore`)
2. New Web Service on Render
3. Build: `npm install && npm run build`
4. Start: `node server.js`
5. Environment variable: `ANTHROPIC_API_KEY` = your key
6. Done — live URL in ~3 minutes

---

## Tech Stack
- React 18 + Vite (frontend)
- Web Speech API — SpeechRecognition + SpeechSynthesis (voice)
- Claude Sonnet via Anthropic API (assessment)
- Express 4 (backend proxy)
- Render (deployment)

---

*Built for the Cuemath AI Builder Challenge · April 2026*
