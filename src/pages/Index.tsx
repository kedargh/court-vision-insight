import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import VideoUpload from "@/components/VideoUpload";
import AnalysisProgress from "@/components/AnalysisProgress";
import ReportSection from "@/components/ReportSection";

const stages = [
  "Extracting frames...",
  "Detecting players...",
  "Tracking ball trajectory...",
  "Analyzing shot patterns...",
  "Mapping court positions...",
  "Generating report...",
];

type AppState = "idle" | "analyzing" | "done";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(stages[0]);

  const simulateAnalysis = useCallback(() => {
    setAppState("analyzing");
    setProgress(0);
    setStage(stages[0]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 4 + 1;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setAppState("done"), 800);
      }
      setProgress(currentProgress);
      const stageIndex = Math.min(
        Math.floor((currentProgress / 100) * stages.length),
        stages.length - 1
      );
      setStage(stages[stageIndex]);
    }, 500);
  }, []);

  const handleVideoSubmit = useCallback(
    (_file: File) => {
      // In production, this would upload to backend and trigger Python workflow
      simulateAnalysis();
    },
    [simulateAnalysis]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {appState === "idle" && (
        <VideoUpload onVideoSubmit={handleVideoSubmit} isAnalyzing={false} />
      )}

      {appState === "analyzing" && (
        <AnalysisProgress progress={progress} stage={stage} />
      )}

      {appState === "done" && <ReportSection />}

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm font-body">
            © 2026 CourtVision · AI-Powered Match Analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
