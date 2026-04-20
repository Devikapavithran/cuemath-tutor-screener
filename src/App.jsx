import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import ScorecardPage from "./pages/ScorecardPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [page, setPage] = useState("landing");
  const [interviewData, setInterviewData] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onStart={(info) => { setCandidateInfo(info); setPage("interview"); }}
          onDashboard={() => setPage("dashboard")}
        />
      )}
      {page === "interview" && (
        <InterviewPage
          candidateInfo={candidateInfo}
          onComplete={(data) => { setInterviewData(data); setPage("scorecard"); }}
        />
      )}
      {page === "scorecard" && (
        <ScorecardPage
          data={interviewData}
          candidateInfo={candidateInfo}
          onRestart={() => setPage("landing")}
          onDashboard={() => setPage("dashboard")}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage onBack={() => setPage("landing")} />
      )}
    </>
  );
}
