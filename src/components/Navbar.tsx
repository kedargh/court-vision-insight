import { Activity } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center glow-shadow">
            <Activity className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            CourtVision
          </span>
        </motion.div>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#upload"
          className="text-sm font-display font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2 rounded-full border border-primary/30 hover:border-primary/60 hover:glow-shadow"
        >
          Analyze Match →
        </motion.a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
