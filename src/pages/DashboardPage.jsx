import { useState, useEffect } from "react";
import { T, recStyle, scoreColor } from "../theme";

const DEMO = [
  { id: 1, name: "Priya Sharma",   email: "priya.sharma@gmail.com",  subject: "Mathematics",       date: "18 Apr 2026", overall: "Strong Yes", overallScore: 8.8,
    scorecard: { summary: "Priya demonstrated exceptional warmth and clarity throughout. Her fraction explanation using pizza slices was precisely what a 9-year-old needs — concrete, relatable, and fun.", dimensions: { clarity:{score:9}, warmth:{score:9}, simplicity:{score:9}, patience:{score:8}, fluency:{score:9} } } },
  { id: 2, name: "Arjun Mehta",    email: "arjun.mehta@outlook.com", subject: "Science",           date: "17 Apr 2026", overall: "Yes",        overallScore: 7.3,
    scorecard: { summary: "Arjun showed solid teaching instincts with genuine enthusiasm. Responses were clear but sometimes lacked concrete examples. Overall a good fit worth pursuing.", dimensions: { clarity:{score:7}, warmth:{score:8}, simplicity:{score:7}, patience:{score:7}, fluency:{score:7} } } },
  { id: 3, name: "Sneha Patel",    email: "sneha.p@yahoo.com",       subject: "English",           date: "16 Apr 2026", overall: "Maybe",      overallScore: 5.8,
    scorecard: { summary: "Sneha showed warmth but struggled to simplify concepts clearly. Answers were often vague and lacked structure. Recommend a second interview to explore further.", dimensions: { clarity:{score:5}, warmth:{score:7}, simplicity:{score:5}, patience:{score:6}, fluency:{score:6} } } },
  { id: 4, name: "Rahul Verma",    email: "rahul.v@gmail.com",       subject: "Physics",           date: "15 Apr 2026", overall: "No",         overallScore: 4.1,
    scorecard: { summary: "Rahul's responses lacked the patience and warmth we look for. Explanations were too technical for young learners and the approach was not student-centered.", dimensions: { clarity:{score:5}, warmth:{score:3}, simplicity:{score:4}, patience:{score:4}, fluency:{score:5} } } },
  { id: 5, name: "Meera Nair",     email: "meera.nair@gmail.com",    subject: "Mathematics",       date: "14 Apr 2026", overall: "Strong Yes", overallScore: 9.1,
    scorecard: { summary: "Meera is an outstanding candidate. Her patience and ability to simplify are exceptional — she naturally scaffolds explanations and checks for understanding instinctively.", dimensions: { clarity:{score:9}, warmth:{score:9}, simplicity:{score:10}, patience:{score:9}, fluency:{score:9} } } },
];

const DIMS_LABELS = { clarity: "Clarity", warmth: "Warmth", simplicity: "Simplify", patience: "Patience", fluency: "Fluency" };

export default function DashboardPage({ onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter]         = useState("all");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [sort, setSort]             = useState("date"); // date | score

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cuemath_candidates") || "[]");
      setCandidates([...stored, ...DEMO]);
    } catch { setCandidates(DEMO); }
  }, []);

  const filtered = candidates
    .filter(c => filter === "all" || c.overall === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.subject || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "score" ? b.overallScore - a.overallScore : b.id - a.id);

  const stats = {
    total:     candidates.length,
    strongYes: candidates.filter(c => c.overall === "Strong Yes").length,
    yes:       candidates.filter(c => c.overall === "Yes").length,
    maybe:     candidates.filter(c => c.overall === "Maybe").length,
    no:        candidates.filter(c => c.overall === "No").length,
  };

  const FILTERS = [
    { key: "all",        label: "All",        count: stats.total },
    { key: "Strong Yes", label: "Strong Yes", count: stats.strongYes },
    { key: "Yes",        label: "Yes",        count: stats.yes },
    { key: "Maybe",      label: "Maybe",      count: stats.maybe },
    { key: "No",         label: "No",         count: stats.no },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.body }}>

      {/* Nav */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 34 34" fill="none"><rect width="34" height="34" rx="9" fill={T.green}/><path d="M17 5l3.5 8H28l-6.5 5 2.5 8L17 22l-7 4 2.5-8L6 13h7.5L17 5Z" fill="white"/></svg>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.heading }}>Cuemath</span>
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: T.greenText, background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "2px 10px" }}>HR Dashboard</span>
            </div>
          </div>
          <button onClick={onBack} style={{ background: T.green, border: "none", borderRadius: T.r, padding: "8px 18px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
            + New Interview
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
          {[
            { label: "Total Screened",  value: stats.total,     color: T.green,  bg: T.greenLight },
            { label: "Strong Yes",      value: stats.strongYes, color: T.green,  bg: T.greenLight },
            { label: "Yes",             value: stats.yes,       color: T.purple, bg: T.purpleLight },
            { label: "Maybe",           value: stats.maybe,     color: T.amber,  bg: T.amberLight },
            { label: "No",              value: stats.no,        color: T.red,    bg: T.redLight },
          ].map(s => (
            <div key={s.label} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rMd, padding: "1rem 1.25rem", boxShadow: T.shadow }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid: list + detail ── */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 16, alignItems: "start" }}>

          {/* Left — candidate list */}
          <div>
            {/* Search + filter bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke={T.subtle} strokeWidth="1.4"/>
                  <path d="M9.5 9.5L12 12" stroke={T.subtle} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or subject…"
                  style={{ width: "100%", border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "9px 12px 9px 34px", fontSize: 13, color: T.body, background: T.white, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Sort */}
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                style={{ border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "9px 28px 9px 12px", fontSize: 13, color: T.body, background: T.white, outline: "none", cursor: "pointer" }}
              >
                <option value="date">Latest first</option>
                <option value="score">Highest score</option>
              </select>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
              {FILTERS.map(f => {
                const active = filter === f.key;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: active ? T.greenLight : T.white, border: `1.5px solid ${active ? T.green : T.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? T.greenText : T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    {f.label}
                    <span style={{ background: active ? T.green : T.border, color: active ? "#fff" : T.subtle, borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{f.count}</span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: T.subtle, fontSize: 14, background: T.white, borderRadius: T.rMd, border: `1px solid ${T.border}` }}>
                  No candidates found
                </div>
              )}
              {filtered.map(c => {
                const rec = recStyle(c.overall);
                const isActive = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelected(isActive ? null : c)}
                    style={{ background: T.white, border: `1.5px solid ${isActive ? T.green : T.border}`, borderRadius: T.rMd, padding: "1rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, transition: "border-color 0.18s, box-shadow 0.18s", boxShadow: isActive ? `0 0 0 3px ${T.greenLight}` : T.shadow }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = T.greenBorder; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = T.border; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${T.green}, #00D68F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: T.heading }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{c.subject} · {c.date}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(c.overallScore) }}>{c.overallScore.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.04em" }}>Score</div>
                      </div>
                      <div style={{ background: rec.bg, border: `1.5px solid ${rec.border}`, borderRadius: T.r, padding: "4px 12px" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: rec.text, whiteSpace: "nowrap" }}>{rec.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — detail panel */}
          {selected && (
            <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.rLg, padding: "1.25rem", boxShadow: T.shadowMd, position: "sticky", top: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.heading }}>{selected.name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, color: T.subtle, cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}>×</button>
              </div>

              {/* Mini info */}
              <div style={{ fontSize: 12, color: T.subtle, marginBottom: "1rem" }}>
                <div>{selected.email}</div>
                <div>{selected.subject} · {selected.date}</div>
              </div>

              {/* Recommendation */}
              {(() => { const r = recStyle(selected.overall); return (
                <div style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: T.r, padding: "8px 14px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.text }}>Recommendation</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.text }}>{r.label}</span>
                </div>
              ); })()}

              {/* Summary */}
              {selected.scorecard?.summary && (
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: "1.25rem", padding: "10px 12px", background: T.bgLight, borderRadius: T.r }}>
                  {selected.scorecard.summary}
                </div>
              )}

              {/* Dimension bars */}
              {selected.scorecard?.dimensions && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Dimensions</div>
                  {Object.entries(selected.scorecard.dimensions).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                      <span style={{ fontSize: 12, color: T.muted, width: 68, flexShrink: 0 }}>{DIMS_LABELS[key]}</span>
                      <div style={{ flex: 1, height: 5, background: "#F0F0F0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(val.score / 10) * 100}%`, background: scoreColor(val.score), borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(val.score), width: 22, textAlign: "right" }}>{val.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Overall score */}
              <div style={{ borderTop: `1px solid ${T.border}`, marginTop: "1rem", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: T.muted }}>Overall Score</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(selected.overallScore) }}>{selected.overallScore.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "1rem", textAlign: "center", marginTop: "2rem" }}>
        <p style={{ margin: 0, fontSize: 12, color: T.placeholder }}>© 2026 CueLearn Inc. · HR Dashboard · Internal Tool</p>
      </div>
    </div>
  );
}
