import { useState, useEffect } from "react";

const DEMO_CANDIDATES = [
  {
    id: 1, name: "Priya Sharma", email: "priya@example.com", subject: "Mathematics",
    date: "Apr 17, 2026", overall: "Strong Yes", overallScore: 8.8,
    scorecard: {
      dimensions: { clarity: { score: 9 }, warmth: { score: 9 }, simplicity: { score: 9 }, patience: { score: 8 }, fluency: { score: 9 } }
    }
  },
  {
    id: 2, name: "Arjun Mehta", email: "arjun@example.com", subject: "Science",
    date: "Apr 16, 2026", overall: "Yes", overallScore: 7.2,
    scorecard: {
      dimensions: { clarity: { score: 7 }, warmth: { score: 8 }, simplicity: { score: 7 }, patience: { score: 7 }, fluency: { score: 7 } }
    }
  },
  {
    id: 3, name: "Sneha Patel", email: "sneha@example.com", subject: "English",
    date: "Apr 15, 2026", overall: "Maybe", overallScore: 5.8,
    scorecard: {
      dimensions: { clarity: { score: 6 }, warmth: { score: 7 }, simplicity: { score: 5 }, patience: { score: 6 }, fluency: { score: 5 } }
    }
  },
];

const REC_STYLES = {
  "Strong Yes": { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#34D399" },
  "Yes": { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", text: "#818CF8" },
  "Maybe": { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#FCD34D" },
  "No": { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#FCA5A5" },
};

export default function DashboardPage({ onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cuemath_candidates") || "[]");
      setCandidates([...stored, ...DEMO_CANDIDATES]);
    } catch {
      setCandidates(DEMO_CANDIDATES);
    }
  }, []);

  const filtered = filter === "all" ? candidates : candidates.filter(c => c.overall === filter);
  const stats = {
    total: candidates.length,
    strongYes: candidates.filter(c => c.overall === "Strong Yes").length,
    yes: candidates.filter(c => c.overall === "Yes").length,
    maybe: candidates.filter(c => c.overall === "Maybe").length,
    no: candidates.filter(c => c.overall === "No").length,
  };

  const getScoreColor = (s) => s >= 8 ? "#10B981" : s >= 6 ? "#6366F1" : s >= 4 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" fill="white" /><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Cuemath <span style={{ color: "#6366F1" }}>Screener</span></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Interviewer Dashboard</div>
            </div>
          </div>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Total Candidates", value: stats.total, color: "#6366F1" },
            { label: "Strong Yes", value: stats.strongYes, color: "#10B981" },
            { label: "Yes / Maybe", value: stats.yes + stats.maybe, color: "#F59E0B" },
            { label: "No", value: stats.no, color: "#EF4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 16 }}>
          {/* Candidate List */}
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
              {["all", "Strong Yes", "Yes", "Maybe", "No"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${filter === f ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8, padding: "6px 14px", color: filter === f ? "#818CF8" : "rgba(255,255,255,0.5)",
                    fontSize: 13, cursor: "pointer", fontWeight: filter === f ? 500 : 400
                  }}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(c => {
                const rec = REC_STYLES[c.overall] || REC_STYLES["Maybe"];
                const isSelected = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(isSelected ? null : c)}
                    style={{
                      background: isSelected ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isSelected ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, padding: "1rem 1.25rem", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "space-between", gap: 16, transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.subject} · {c.date}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: getScoreColor(c.overallScore) }}>{c.overallScore.toFixed(1)}</div>
                      </div>
                      <div style={{ background: rec.bg, border: `1px solid ${rec.border}`, borderRadius: 8, padding: "4px 10px" }}>
                        <span style={{ color: rec.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{c.overall}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                  No candidates in this category
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.25rem", height: "fit-content", position: "sticky", top: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{selected.name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{selected.email}</div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Dimension Scores</div>
                {selected.scorecard?.dimensions && Object.entries(selected.scorecard.dimensions).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "capitalize", width: 80, flexShrink: 0 }}>{key}</span>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(val.score / 10) * 100}%`, background: getScoreColor(val.score), borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: getScoreColor(val.score), width: 24, textAlign: "right" }}>{val.score}</span>
                  </div>
                ))}
              </div>

              {selected.scorecard?.summary && (
                <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{selected.scorecard.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
