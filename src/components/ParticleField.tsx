import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Particles
    const particles: Particle[] = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    // Tracking targets that drift
    const targets = Array.from({ length: 6 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 30 + 20,
      label: ["P1", "P2", "BALL", "OBJ", "TGT", "SHT"][Math.floor(Math.random() * 6)],
      conf: (Math.random() * 30 + 70).toFixed(1),
    }));

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    // Draw a tennis court outline
    const drawTennisCourt = (cx: number, cy: number, scale: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = `hsla(142, 70%, 45%, ${alpha})`;
      ctx.lineWidth = 1;

      // Outer boundary
      ctx.strokeRect(-160, -95, 320, 190);
      // Inner singles
      ctx.strokeRect(-130, -95, 260, 190);
      // Net
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.lineTo(0, 95);
      ctx.stroke();
      // Service boxes
      ctx.strokeRect(-130, -50, 130, 100);
      ctx.strokeRect(0, -50, 130, 100);
      // Center service line
      ctx.beginPath();
      ctx.moveTo(-130, 0);
      ctx.lineTo(130, 0);
      ctx.stroke();
      // Center mark
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.lineTo(-155, 0);
      ctx.moveTo(160, 0);
      ctx.lineTo(155, 0);
      ctx.stroke();

      ctx.restore();
    };

    // Draw a badminton court outline
    const drawBadmintonCourt = (cx: number, cy: number, scale: number, alpha: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = `hsla(142, 90%, 50%, ${alpha})`;
      ctx.lineWidth = 1;

      // Outer doubles
      ctx.strokeRect(-100, -110, 200, 220);
      // Inner singles
      ctx.strokeRect(-85, -110, 170, 220);
      // Net
      ctx.beginPath();
      ctx.moveTo(-100, 0);
      ctx.lineTo(100, 0);
      ctx.stroke();
      // Short service lines
      ctx.beginPath();
      ctx.moveTo(-100, -40);
      ctx.lineTo(100, -40);
      ctx.moveTo(-100, 40);
      ctx.lineTo(100, 40);
      ctx.stroke();
      // Long service lines (doubles)
      ctx.beginPath();
      ctx.moveTo(-100, -95);
      ctx.lineTo(100, -95);
      ctx.moveTo(-100, 95);
      ctx.lineTo(100, 95);
      ctx.stroke();
      // Center line
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(0, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 40);
      ctx.stroke();

      ctx.restore();
    };

    // Draw CV-style bounding box
    const drawTrackingBox = (x: number, y: number, s: number, label: string, conf: string, alpha: number) => {
      ctx.save();
      const corner = 6;
      ctx.strokeStyle = `hsla(142, 70%, 50%, ${alpha})`;
      ctx.lineWidth = 1.5;

      // Corner brackets instead of full rect
      // Top-left
      ctx.beginPath();
      ctx.moveTo(x - s, y - s + corner);
      ctx.lineTo(x - s, y - s);
      ctx.lineTo(x - s + corner, y - s);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(x + s - corner, y - s);
      ctx.lineTo(x + s, y - s);
      ctx.lineTo(x + s, y - s + corner);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(x - s, y + s - corner);
      ctx.lineTo(x - s, y + s);
      ctx.lineTo(x - s + corner, y + s);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(x + s - corner, y + s);
      ctx.lineTo(x + s, y + s);
      ctx.lineTo(x + s, y + s - corner);
      ctx.stroke();

      // Label
      ctx.font = "9px 'Space Grotesk', monospace";
      ctx.fillStyle = `hsla(142, 70%, 50%, ${alpha * 1.2})`;
      ctx.fillText(`${label} ${conf}%`, x - s, y - s - 4);

      // Crosshair dot
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(142, 70%, 50%, ${alpha})`;
      ctx.fill();

      ctx.restore();
    };

    // Draw scan lines
    const drawScanOverlay = (t: number) => {
      // Horizontal scan line
      const scanY = (t * 0.3) % h;
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, "hsla(142, 70%, 45%, 0)");
      grad.addColorStop(0.5, "hsla(142, 70%, 45%, 0.04)");
      grad.addColorStop(1, "hsla(142, 70%, 45%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, w, 40);

      // Grid crosshair at mouse
      ctx.strokeStyle = "hsla(142, 70%, 45%, 0.08)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(mouse.current.x, 0);
      ctx.lineTo(mouse.current.x, h);
      ctx.moveTo(0, mouse.current.y);
      ctx.lineTo(w, mouse.current.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Coordinate readout near mouse
      ctx.font = "9px 'Space Grotesk', monospace";
      ctx.fillStyle = "hsla(142, 70%, 50%, 0.25)";
      ctx.fillText(
        `x:${Math.round(mouse.current.x)} y:${Math.round(mouse.current.y)}`,
        mouse.current.x + 12,
        mouse.current.y - 8
      );
    };

    // Draw HUD corner data
    const drawHUD = (t: number) => {
      ctx.font = "10px 'Space Grotesk', monospace";
      ctx.fillStyle = "hsla(142, 70%, 50%, 0.2)";

      // Top-left
      ctx.fillText("CV ENGINE v2.4", 16, 24);
      ctx.fillText(`FRAME: ${Math.floor(t * 0.6) % 99999}`, 16, 38);
      ctx.fillText(`FPS: ${(58 + Math.sin(t * 0.01) * 2).toFixed(1)}`, 16, 52);

      // Top-right
      const tr = ctx.measureText("TRACKING: ACTIVE");
      ctx.fillText("TRACKING: ACTIVE", w - tr.width - 16, 24);
      ctx.fillText("OBJECTS: " + targets.length, w - 90, 38);

      // Bottom-left
      ctx.fillText("COURT DETECTION: ON", 16, h - 16);

      // Corner bracket frame
      ctx.strokeStyle = "hsla(142, 70%, 50%, 0.1)";
      ctx.lineWidth = 1;
      const c = 20;
      // TL
      ctx.beginPath();
      ctx.moveTo(8, 8 + c);
      ctx.lineTo(8, 8);
      ctx.lineTo(8 + c, 8);
      ctx.stroke();
      // TR
      ctx.beginPath();
      ctx.moveTo(w - 8 - c, 8);
      ctx.lineTo(w - 8, 8);
      ctx.lineTo(w - 8, 8 + c);
      ctx.stroke();
      // BL
      ctx.beginPath();
      ctx.moveTo(8, h - 8 - c);
      ctx.lineTo(8, h - 8);
      ctx.lineTo(8 + c, h - 8);
      ctx.stroke();
      // BR
      ctx.beginPath();
      ctx.moveTo(w - 8 - c, h - 8);
      ctx.lineTo(w - 8, h - 8);
      ctx.lineTo(w - 8, h - 8 - c);
      ctx.stroke();
    };

    const draw = () => {
      time.current += 1;
      const t = time.current;
      ctx.clearRect(0, 0, w, h);

      // Courts - semi-transparent, drifting slowly
      const courtAlpha = 0.06 + Math.sin(t * 0.005) * 0.02;
      drawTennisCourt(w * 0.25, h * 0.35, 1.2 + Math.sin(t * 0.003) * 0.05, courtAlpha);
      drawBadmintonCourt(w * 0.75, h * 0.65, 1.1 + Math.cos(t * 0.004) * 0.05, courtAlpha * 0.8);

      // A smaller rotated court hint
      ctx.save();
      ctx.translate(w * 0.6, h * 0.2);
      ctx.rotate(Math.sin(t * 0.002) * 0.05);
      ctx.translate(-w * 0.6, -h * 0.2);
      drawTennisCourt(w * 0.6, h * 0.2, 0.5, courtAlpha * 0.5);
      ctx.restore();

      // Scan overlay
      drawScanOverlay(t);

      // Tracking boxes
      targets.forEach((tgt) => {
        tgt.x += tgt.vx;
        tgt.y += tgt.vy;
        if (tgt.x < 50 || tgt.x > w - 50) tgt.vx *= -1;
        if (tgt.y < 50 || tgt.y > h - 50) tgt.vy *= -1;
        const boxAlpha = 0.15 + Math.sin(t * 0.02 + tgt.x * 0.01) * 0.05;
        drawTrackingBox(tgt.x, tgt.y, tgt.size, tgt.label, tgt.conf, boxAlpha);
      });

      // Particles
      particles.forEach((p, i) => {
        p.pulse += p.pulseSpeed;
        const pAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          p.vx += (dx / dist) * force * 0.12;
          p.vy += (dy / dist) * force * 0.12;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(142, 70%, 50%, ${pAlpha})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `hsla(142, 70%, 50%, ${pAlpha * 0.4})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const ox = p.x - particles[j].x;
          const oy = p.y - particles[j].y;
          const d = Math.sqrt(ox * ox + oy * oy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(142, 70%, 45%, ${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      // HUD overlay
      drawHUD(t);

      animId = requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

export default ParticleField;
