import { useState, useEffect, useRef } from "react";

const INTERVIEW_QUESTIONS = [
  {
    id: "intro",
    question: "Welcome! I'm your Cuemath AI interviewer. To start, tell me a little about your teaching background — how long have you been teaching, and what grades do you enjoy most?",
    followUp: "That's interesting! What made you passionate about teaching?"
  },
  {
    id: "explain",
    question: "Here's a teaching scenario: Explain what a fraction is to a 9-year-old who has never heard the word before. Go ahead and explain it as if I'm the student.",
    followUp: "Great! Now, how would you check if I actually understood that?"
  },
  {
    id: "struggling",
    question: "A student has been staring at the same math problem for five minutes and looks frustrated. They say 'I don't get it'. What do you do — walk me through your exact approach.",
    followUp: "What if they still don't understand after your second explanation?"
  },
  {
    id: "patience",
    question: "Tell me about a time you had a student who was very difficult — maybe disruptive, disengaged, or very slow to learn. How did you handle it?",
    followUp: "Looking back, what would you have done differently?"
  },
  {
    id: "fun",
    question: "How do you keep math fun and engaging for students who think it's boring? Give me a specific example or technique you use.",
    followUp: "Have you seen that actually work? Tell me about a moment where a student's attitude toward math changed."
  }
];

export default function InterviewPage({ candidateInfo, onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | question | listening | thinking | followup | done
  const [currentQ, setCurrentQ] = useState(0);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [error, setError] = useState("");
  const [hasMicPermission, setHasMicPermission] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const transcriptRef = useRef([]);

  const totalSteps = INTERVIEW_QUESTIONS.length * 2;

  const speak = (text) => {
    return new Promise((resolve) => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      const voices = synthRef.current.getVoices();
      const preferred = voices.find(v => v.name.includes("Google") && v.lang === "en-US")
        || voices.find(v => v.lang === "en-US" && !v.name.includes("Microsoft"))
        || voices.find(v => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };

      synthRef.current.speak(utterance);
    });
  };

  const startRecording = async () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Your browser doesn't support speech recognition. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setCurrentTranscript("");
      setTimeLeft(90);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setCurrentTranscript(prev => prev + final + interim);
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        setError("Microphone error: " + event.error + ". Please check permissions.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      recognition.start();
    } catch (err) {
      setHasMicPermission(false);
      setError("Microphone access denied. Please allow microphone access to proceed.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const submitAnswer = async () => {
    const answer = currentTranscript.trim();
    if (!answer) {
      setError("Please record your answer before submitting.");
      return;
    }
    setError("");

    const q = INTERVIEW_QUESTIONS[currentQ];
    const question = isFollowUp ? q.followUp : q.question;
    const role = isFollowUp ? "follow-up" : "question";

    const newEntry = {
      questionId: q.id,
      role,
      question,
      answer,
      timestamp: new Date().toISOString()
    };

    const updated = [...transcriptRef.current, newEntry];
    transcriptRef.current = updated;
    setTranscript(updated);
    setCurrentTranscript("");
    setProgress(prev => Math.min(prev + 1, totalSteps));

    if (!isFollowUp) {
      // Ask follow-up
      setIsFollowUp(true);
      setPhase("thinking");
      await new Promise(r => setTimeout(r, 1200));
      setPhase("followup");
      await speak(q.followUp);
      setPhase("listening");
    } else {
      // Move to next question
      setIsFollowUp(false);
      if (currentQ + 1 < INTERVIEW_QUESTIONS.length) {
        setCurrentQ(prev => prev + 1);
        setPhase("thinking");
        await new Promise(r => setTimeout(r, 1500));
        setPhase("question");
        await speak(INTERVIEW_QUESTIONS[currentQ + 1].question);
        setPhase("listening");
      } else {
        // Done
        setPhase("done");
        await speak("Thank you so much for speaking with me today. Your interview is complete. We'll now analyze your responses and generate your detailed scorecard. Please give us just a moment.");
        setTimeout(() => {
          onComplete({ transcript: transcriptRef.current, candidateInfo, completedAt: new Date().toISOString() });
        }, 2500);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 1000));
      setPhase("question");
      const intro = `Hello ${candidateInfo.name}! Welcome to your Cuemath tutor screening interview. I'm your AI interviewer, and we'll spend about 5 minutes together today. I'll ask you a few questions about your teaching style and approach. Please speak naturally — there are no wrong answers, just be yourself. Let's begin.`;
      await speak(intro);
      await new Promise(r => setTimeout(r, 500));
      await speak(INTERVIEW_QUESTIONS[0].question);
      setPhase("listening");
    };
    init();
    return () => {
      synthRef.current?.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      clearInterval(timerRef.current);
    };
  }, []);

  const progressPercent = Math.round((progress / totalSteps) * 100);
  const q = INTERVIEW_QUESTIONS[Math.min(currentQ, INTERVIEW_QUESTIONS.length - 1)];
  const displayQuestion = isFollowUp ? q.followUp : q.question;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "620px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" fill="white" /><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Cuemath <span style={{ color: "#6366F1" }}>Screener</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: phase === "listening" ? "#10B981" : "#6366F1", animation: phase === "listening" ? "pulse 2s infinite" : "none" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Question {Math.min(currentQ + 1, INTERVIEW_QUESTIONS.length)} of {INTERVIEW_QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPercent}%`, background: "linear-gradient(90deg, #6366F1, #8B5CF6)", borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>

        {/* AI Avatar + Speaking indicator */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="12" r="6" fill="white" opacity="0.9" />
                <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              </svg>
              {isSpeaking && (
                <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.5)", animation: "ripple 1.5s ease-out infinite" }} />
              )}
            </div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "#10B981", border: "2px solid #0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="white"><circle cx="4" cy="4" r="3" /></svg>
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {phase === "thinking" && "Processing..."}
            {phase === "question" && (isSpeaking ? "AI is speaking" : "Question")}
            {phase === "followup" && (isSpeaking ? "AI is speaking" : "Follow-up")}
            {phase === "listening" && "Your turn to speak"}
            {phase === "done" && "Interview complete"}
            {phase === "intro" && "Preparing interview"}
          </span>
        </div>

        {/* Question display */}
        {phase !== "intro" && phase !== "done" && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.9)" }}>{displayQuestion}</p>
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Interview Complete!</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Generating your scorecard...</p>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live transcript */}
        {phase === "listening" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem", minHeight: 80 }}>
              {currentTranscript ? (
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{currentTranscript}</p>
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
                  {isRecording ? "Listening... speak now" : "Press 'Start Recording' to begin your answer"}
                </p>
              )}
            </div>
            {isRecording && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Recording</span>
                </div>
                <span style={{ fontSize: 12, color: timeLeft < 20 ? "#EF4444" : "rgba(255,255,255,0.4)" }}>{timeLeft}s remaining</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#FCA5A5" }}>{error}</p>
          </div>
        )}

        {/* Controls */}
        {phase === "listening" && (
          <div style={{ display: "flex", gap: 12 }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{ flex: 1, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="5" y="2" width="6" height="9" rx="3" fill="white" /><path d="M2 8a6 6 0 0 0 12 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="14" x2="8" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{ flex: 1, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "14px", color: "#FCA5A5", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="10" rx="2" fill="#FCA5A5" /></svg>
                Stop Recording
              </button>
            )}

            {!isRecording && currentTranscript && (
              <button
                onClick={submitAnswer}
                style={{ flex: 1, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                Submit Answer →
              </button>
            )}
          </div>
        )}

        {/* Previous answers count */}
        {transcript.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 20 }}>
            {transcript.length} answer{transcript.length !== 1 ? "s" : ""} recorded
          </p>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
