import { useState } from "react";

export default function LandingPage({ onStart, onDashboard }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email to begin.");
      return;
    }
    setError("");
    onStart({ name, email, subject });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "auto, 60px 60px, 60px 60px", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "520px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3rem" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" fill="white" />
              <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>Cuemath <span style={{ color: "#6366F1" }}>Screener</span></span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 1rem" }}>
            Your AI<br />
            <span style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Interview Awaits.
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
            A 5-minute voice conversation with our AI interviewer. We'll assess your communication, warmth, and teaching clarity — then give you instant feedback.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "2rem" }}>
          {[["~5 min", "Duration"], ["Voice", "Format"], ["Instant", "Results"]].map(([val, label]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#A78BFA" }}>{val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: "0 0 1.25rem" }}>Tell us about yourself</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Priya Sharma"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="priya@example.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Teaching Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              >
                {["Mathematics", "Science", "English", "Physics", "Chemistry", "History"].map(s => (
                  <option key={s} value={s} style={{ background: "#1a1a2e" }}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p style={{ color: "#F87171", fontSize: 13, marginTop: 12, marginBottom: 0 }}>{error}</p>}

          <button
            onClick={handleStart}
            style={{ width: "100%", marginTop: 16, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em" }}
          >
            Begin Interview →
          </button>
        </div>

        <button
          onClick={onDashboard}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", marginTop: 20, display: "block", textAlign: "center", width: "100%" }}
        >
          Interviewer Dashboard →
        </button>
      </div>
    </div>
  );
}
