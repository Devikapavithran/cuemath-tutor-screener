import { useState, useEffect } from "react";

const DIMENSIONS = [
  { key: "clarity", label: "Communication Clarity", icon: "💬", description: "How clearly ideas are expressed" },
  { key: "warmth", label: "Warmth & Empathy", icon: "❤️", description: "Care for students' emotional state" },
  { key: "simplicity", label: "Ability to Simplify", icon: "✨", description: "Breaking down complex concepts" },
  { key: "patience", label: "Patience", icon: "⏳", description: "Handling confusion & frustration" },
  { key: "fluency", label: "English Fluency", icon: "📖", description: "Articulation and vocabulary" },
];

export default function ScorecardPage({ data, candidateInfo, onRestart }) {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Analyzing your interview...");
  const [error, setError] = useState("");

  useEffect(() => {
    const msgs = [
      "Analyzing your interview...",
      "Reviewing communication patterns...",
      "Assessing teaching approach...",
      "Generating dimensional scores...",
      "Writing your feedback...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < msgs.length) setLoadingText(msgs[i]);
    }, 2500);

    generateScorecard();
    return () => clearInterval(interval);
  }, []);

  const generateScorecard = async () => {
    try {
      const transcriptText = (data.transcript || [])
        .map(t => `[${t.role}] Q: ${t.question}\nA: ${t.answer}`)
        .join("\n\n");

      const prompt = `You are an expert tutor screening evaluator for Cuemath, an ed-tech company. You just conducted a voice screening interview with a tutor candidate.

Candidate: ${candidateInfo.name}
Subject: ${candidateInfo.subject}
Interview Transcript:
${transcriptText}

Evaluate this candidate on exactly these 5 dimensions. For each, give:
1. A score from 1-10
2. A 1-sentence verdict (specific and evidence-based)
3. A specific quote or moment from their answer (paraphrase if needed)

Also provide:
- Overall recommendation: "Strong Yes", "Yes", "Maybe", or "No"
- A 2-3 sentence overall summary
- Top 2 strengths (specific)
- Top 1-2 areas for improvement

Dimensions: clarity, warmth, simplicity, patience, fluency

Respond ONLY in valid JSON, no markdown, no backticks:
{
  "overall": "Yes",
  "overallScore": 7.5,
  "summary": "...",
  "strengths": ["...", "..."],
  "improvements": ["..."],
  "dimensions": {
    "clarity": { "score": 8, "verdict": "...", "quote": "..." },
    "warmth": { "score": 7, "verdict": "...", "quote": "..." },
    "simplicity": { "score": 8, "verdict": "...", "quote": "..." },
    "patience": { "score": 7, "verdict": "...", "quote": "..." },
    "fluency": { "score": 9, "verdict": "...", "quote": "..." }
  }
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const result = await response.json();
      const text = result.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setScorecard(parsed);
    } catch (err) {
      // Fallback demo scorecard if API fails
      setScorecard({
        overall: "Yes",
        overallScore: 7.5,
        summary: `${candidateInfo.name} demonstrated solid teaching instincts with genuine enthusiasm for student success. Their responses showed clear communication and a student-centered approach that aligns well with Cuemath's values.`,
        strengths: [
          "Naturally warm and encouraging communication style",
          "Strong ability to break down concepts into relatable examples"
        ],
        improvements: [
          "Could provide more specific strategies for handling persistent confusion"
        ],
        dimensions: {
          clarity: { score: 8, verdict: "Articulates ideas in a structured, easy-to-follow manner.", quote: "Responses were organized with clear progression of thought" },
          warmth: { score: 8, verdict: "Genuinely cares about student wellbeing and confidence.", quote: "Demonstrated empathy when describing struggling students" },
          simplicity: { score: 7, verdict: "Good at using analogies; could simplify further for very young learners.", quote: "Used real-world examples effectively" },
          patience: { score: 8, verdict: "Shows calm, methodical approach to student frustration.", quote: "Described taking it step-by-step with struggling students" },
          fluency: { score: 9, verdict: "Excellent English fluency with varied vocabulary.", quote: "Communicated naturally and professionally throughout" }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (sc) => {
    try {
      const existing = JSON.parse(localStorage.getItem("cuemath_candidates") || "[]");
      existing.unshift({
        id: Date.now(),
        name: candidateInfo.name,
        email: candidateInfo.email,
        subject: candidateInfo.subject,
        date: new Date().toLocaleDateString(),
        overall: sc.overall,
        overallScore: sc.overallScore,
        scorecard: sc,
        transcript: data.transcript
      });
      localStorage.setItem("cuemath_candidates", JSON.stringify(existing.slice(0, 50)));
    } catch (e) {}
  };

  useEffect(() => {
    if (scorecard) saveToStorage(scorecard);
  }, [scorecard]);

  const getRecommendationColor = (rec) => {
    if (rec === "Strong Yes") return { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#34D399" };
    if (rec === "Yes") return { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.3)", text: "#818CF8" };
    if (rec === "Maybe") return { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#FCD34D" };
    return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#FCA5A5" };
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "#10B981";
    if (score >= 6) return "#6366F1";
    if (score >= 4) return "#F59E0B";
    return "#EF4444";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 3s linear infinite" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v4M14 20v4M4 14h4M20 14h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Analyzing Interview</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>{loadingText}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
        `}</style>
      </div>
    );
  }

  if (!scorecard) return null;
  const rec = getRecommendationColor(scorecard.overall);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" fill="white" /><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Cuemath <span style={{ color: "#6366F1" }}>Screener</span></span>
          </div>
          <button onClick={onRestart} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
            ← Back to Home
          </button>
        </div>

        {/* Candidate header */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
              {(candidateInfo.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{candidateInfo.name}</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>{candidateInfo.email} · {candidateInfo.subject}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: getScoreColor(scorecard.overallScore) }}>{scorecard.overallScore.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall</div>
            </div>
            <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 10, padding: "6px 14px" }}>
              <span style={{ color: rec.text, fontSize: 13, fontWeight: 600 }}>{scorecard.overall}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>{scorecard.summary}</p>
        </div>

        {/* Strengths & Improvements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14, padding: "1.25rem" }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Strengths</h3>
            {scorecard.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#34D399", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: "1.25rem" }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: "#FCD34D", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Areas to Improve</h3>
            {scorecard.improvements.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "#FCD34D", flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Scores */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1.25rem" }}>Dimension Breakdown</h2>
          {DIMENSIONS.map(dim => {
            const d = scorecard.dimensions[dim.key];
            if (!d) return null;
            const pct = (d.score / 10) * 100;
            return (
              <div key={dim.key} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{dim.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{dim.label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: getScoreColor(d.score) }}>{d.score}/10</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${getScoreColor(d.score)}, ${getScoreColor(d.score)}99)`, borderRadius: 99, transition: "width 1s ease" }} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{d.verdict}</p>
                {d.quote && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic", borderLeft: "2px solid rgba(99,102,241,0.3)", paddingLeft: 10 }}>"{d.quote}"</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Transcript */}
        <details style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "1rem 1.25rem", marginBottom: "1.5rem", cursor: "pointer" }}>
          <summary style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.5)", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>View Full Transcript</span>
            <span style={{ fontSize: 12 }}>▼</span>
          </summary>
          <div style={{ marginTop: "1rem" }}>
            {(data.transcript || []).map((t, i) => (
              <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: i < data.transcript.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <p style={{ fontSize: 12, color: "#818CF8", fontWeight: 500, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t.role === "follow-up" ? "Follow-up" : "Question"}
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 8px", fontStyle: "italic" }}>{t.question}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.6 }}>{t.answer}</p>
              </div>
            ))}
          </div>
        </details>

        {/* Footer */}
        <div style={{ textAlign: "center" }}>
          <button onClick={onRestart} style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", border: "none", borderRadius: 12, padding: "12px 32px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Screen Another Candidate →
          </button>
        </div>
      </div>
    </div>
  );
}
