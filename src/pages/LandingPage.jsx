import { useState } from "react";
import { T } from "../theme";

const SUBJECTS = ["Mathematics","Science","English","Physics","Chemistry","History","Computer Science","Biology","Economics"];

export default function LandingPage({ onStart, onDashboard }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [focus, setFocus]     = useState("");
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Please enter your full name.";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address.";
    return e;
  };

  const handleStart = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    onStart({ name: name.trim(), email: email.trim(), subject });
  };

  const inp = (field) => ({
    width: "100%",
    border: `1.5px solid ${errors[field] ? T.red : focus === field ? T.green : T.border}`,
    borderRadius: T.r,
    padding: "11px 14px",
    fontSize: 14,
    color: T.body,
    background: T.bgLight,
    outline: "none",
    transition: "border-color 0.18s",
    boxSizing: "border-box",
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Cuemath star logo */}
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
              <rect width="34" height="34" rx="9" fill={T.green}/>
              <path d="M17 5l3.5 8H28l-6.5 5 2.5 8L17 22l-7 4 2.5-8L6 13h7.5L17 5Z" fill="white"/>
            </svg>
            <div>
              <span style={{ fontSize: 17, fontWeight: 800, color: T.heading, letterSpacing: "-0.02em" }}>Cuemath</span>
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: T.greenText, background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "2px 10px" }}>
                Tutor Portal
              </span>
            </div>
          </div>
          <button
            onClick={onDashboard}
            style={{ background: "none", border: `1.5px solid ${T.border}`, borderRadius: T.r, padding: "8px 18px", fontSize: 13, fontWeight: 500, color: T.muted, cursor: "pointer" }}
          >
            HR Dashboard →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "4.5rem", alignItems: "center", padding: "5rem 0" }}>

          {/* Left */}
          <div>
            {/* Pill badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.greenLight, border: `1px solid ${T.greenBorder}`, borderRadius: 20, padding: "5px 14px", marginBottom: "1.5rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "block", flexShrink: 0 }}/>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.greenText }}>AI-Powered Screening · Now Live</span>
            </div>

            <h1 style={{ fontSize: "clamp(2.2rem, 3.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: T.heading, margin: "0 0 1.25rem" }}>
              Join Cuemath as a<br/>
              <span style={{ color: T.green }}>Certified Tutor</span>
            </h1>

            <p style={{ fontSize: 16.5, color: T.muted, lineHeight: 1.75, maxWidth: 460, margin: "0 0 2.5rem" }}>
              Complete a short AI voice interview to kick off your application. We assess communication, warmth, and teaching clarity — and deliver an instant, detailed scorecard.
            </p>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: "2.5rem" }}>
              {[
                "5-minute voice conversation with our AI interviewer",
                "Questions designed to reveal real teaching instincts",
                "Instant breakdown across 5 key dimensions",
                "Results reviewed by Cuemath HR within 24 hours",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenLight, border: `1.5px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14.5, color: "#444", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2.5rem", borderTop: `1px solid ${T.border}`, paddingTop: "1.5rem" }}>
              {[["200K+","Students served"],["80+","Countries"],["Top 1%","Certified tutors"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.green }}>{n}</div>
                  <div style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form card */}
          <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: T.rXl, padding: "2rem", boxShadow: T.shadowLg }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 4px", color: T.heading }}>Start Your Application</h2>
            <p style={{ fontSize: 13, color: T.subtle, margin: "0 0 1.5rem" }}>Free · ~5 minutes · Voice interview</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Full Name</label>
                <input
                  value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                  onFocus={() => setFocus("name")} onBlur={() => setFocus("")}
                  placeholder="e.g. Priya Sharma"
                  style={inp("name")}
                />
                {errors.name && <p style={{ fontSize: 12, color: T.red, marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Email Address</label>
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus("")}
                  placeholder="priya@example.com"
                  style={inp("email")}
                />
                {errors.email && <p style={{ fontSize: 12, color: T.red, marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Subject You Teach</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={subject} onChange={e => setSubject(e.target.value)}
                    onFocus={() => setFocus("subject")} onBlur={() => setFocus("")}
                    style={{ ...inp("subject"), paddingRight: 36, cursor: "pointer" }}
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5L7 9L11 5" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={submitting}
              style={{ width: "100%", marginTop: 20, background: submitting ? T.greenBorder : T.green, border: "none", borderRadius: T.rMd, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "default" : "pointer", transition: "background 0.18s, transform 0.1s", letterSpacing: "-0.01em" }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = T.greenHover; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = T.green; }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.985)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {submitting ? "Starting..." : "🎤  Begin Voice Interview"}
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: T.placeholder, margin: "12px 0 0" }}>
              Only Cuemath HR can view your results
            </p>

            {/* How it works mini */}
            <div style={{ borderTop: `1px solid ${T.border}`, marginTop: "1.25rem", paddingTop: "1.25rem" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.placeholder, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>How it works</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                {[["🎤", "Speak"], ["🧠", "AI Reviews"], ["📊", "Scorecard"]].map(([icon, label], i) => (
                  <div key={label} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                    {i < 2 && <div style={{ position: "absolute", top: "30%", left: "55%", right: "-45%", height: 1, background: T.border }} />}
                    <div style={{ fontSize: 22, marginBottom: 4, position: "relative", zIndex: 1 }}>{icon}</div>
                    <div style={{ fontSize: 11, color: T.subtle, fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "1.5rem 0 2rem", display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem" }}>
            {[
              ["⏱", "~5 Minutes", "Quick and focused"],
              ["🔊", "Voice Only", "Speak naturally, no typing"],
              ["⚡", "Instant Results", "Scorecard in under 60 seconds"],
              ["🔒", "Confidential", "Only Cuemath HR sees results"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.body }}>{title}</div>
                  <div style={{ fontSize: 12, color: T.subtle }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onDashboard} style={{ background: "none", border: "none", fontSize: 13, color: T.subtle, cursor: "pointer", textDecoration: "underline" }}>
            View HR Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "1rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: T.placeholder, margin: 0 }}>© 2026 CueLearn Inc. · Tutor Screening Portal · Internal Tool</p>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
