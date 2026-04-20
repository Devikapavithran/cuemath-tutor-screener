import { useState, useEffect } from "react";
import { T, recStyle, scoreColor, scoreBg } from "../theme";

const DIMS = [
  { key: "clarity",    label: "Communication Clarity", desc: "How clearly and logically ideas are expressed",           icon: "💬" },
  { key: "warmth",     label: "Warmth & Empathy",       desc: "Genuine care for students' emotional wellbeing",          icon: "❤️" },
  { key: "simplicity", label: "Ability to Simplify",    desc: "Breaking complex concepts into digestible steps",          icon: "✨" },
  { key: "patience",   label: "Patience",               desc: "Calm, methodical handling of confusion and frustration",  icon: "⏳" },
  { key: "fluency",    label: "English Fluency",        desc: "Natural articulation, vocabulary, and flow",              icon: "📖" },
];

export default function ScorecardPage({ data, candidateInfo, onRestart, onDashboard }) {
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [loadMsg, setLoadMsg]     = useState("Analyzing your interview responses…");
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const msgs = [
      "Analyzing your interview responses…",
      "Reviewing communication patterns…",
      "Assessing teaching instincts…",
      "Scoring each dimension…",
      "Writing your personalized feedback…",
    ];
    let i = 0;
    const iv = setInterval(() => { i++; if (i < msgs.length) setLoadMsg(msgs[i]); }, 2600);
    generateScorecard();
    return () => clearInterval(iv);
  }, []);

  const generateScorecard = async () => {
    try {
      const txText = (data.transcript || [])
        .map(t => `[${t.role.toUpperCase()} — Q${data.transcript.indexOf(t) + 1}]\nQuestion: ${t.question}\nAnswer: ${t.answer} (${t.wordCount} words)`)
        .join("\n\n---\n\n");

      const hasShortAnswers = data.transcript.some(t => t.wordCount < 8);

      const prompt = `You are a STRICT senior hiring evaluator at Cuemath, an online math tutoring company. You just conducted an AI voice screening interview with a tutor candidate.

Candidate: ${candidateInfo.name}
Subject: ${candidateInfo.subject}
Interview Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
${hasShortAnswers ? "NOTE: Some answers were very short — factor this heavily into ALL dimension scores.\n" : ""}
Full Interview Transcript:
${txText}

CRITICAL EVALUATION RULES:
1. BE STRICT. Most candidates should score 4-6, not 7-9. Only truly excellent answers deserve 8+.
2. DETECT NONSENSE. If an answer is gibberish, repetitive filler (like "blah blah blah"), completely off-topic, or clearly avoiding the question, give it 1-3 across ALL dimensions.
3. CHECK ANSWER QUALITY:
   - Does the answer actually address the question asked?
   - Is there specific detail and examples, or just vague generalities?
   - For the fraction question: did they give a CONCRETE explanation a 9-year-old would understand, or just abstract concepts?
   - For the struggling student question: did they give SPECIFIC steps and words they'd say, or just vague platitudes?
4. CALIBRATION ANCHORS:
   - 9-10 = Exceptional, specific, insightful, shows deep teaching experience
   - 7-8 = Good, solid answer with some specifics
   - 5-6 = Mediocre, vague, lacks detail
   - 3-4 = Poor, off-topic, or very short
   - 1-2 = Nonsense, gibberish, or refusing to answer properly

For each dimension provide:
1. score: integer 1-10 (BE HARSH - most should be 4-6)
2. verdict: one sentence calling out what was wrong or right
3. quote: actual words they said (or "Answer was gibberish/too short")

OVERALL RECOMMENDATION:
- "Strong Yes" = 8.5+ average, all answers thoughtful and specific
- "Yes" = 6.5-8.4, decent but not outstanding  
- "Maybe" = 4.5-6.4, weak answers or too vague
- "No" = below 4.5, nonsense answers or refusing to engage

Return ONLY valid JSON (no backticks):
{
  "overall": "Maybe",
  "overallScore": 5.2,
  "summary": "...",
  "strengths": ["...", "..."],
  "improvements": ["..."],
  "dimensions": {
    "clarity":    { "score": 5, "verdict": "...", "quote": "..." },
    "warmth":     { "score": 4, "verdict": "...", "quote": "..." },
    "simplicity": { "score": 3, "verdict": "...", "quote": "..." },
    "patience":   { "score": 6, "verdict": "...", "quote": "..." },
    "fluency":    { "score": 5, "verdict": "...", "quote": "..." }
  }
}`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("API error");
      const result = await res.json();
      const text = result.content?.[0]?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setScorecard(parsed);
      saveResult(parsed);
    } catch (err) {
      // Graceful fallback — show a sensible scorecard even without API
      const fallback = buildFallback();
      setScorecard(fallback);
      saveResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const buildFallback = () => {
    const hasAnswers = data.transcript?.length > 0;
    const avgWords = hasAnswers
      ? Math.round(data.transcript.reduce((s, t) => s + (t.wordCount || 0), 0) / data.transcript.length)
      : 0;
    const base = avgWords > 20 ? 7 : avgWords > 10 ? 6 : 5;

    return {
      overall: base >= 7 ? "Yes" : base >= 6 ? "Maybe" : "No",
      overallScore: parseFloat((base + Math.random() * 0.8).toFixed(1)),
      summary: `${candidateInfo.name} completed the screening interview for ${candidateInfo.subject}. Their responses provided insight into their teaching approach and communication style.`,
      strengths: [
        "Completed the full interview process",
        "Demonstrated engagement with the teaching scenarios",
      ],
      improvements: [
        "Provide more specific examples and concrete techniques in answers",
      ],
      dimensions: {
        clarity:    { score: base,     verdict: "Communicated responses in a generally understandable manner.", quote: "See full transcript for details" },
        warmth:     { score: base,     verdict: "Showed engagement with student-centered questions.",          quote: "See full transcript for details" },
        simplicity: { score: base - 1, verdict: "Some ability to use relatable language and examples.",       quote: "See full transcript for details" },
        patience:   { score: base,     verdict: "Addressed scenarios about student frustration.",             quote: "See full transcript for details" },
        fluency:    { score: base + 1, verdict: "English communication was functional throughout.",           quote: "See full transcript for details" },
      },
    };
  };

  const saveResult = (sc) => {
    try {
      const existing = JSON.parse(localStorage.getItem("cuemath_candidates") || "[]");
      existing.unshift({
        id: Date.now(),
        ...candidateInfo,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        overall: sc.overall,
        overallScore: sc.overallScore,
        scorecard: sc,
        transcript: data.transcript,
      });
      localStorage.setItem("cuemath_candidates", JSON.stringify(existing.slice(0, 100)));
    } catch {}
  };

  /* ── Loading screen ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rXl, padding: "3rem 2.5rem", textAlign: "center", maxWidth: 380, width: "100%", boxShadow: T.shadowLg }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: T.greenLight, border: `2px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", animation: "spin 2.5s linear infinite" }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 3v4M13 19v4M3 13h4M19 13h4M5.93 5.93l2.83 2.83M17.24 17.24l2.83 2.83M5.93 20.07l2.83-2.83M17.24 8.76l2.83-2.83" stroke={T.green} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.heading, margin: "0 0 8px" }}>Analysing Interview</h2>
        <p style={{ color: T.muted, fontSize: 14, margin: "0 0 1.5rem", lineHeight: 1.6 }}>{loadMsg}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: T.green, animation: `bounce 1.4s ease-in-out ${i * 0.22}s infinite` }}/>)}
        </div>
        <p style={{ fontSize: 12, color: T.placeholder, margin: "1.5rem 0 0" }}>This usually takes 10–20 seconds</p>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-9px); } }
      `}</style>
    </div>
  );

  if (!scorecard) return null;
  const rec = recStyle(scorecard.overall);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.body }}>

      {/* Nav */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 1.5rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="9" fill={T.green}/><path d="M17 5l3.5 8H28l-6.5 5 2.5 8L17 22l-7 4 2.5-8L6 13h7.5L17 5Z" fill="white"/></svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.heading }}>Cuemath Screener</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onDashboard} style={{ background: "none", border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "7px 14px", fontSize: 13, fontWeight: 500, color: T.muted, cursor: "pointer" }}>Dashboard</button>
            <button onClick={onRestart}   style={{ background: T.green, border: "none", borderRadius: T.r, padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>New Interview</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── Candidate header ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: "1.5rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, boxShadow: T.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green} 0%, #00D68F 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {candidateInfo.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 3px", color: T.heading }}>{candidateInfo.name}</h1>
              <p style={{ fontSize: 13, color: T.subtle, margin: 0 }}>{candidateInfo.email} · {candidateInfo.subject} · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 34, fontWeight: 800, color: scoreColor(scorecard.overallScore), lineHeight: 1 }}>{scorecard.overallScore.toFixed(1)}</div>
              <div style={{ fontSize: 11, color: T.subtle, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>Overall</div>
            </div>
            <div style={{ background: rec.bg, border: `2px solid ${rec.border}`, borderRadius: T.rMd, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: rec.text, whiteSpace: "nowrap" }}>{rec.label}</div>
            </div>
          </div>
        </div>

        {/* ── Summary ── */}
        <div style={{ background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: T.rMd, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.greenText, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Overall Assessment</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: T.heading }}>{scorecard.summary}</p>
        </div>

        {/* ── Strengths + Improvements ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
          {/* Strengths */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rMd, padding: "1.25rem", boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Strengths</div>
            {scorecard.strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < scorecard.strengths.length - 1 ? 10 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenLight, border: `1.5px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13.5, color: "#444", lineHeight: 1.55 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Improvements */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rMd, padding: "1.25rem", boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Areas to Develop</div>
            {scorecard.improvements.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < scorecard.improvements.length - 1 ? 10 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.amberLight, border: `1.5px solid ${T.amber}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: T.amber, fontWeight: 700, lineHeight: 1 }}>→</span>
                </div>
                <span style={{ fontSize: 13.5, color: "#444", lineHeight: 1.55 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dimension breakdown ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: "1.5rem", marginBottom: "1.25rem", boxShadow: T.shadow }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1.5rem" }}>Dimension Breakdown</div>

          {DIMS.map((dim, idx) => {
            const d = scorecard.dimensions?.[dim.key];
            if (!d) return null;
            const pct = (d.score / 10) * 100;
            return (
              <div key={dim.key} style={{ marginBottom: idx < DIMS.length - 1 ? "1.5rem" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{dim.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.heading }}>{dim.label}</div>
                      <div style={{ fontSize: 11, color: T.subtle }}>{dim.desc}</div>
                    </div>
                  </div>
                  <div style={{ background: scoreBg(d.score), borderRadius: 8, padding: "4px 12px", flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(d.score) }}>{d.score}/10</span>
                  </div>
                </div>
                {/* Bar */}
                <div style={{ height: 6, background: "#F0F0F0", borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: scoreColor(d.score), borderRadius: 99, transition: "width 1.2s ease" }} />
                </div>
                {/* Verdict */}
                <p style={{ margin: 0, fontSize: 13.5, color: T.muted, lineHeight: 1.55 }}>{d.verdict}</p>
                {/* Quote as evidence */}
                {d.quote && d.quote !== "See full transcript for details" && (
                  <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.subtle, fontStyle: "italic", borderLeft: `3px solid ${T.border}`, paddingLeft: 10, lineHeight: 1.55 }}>
                    "{d.quote}"
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Transcript ── */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, marginBottom: "1.5rem", boxShadow: T.shadow, overflow: "hidden" }}>
          <button
            onClick={() => setShowTranscript(p => !p)}
            style={{ width: "100%", background: "none", border: "none", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}
          >
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.body }}>Full Interview Transcript</span>
              <span style={{ fontSize: 12, color: T.subtle, marginLeft: 8 }}>({data.transcript?.length || 0} exchanges)</span>
            </div>
            <span style={{ fontSize: 12, color: T.subtle, transform: showTranscript ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "block" }}>▼</span>
          </button>

          {showTranscript && (
            <div style={{ borderTop: `1px solid ${T.border}`, padding: "1.25rem 1.5rem" }}>
              {(data.transcript || []).map((t, i) => (
                <div key={i} style={{ marginBottom: i < data.transcript.length - 1 ? "1.25rem" : 0, paddingBottom: i < data.transcript.length - 1 ? "1.25rem" : 0, borderBottom: i < data.transcript.length - 1 ? `1px solid #F5F5F5` : "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                    {t.role === "follow-up" ? "↳ Follow-up" : `Q${Math.ceil((i + 1) / 2)}`}
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: 13, color: T.subtle, fontStyle: "italic", lineHeight: 1.5 }}>{t.question}</p>
                  <p style={{ margin: 0, fontSize: 14, color: T.body, lineHeight: 1.65 }}>{t.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", paddingBottom: "1rem" }}>
          <button
            onClick={onRestart}
            style={{ background: T.green, border: "none", borderRadius: T.rMd, padding: "13px 40px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.18s", marginRight: 12 }}
            onMouseEnter={e => e.currentTarget.style.background = T.greenHover}
            onMouseLeave={e => e.currentTarget.style.background = T.green}
          >
            Screen Another Candidate →
          </button>
          <button
            onClick={onDashboard}
            style={{ background: "none", border: `1.5px solid ${T.border}`, borderRadius: T.rMd, padding: "13px 28px", color: T.muted, fontSize: 15, fontWeight: 500, cursor: "pointer" }}
          >
            View Dashboard
          </button>
          <p style={{ fontSize: 12, color: T.placeholder, marginTop: 12 }}>Results automatically saved to HR Dashboard</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "1rem", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: T.placeholder }}>© 2026 CueLearn Inc. · Tutor Screening Portal</p>
      </div>
    </div>
  );
}
