import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Mail, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ReportSection = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleDownload = () => {
    toast.success("Report download started!", {
      description: "Your match analysis PDF is being prepared.",
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

  return (
    <section className="relative py-20 sm:py-28">
      <div className="absolute inset-0 grid-bg" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center glow-shadow"
          >
            <FileText className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Your Report is <span className="text-gradient">Ready</span>
          </h2>
          <p className="text-muted-foreground font-body">
            Download it or get it delivered to your inbox.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Download Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center mb-4 glow-shadow"
            >
              <Download className="w-6 h-6 text-accent-foreground" />
            </motion.div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              Download PDF
            </h3>
            <p className="text-muted-foreground text-sm font-body mb-5">
              Get the full analysis report as a downloadable PDF file.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
              <Button
                onClick={handleDownload}
                className="w-full accent-gradient text-accent-foreground hover:opacity-90 transition-opacity font-display glow-shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </motion.div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              Email Report
            </h3>
            <p className="text-muted-foreground text-sm font-body mb-5">
              We'll send the PDF report directly to your email address.
            </p>
            <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sent}
                className="font-body bg-muted/50 border-border/50 focus:border-primary"
              />
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!email.trim() || sending || sent}
                  className="w-full font-display border-primary/30 hover:bg-primary/10 text-foreground"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : sent ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {sent ? "Sent!" : sending ? "Sending..." : "Send to Email"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReportSection;
