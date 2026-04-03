import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CursorTracker = () => {
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const trailX = useSpring(0, { stiffness: 120, damping: 20 });
  const trailY = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
    };
  }, [cursorX, cursorY, trailX, trailY, visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Outer trail ring */}
      <motion.div
        style={{ x: trailX, y: trailY }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: clicking ? 24 : 40,
            height: clicking ? 24 : 40,
            borderColor: clicking
              ? "hsl(142 70% 45% / 0.8)"
              : "hsl(142 70% 45% / 0.4)",
          }}
          transition={{ duration: 0.15 }}
          className="rounded-full border-2 -translate-x-1/2 -translate-y-1/2"
          style={{
            boxShadow: "0 0 15px hsl(142 70% 45% / 0.2)",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: clicking ? 10 : 6,
            height: clicking ? 10 : 6,
          }}
          transition={{ duration: 0.1 }}
          className="rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "hsl(142 70% 45%)",
            boxShadow:
              "0 0 10px hsl(142 70% 45% / 0.6), 0 0 30px hsl(142 70% 45% / 0.3)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default CursorTracker;
