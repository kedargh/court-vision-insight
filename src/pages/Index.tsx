import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Upload, Film, X, CheckCircle2, AlertCircle, Download, Mail, FileText, Loader2, Eye, BarChart3, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CursorTracker from "@/components/CursorTracker";
import ParticleField from "@/components/ParticleField";
import { useRef } from "react";

const stages = [
  "Extracting frames...",
  "Detecting players...",
  "Tracking ball trajectory...",
  "Analyzing shot patterns...",
  "Mapping court positions...",
  "Generating report...",
];

type AppState = "idle" | "analyzing" | "done";
type Sport = "tennis" | "badminton" | null;

const Index = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedSport, setSelectedSport] = useState<Sport>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(stages[0]);
  const [dragActive, setDragActive] = useState<Sport>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const tennisInputRef = useRef<HTMLInputElement>(null);
  const badmintonInputRef = useRef<HTMLInputElement>(null);

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

  const validateFile = (file: File): boolean => {
    setFileError(null);
    if (!file.type.startsWith("video/mp4") && !file.name.endsWith(".mp4")) {
      setFileError("Please upload an .mp4 video file");
      return false;
    }
    if (file.size > 500 * 1024 * 1024) {
      setFileError("File size must be under 500MB");
      return false;
    }
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) setSelectedFile(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent, sport: Sport) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover" ? sport : null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, sport: Sport) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files?.[0]) {
      setSelectedSport(sport);
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setSelectedSport(null);
    if (tennisInputRef.current) tennisInputRef.current.value = "";
    if (badmintonInputRef.current) badmintonInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    toast.success("Report download started!", {
      description: "Your match analysis PDF is being prepared.",
    });
  };

  const handleVideoDownload = () => {
    toast.success("Video download started!", {
      description: "Your analyzed match video is being prepared.",
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
    toast.success("Report sent to your email!", {
      description: `We've sent the analysis PDF to ${email}`,
    });
  };

  const resetApp = () => {
    setAppState("idle");
    setSelectedFile(null);
    setSelectedSport(null);
    setProgress(0);
    setStage(stages[0]);
    setEmail("");
    setSent(false);
    setFileError(null);
  };

  const handleFileSelect = (file: File, sport: Sport) => {
    setSelectedSport(sport);
    handleFile(file);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative flex flex-col">
      <CursorTracker />
      <ParticleField />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 shrink-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center glow-shadow">
              <Activity className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CourtVision</span>
          </motion.div>
          {appState === "done" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetApp}
              className="text-sm font-display font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-full border border-primary/30 hover:border-primary/60"
            >
              New Analysis
            </motion.button>
          )}
        </div>
      </motion.nav>

      {/* Main Content - fills remaining height */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* IDLE STATE */}
            {appState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Hero text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="tennis-ball-dot" />
                    <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground font-body">
                      AI-Powered Match Analysis
                    </span>
                    <div className="tennis-ball-dot" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
                    Decode Every <span className="text-gradient">Rally & Shot</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto font-body">
                    Upload your tennis or badminton match video and get a detailed
                    computer vision analysis report.
                  </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-3 mb-6"
                >
                  {[
                    { icon: Eye, label: "Computer Vision" },
                    { icon: Activity, label: "Player Tracking" },
                    { icon: BarChart3, label: "Detailed Reports" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm text-xs text-muted-foreground font-body"
                    >
                      <item.icon className="w-3 h-3 text-primary" />
                      <span>{item.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Upload Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !selectedFile && inputRef.current?.click()}
                    className={`upload-zone p-8 sm:p-10 text-center transition-all duration-500 ${
                      dragActive ? "upload-zone-active" : "hover:border-primary/50"
                    } ${selectedFile ? "border-primary bg-primary/5" : ""}`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="video/mp4,.mp4"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      className="hidden"
                    />

                    <AnimatePresence mode="wait">
                      {!selectedFile ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-3"
                        >
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-shadow"
                          >
                            <Upload className="w-6 h-6 text-primary" />
                          </motion.div>
                          <div>
                            <p className="font-display font-semibold text-foreground">
                              Drag & drop your match video
                            </p>
                            <p className="text-muted-foreground text-xs mt-1 font-body">
                              or click to browse · .mp4 only · max 500MB
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="selected"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 glow-shadow">
                            <Film className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="font-display font-semibold text-foreground truncate text-sm">
                              {selectedFile.name}
                            </p>
                            <p className="text-muted-foreground text-xs font-body">
                              {formatSize(selectedFile.size)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(); }}
                              className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {fileError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-2 text-destructive text-xs font-body justify-center"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {fileError}
                    </motion.div>
                  )}

                  <motion.div className="mt-4 flex justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        disabled={!selectedFile}
                        onClick={() => selectedFile && simulateAnalysis()}
                        className="font-display px-8 py-5 accent-gradient text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 glow-shadow"
                      >
                        Start Analysis
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ANALYZING STATE */}
            {appState === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-2xl p-6 sm:p-8 scan-line"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-muted border-t-primary"
                    style={{ boxShadow: "0 0 20px hsl(142 70% 45% / 0.3)" }}
                  />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Analyzing Your Match
                  </h3>
                  <p className="text-muted-foreground text-xs font-body mt-1">{stage}</p>
                </div>

                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full accent-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ boxShadow: "0 0 10px hsl(142 70% 45% / 0.5)" }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground font-body mb-6">
                  <span>{Math.round(progress)}% complete</span>
                  <span>~{Math.max(1, Math.ceil((100 - progress) / 12))} min remaining</span>
                </div>

                <div className="space-y-2">
                  {stages.map((s, i) => {
                    const stageIndex = stages.indexOf(stage);
                    const isDone = i < stageIndex;
                    const isCurrent = s === stage;
                    return (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`flex items-center gap-2 text-xs font-body ${
                          isDone ? "text-primary" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground/50"
                        }`}
                      >
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : {}}
                          transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? "bg-primary" : isCurrent ? "bg-primary" : "bg-muted-foreground/20"
                          }`}
                          style={isCurrent || isDone ? { boxShadow: "0 0 8px hsl(142 70% 45% / 0.5)" } : {}}
                        />
                        {s}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DONE STATE */}
            {appState === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center glow-shadow"
                >
                  <FileText className="w-7 h-7 text-primary" />
                </motion.div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  Report is <span className="text-gradient">Ready</span>
                </h2>
                <p className="text-muted-foreground font-body text-sm mb-6">
                  Download it or get it delivered to your inbox.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {/* Download Video Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -3 }}
                    className="glass-card rounded-xl p-4 flex flex-col items-center text-center"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2 glow-shadow"
                    >
                      <Video className="w-4 h-4 text-primary" />
                    </motion.div>
                    <h3 className="font-display font-semibold text-foreground text-xs mb-1">Analyzed Video</h3>
                    <p className="text-muted-foreground text-[10px] font-body mb-2">
                      Video with overlays & tracking.
                    </p>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full mt-auto">
                      <Button
                        onClick={handleVideoDownload}
                        className="w-full accent-gradient text-accent-foreground hover:opacity-90 font-display text-xs glow-shadow"
                        size="sm"
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        Download
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Download PDF Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -3 }}
                    className="glass-card rounded-xl p-4 flex flex-col items-center text-center"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-9 h-9 rounded-lg accent-gradient flex items-center justify-center mb-2 glow-shadow"
                    >
                      <Download className="w-4 h-4 text-accent-foreground" />
                    </motion.div>
                    <h3 className="font-display font-semibold text-foreground text-xs mb-1">Download PDF</h3>
                    <p className="text-muted-foreground text-[10px] font-body mb-2">
                      Full analysis report as PDF.
                    </p>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full mt-auto">
                      <Button
                        onClick={handleDownload}
                        className="w-full accent-gradient text-accent-foreground hover:opacity-90 font-display text-xs glow-shadow"
                        size="sm"
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        Download
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Email Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -3 }}
                    className="glass-card rounded-xl p-4 flex flex-col items-center text-center"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-xs mb-1">Email Report</h3>
                    <p className="text-muted-foreground text-[10px] font-body mb-2">
                      Send PDF to your email.
                    </p>
                    <form onSubmit={handleEmailSubmit} className="w-full space-y-1.5 mt-auto">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={sent}
                        className="font-body text-xs bg-muted/50 border-border/50 focus:border-primary h-7"
                      />
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={!email.trim() || sending || sent}
                          className="w-full font-display border-primary/30 hover:bg-primary/10 text-foreground text-xs"
                          size="sm"
                        >
                          {sending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> :
                           sent ? <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary" /> :
                           <Mail className="w-3 h-3 mr-1.5" />}
                          {sent ? "Sent!" : sending ? "Sending..." : "Send"}
                        </Button>
                      </motion.div>
                    </form>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-3 text-center shrink-0">
        <p className="text-muted-foreground text-xs font-body">
          © 2026 CourtVision · AI-Powered Match Analysis
        </p>
      </div>
    </div>
  );
};

export default Index;
