import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import ScorecardPage from "./pages/ScorecardPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [page, setPage] = useState("landing");
  const [interviewData, setInterviewData] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);

  const startInterview = (info) => {
    setCandidateInfo(info);
    setPage("interview");
  };

  const completeInterview = (data) => {
    setInterviewData(data);
    setPage("scorecard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      {page === "landing" && (
        <LandingPage
          onStart={startInterview}
          onDashboard={() => setPage("dashboard")}
        />
      )}
      {page === "interview" && (
        <InterviewPage
          candidateInfo={candidateInfo}
          onComplete={completeInterview}
        />
      )}
      {page === "scorecard" && (
        <ScorecardPage
          data={interviewData}
          candidateInfo={candidateInfo}
          onRestart={() => setPage("landing")}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage onBack={() => setPage("landing")} />
      )}
    </div>
  );
}
