import { useState, useEffect, useRef, useCallback } from "react";
import { T } from "../theme";
import { useTTS } from "../hooks/useTTS";

/* ─────────────────────────────────────────────────────────────
   Interview question bank — designed to reveal soft skills
   Each has a mainQ + followUp (asked when answer is short/vague)
   ───────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: "background",
    main: "Let's start easy — tell me a bit about your teaching background. How long have you been teaching, and what age groups do you enjoy working with most?",
    followUp: "That's interesting! What is it about that age group that you enjoy most?",
    shortAnswerFollowUp: "Could you tell me a little more? For example, how many years, and with which grades or subjects?"
  },
  {
    id: "explain",
    main: "Here's a teaching scenario: I want you to explain what a fraction is to a 9-year-old who has never heard the word before. Go ahead — speak as if I'm the student.",
    followUp: "Good! And how would you check whether I actually understood your explanation?",
    shortAnswerFollowUp: "I'd love to hear the actual explanation — imagine you're speaking directly to the student right now."
  },
  {
    id: "struggling",
    main: "A student has been staring at the same problem for five minutes. They look frustrated and say they don't understand. Walk me through exactly what you do — step by step.",
    followUp: "And what if they still don't understand after your second attempt? What then?",
    shortAnswerFollowUp: "Can you be more specific? What would your very first words to that student be?"
  },
  {
    id: "patience",
    main: "Tell me about a challenging student you've worked with — maybe someone who was disengaged, difficult, or very slow to learn. How did you handle it?",
    followUp: "Looking back, what would you have done differently with that student?",
    shortAnswerFollowUp: "I'd like to hear more details — what made it challenging, and what specifically did you try?"
  },
  {
    id: "engagement",
    main: "Many students think math is boring. What's a specific technique or activity you use to make it genuinely fun and engaging? Give me a real example.",
    followUp: "Has that actually worked? Tell me about a moment when you saw a student's attitude toward math change.",
    shortAnswerFollowUp: "Can you describe that technique in a bit more detail — what does it actually look like in a lesson?"
  },
];

/* ────── Waveform bars component ────── */
function Waveform({ active, color }) {
  const [bars, setBars] = useState(Array(18).fill(12));
  const rafRef = useRef(null);

  useEffect(() => {
    if (active) {
      const animate = () => {
        setBars(Array.from({ length: 18 }, () => 10 + Math.random() * 50));
        rafRef.current = requestAnimationFrame(animate);
      };
      // Throttle to ~12fps for smooth but not jittery animation
      let last = 0;
      const throttled = (ts) => {
        if (ts - last > 80) { animate(); last = ts; }
        rafRef.current = requestAnimationFrame(throttled);
      };
      rafRef.current = requestAnimationFrame(throttled);
    } else {
      cancelAnimationFrame(rafRef.current);
      setBars(Array(18).fill(12));
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 44, justifyContent: "center" }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 99,
            background: color,
            transition: "height 0.08s ease",
            opacity: active ? 0.85 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

/* ────── Main component ────── */
export default function InterviewPage({ candidateInfo, onComplete }) {
  const { isSpeaking, speak, cancel } = useTTS();

  // phase: "init" | "asking" | "listening" | "processing" | "followup" | "done"
  const [phase, setPhase]           = useState("init");
  const [currentQ, setCurrentQ]     = useState(0);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [displayText, setDisplayText] = useState(""); // clean, no duplicates
  const [interimText, setInterimText] = useState(""); // live preview only
  const [timeLeft, setTimeLeft]     = useState(90);
  const [error, setError]           = useState("");
  const [transcript, setTranscript] = useState([]);
  const [browserOk, setBrowserOk]   = useState(true);

  // Refs — these survive re-renders without causing loops
  const recognitionRef   = useRef(null);
  const finalTextRef     = useRef("");   // accumulates confirmed final segments
  const timerRef         = useRef(null);
  const transcriptRef    = useRef([]);
  const phaseRef         = useRef("init");
  const isMountedRef     = useRef(true);

  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p); };

  useEffect(() => {
    isMountedRef.current = true;
    // Check browser support upfront
    if (!window.speechSynthesis) setBrowserOk(false);
    return () => {
      isMountedRef.current = false;
      cancel();
      stopRecording();
    };
  }, []);

  /* ── Start the interview once mounted ── */
  useEffect(() => {
    const init = async () => {
      await delay(600);
      if (!isMountedRef.current) return;
      setPhaseSync("asking");
      const greeting = `Hello ${candidateInfo.name}, welcome to your Cuemath tutor screening interview. I'm your AI interviewer. We'll spend about 5 minutes together — I'll ask you five questions about your teaching approach. Just speak naturally and be yourself. Let's begin.`;
      await speak(greeting);
      if (!isMountedRef.current) return;
      await delay(400);
      await speak(QUESTIONS[0].main);
      if (!isMountedRef.current) return;
      setPhaseSync("listening");
    };
    init();
  }, []);

  /* ── SPEECH RECOGNITION — FIXED ── */
  const startRecording = async () => {
    setError("");

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice recognition requires Google Chrome. Please open this page in Chrome.");
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied. Please allow microphone access in your browser settings and refresh.");
      return;
    }

    // Reset state
    finalTextRef.current = "";
    setDisplayText("");
    setInterimText("");

    const recognition = new SR();

    /*
     * CRITICAL SETTINGS:
     * - continuous: false → prevents duplicate text bug
     * - interimResults: true → live preview
     * - lang: en-IN → Indian English for better accuracy
     * - maxAlternatives: 3 → gives engine more context for better accuracy
     */
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Indian English for better local accent recognition
    recognition.maxAlternatives = 3; // More alternatives = better accuracy

    let sessionFinal = ""; // final text for THIS session only

    recognition.onstart = () => {
      if (!isMountedRef.current) return;
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      if (!isMountedRef.current) return;
      sessionFinal = "";
      let currentInterim = "";

      // Only iterate from resultIndex — never re-process old results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += text + " ";
        } else {
          currentInterim = text; // single latest interim, not accumulated
        }
      }

      // Update display: confirmed finals (all sessions) + current interim
      const confirmed = finalTextRef.current + sessionFinal;
      setDisplayText(confirmed);
      setInterimText(currentInterim);
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      // Commit this session's final text
      finalTextRef.current += sessionFinal;
      sessionFinal = "";
      setInterimText("");
      setDisplayText(finalTextRef.current.trim());

      // If still in listening phase, restart for continuous experience
      if (phaseRef.current === "listening" && isRecordingRef.current) {
        try {
          recognitionRef.current?.start();
        } catch {
          // recognition might not be restartable, just stop
          setIsRecording(false);
          clearInterval(timerRef.current);
        }
      }
    };

    recognition.onerror = (event) => {
      if (!isMountedRef.current) return;
      if (event.error === "no-speech") return; // normal, user paused
      if (event.error === "aborted") return;   // intentional stop
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please enable it in browser settings.");
      } else {
        setError(`Recording issue (${event.error}). Please try again.`);
      }
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Timer
    setTimeLeft(90);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { stopRecording(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Ref to track isRecording for the onend restart logic
  const isRecordingRef = useRef(false);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    isRecordingRef.current = false;
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch {}
    setInterimText("");
  }, []);

  /* ── Submit answer ── */
  const submitAnswer = async () => {
    stopRecording();
    await delay(200); // let onend commit final text

    const answer = finalTextRef.current.trim();
    setError("");

    // Edge case: empty or very short answer
    if (!answer || answer.split(" ").length < 3) {
      const q = QUESTIONS[currentQ];
      // Use shortAnswerFollowUp to prompt more
      if (!isFollowUp) {
        setPhaseSync("asking");
        await speak(q.shortAnswerFollowUp);
        finalTextRef.current = "";
        setDisplayText("");
        setPhaseSync("listening");
        return;
      } else {
        // On follow-up, accept even short answers and move on
      }
    }

    // NEW: Detect nonsense/filler answers
    const lowerAnswer = answer.toLowerCase();
    const isNonsense = 
      lowerAnswer.includes("blah blah") ||
      lowerAnswer.match(/\b(\w+)\s+\1\s+\1/g) || // repeated words 3+ times
      (answer.split(" ").length > 5 && new Set(answer.toLowerCase().split(" ")).size < 4); // very low vocabulary diversity

    if (isNonsense) {
      setError("⚠️ Your answer seems incomplete or unclear. Please provide a real, thoughtful response. This will significantly impact your score.");
      // Give them a chance to re-record
      finalTextRef.current = "";
      setDisplayText("");
      return;
    }

    const q = QUESTIONS[currentQ];
    const question = isFollowUp ? q.followUp : q.main;
    const entry = {
      questionId: q.id,
      role: isFollowUp ? "follow-up" : "main",
      question,
      answer: answer || "(no response)",
      wordCount: (answer || "").split(" ").filter(Boolean).length,
      timestamp: new Date().toISOString(),
    };

    const updated = [...transcriptRef.current, entry];
    transcriptRef.current = updated;
    setTranscript(updated);
    finalTextRef.current = "";
    setDisplayText("");

    const totalQuestions = QUESTIONS.length;

    if (!isFollowUp) {
      // Ask follow-up for this question
      setIsFollowUp(true);
      setPhaseSync("processing");
      await delay(800);
      setPhaseSync("asking");
      await speak(q.followUp);
      setPhaseSync("listening");
    } else {
      // Move to next question
      setIsFollowUp(false);
      const next = currentQ + 1;
      if (next < totalQuestions) {
        setCurrentQ(next);
        setPhaseSync("processing");
        await delay(1000);
        setPhaseSync("asking");
        await speak(QUESTIONS[next].main);
        setPhaseSync("listening");
      } else {
        // All done
        setPhaseSync("done");
        await speak(`Thank you so much, ${candidateInfo.name}. That's the end of the interview. You did great — we'll now analyze your responses and generate your detailed scorecard. Please give us just a moment.`);
        await delay(1500);
        if (isMountedRef.current) {
          onComplete({
            transcript: transcriptRef.current,
            candidateInfo,
            completedAt: new Date().toISOString(),
          });
        }
      }
    }
  };

  /* ── Progress ── */
  const totalSteps = QUESTIONS.length * 2;
  const doneSteps  = transcript.length;
  const pct        = Math.round((doneSteps / totalSteps) * 100);
  const q          = QUESTIONS[Math.min(currentQ, QUESTIONS.length - 1)];
  const displayQ   = isFollowUp ? q.followUp : q.main;

  const phaseLabel = {
    init:       "Preparing your interview…",
    asking:     isSpeaking ? "AI is speaking…" : "Get ready…",
    listening:  "Your turn to speak",
    processing: "Processing…",
    followup:   isSpeaking ? "AI is speaking…" : "Follow-up",
    done:       "Interview complete!",
  }[phase] || "";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', system-ui, sans-serif", color: T.body }}>

      {/* ── Top bar ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill={T.green}/>
              <path d="M17 5l3.5 8H28l-6.5 5 2.5 8L17 22l-7 4 2.5-8L6 13h7.5L17 5Z" fill="white"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.heading }}>Cuemath Screener</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: T.subtle }}>
              {phase === "done" ? "Complete" : `Q ${Math.min(currentQ + 1, QUESTIONS.length)} of ${QUESTIONS.length}`}
            </span>
            {/* Step dots */}
            <div style={{ display: "flex", gap: 5 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ width: 28, height: 4, borderRadius: 99, transition: "background 0.3s", background: i < currentQ ? T.green : i === currentQ ? T.green : T.border, opacity: i === currentQ ? 1 : i < currentQ ? 0.7 : 1 }} />
              ))}
            </div>
          </div>
        </div>
        {/* Progress line */}
        <div style={{ height: 2, background: T.border }}>
          <div style={{ height: "100%", width: `${pct}%`, background: T.green, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* AI Avatar card */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: "2rem 1.5rem", marginBottom: "1.25rem", textAlign: "center", boxShadow: T.shadow }}>
          {/* Avatar */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            {(isSpeaking) && (
              <>
                <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `2px solid ${T.greenBorder}`, animation: "ripple1 2s ease-out infinite" }} />
                <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: `2px solid ${T.greenBorder}`, animation: "ripple1 2s ease-out 0.5s infinite", opacity: 0.5 }} />
              </>
            )}
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green} 0%, #00D68F 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="11" r="5.5" fill="white" opacity="0.95"/>
                <path d="M5 29c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.95"/>
              </svg>
            </div>
            {/* Online dot */}
            <div style={{ position: "absolute", bottom: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "#22C55E", border: "2.5px solid white", zIndex: 2 }} />
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.subtle, margin: "0 0 4px" }}>
            {phaseLabel}
          </p>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
            <strong style={{ color: T.heading, fontWeight: 600 }}>Cuemath AI Interviewer</strong>
          </p>

          {/* Waveform */}
          <div style={{ marginTop: "1rem" }}>
            <Waveform active={isSpeaking || isRecording} color={isRecording ? T.red : T.green} />
          </div>

          {/* Speaking / recording status */}
          {isSpeaking && (
            <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, background: T.greenLight, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "block", animation: "pulse 1.2s infinite" }} />
              <span style={{ fontSize: 12, color: T.greenText, fontWeight: 500 }}>AI is speaking</span>
            </div>
          )}
          {isRecording && (
            <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, background: T.redLight, borderRadius: 20, padding: "4px 12px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.red, display: "block", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 12, color: T.red, fontWeight: 500 }}>Recording · {timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Question display */}
        {(phase === "listening" || phase === "asking" || phase === "processing" || phase === "followup") && phase !== "done" && (
          <div style={{ background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: T.rMd, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.greenText, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              {isFollowUp ? "↳ Follow-up" : `Question ${currentQ + 1} of ${QUESTIONS.length}`}
            </div>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: T.heading, fontWeight: 500 }}>{displayQ}</p>
          </div>
        )}

        {/* Done state */}
        {phase === "done" && (
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: "2.5rem", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.greenLight, border: `2px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 13L10.5 18.5L21 8" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: T.heading }}>Interview Complete!</h2>
            <p style={{ color: T.muted, fontSize: 15, margin: "0 0 1.5rem" }}>Generating your personalised scorecard…</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: T.green, animation: `bounce 1.4s ease-in-out ${i * 0.22}s infinite` }}/>
              ))}
            </div>
          </div>
        )}

        {/* Live transcript box — shown when listening */}
        {phase === "listening" && (
          <>
            <div style={{
              background: T.white,
              border: `1.5px solid ${isRecording ? "#FEB2B2" : T.border}`,
              borderRadius: T.rMd,
              padding: "1rem 1.25rem",
              marginBottom: "1rem",
              minHeight: 100,
              transition: "border-color 0.2s",
              boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Your Answer</div>
              {(displayText || interimText) ? (
                <p style={{ margin: 0, fontSize: 14.5, color: T.body, lineHeight: 1.7 }}>
                  {displayText}
                  {interimText && <span style={{ color: T.subtle }}> {interimText}</span>}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: T.placeholder, fontStyle: "italic", lineHeight: 1.6 }}>
                  {isRecording ? "Listening… speak clearly into your microphone" : "Press 'Start Recording' below and speak your answer"}
                </p>
              )}
            </div>

            {/* Edge case warnings */}
            {isRecording && timeLeft <= 15 && (
              <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: T.r, padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>⏰</span>
                <span style={{ fontSize: 13, color: T.amber }}>Only {timeLeft} seconds left — wrap up your answer</span>
              </div>
            )}

            {error && (
              <div style={{ background: T.redLight, border: `1px solid ${T.redBorder}`, borderRadius: T.r, padding: "10px 14px", marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, color: T.red }}>{error}</p>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: 10 }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  style={{ flex: 1, background: T.green, border: "none", borderRadius: T.rMd, padding: "13px", color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.greenHover}
                  onMouseLeave={e => e.currentTarget.style.background = T.green}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="1" width="6" height="9" rx="3" fill="white"/>
                    <path d="M2 8a6 6 0 0 0 12 0" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <line x1="8" y1="14" x2="8" y2="16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{ flex: 1, background: T.redLight, border: `1.5px solid ${T.redBorder}`, borderRadius: T.rMd, padding: "13px", color: T.red, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}
                >
                  ⏹  Stop Recording
                </button>
              )}

              {!isRecording && (displayText || interimText) && (
                <button
                  onClick={submitAnswer}
                  style={{ flex: 1, background: T.heading, border: "none", borderRadius: T.rMd, padding: "13px", color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", transition: "background 0.18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#333"}
                  onMouseLeave={e => e.currentTarget.style.background = T.heading}
                >
                  Submit Answer →
                </button>
              )}
            </div>

            {/* Tip */}
            <p style={{ textAlign: "center", fontSize: 12, color: T.placeholder, marginTop: 10 }}>
              Speak naturally · Take your time · {transcript.length} of {totalSteps} answers recorded
            </p>
          </>
        )}

        {/* Browser not supported */}
        {!browserOk && (
          <div style={{ background: T.amberLight, border: `1px solid ${T.amberBorder}`, borderRadius: T.rMd, padding: "1.25rem" }}>
            <p style={{ margin: 0, fontWeight: 600, color: T.amber }}>⚠️ Browser Not Supported</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: T.muted }}>Voice interviews require Google Chrome. Please open this page in Chrome for the best experience.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ripple1 { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce  { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-9px); } }
      `}</style>
    </div>
  );
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
