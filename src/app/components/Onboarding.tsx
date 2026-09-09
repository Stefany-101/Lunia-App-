import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { ChevronRight, Calendar } from "lucide-react";

const STEPS = 3;

const STARS = [
  { x:  8, y:  9, s: 1.5, d: 0.0 }, { x: 22, y: 31, s: 1.0, d: 1.1 },
  { x: 38, y:  7, s: 1.8, d: 2.4 }, { x: 55, y: 19, s: 1.0, d: 0.7 },
  { x: 71, y:  5, s: 1.4, d: 3.1 }, { x: 84, y: 24, s: 1.0, d: 1.8 },
  { x: 92, y: 14, s: 1.6, d: 0.5 }, { x: 14, y: 52, s: 1.0, d: 2.9 },
  { x: 29, y: 64, s: 1.2, d: 0.3 }, { x: 47, y: 44, s: 1.0, d: 1.6 },
  { x: 63, y: 58, s: 1.5, d: 3.5 }, { x: 78, y: 47, s: 1.0, d: 0.9 },
  { x: 90, y: 66, s: 1.3, d: 2.2 }, { x:  6, y: 78, s: 1.0, d: 1.4 },
  { x: 19, y: 85, s: 1.7, d: 0.6 }, { x: 34, y: 91, s: 1.0, d: 3.0 },
  { x: 52, y: 80, s: 1.2, d: 1.9 }, { x: 67, y: 88, s: 1.0, d: 0.2 },
  { x: 81, y: 79, s: 1.4, d: 2.7 }, { x: 95, y: 90, s: 1.0, d: 1.3 },
  { x: 42, y: 26, s: 0.9, d: 2.0 }, { x: 73, y: 35, s: 1.1, d: 0.8 },
  { x: 11, y: 40, s: 1.3, d: 3.3 }, { x: 59, y: 72, s: 0.8, d: 1.5 },
];

/* "LUNIA" holographic: white → fuchsia → magenta */
const HOLO: React.CSSProperties = {
  background: "linear-gradient(90deg,#fff 0%,#f5d0fe 30%,#ec4899 65%,#f5d0fe 88%,#fff 100%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "holographic 3.5s ease infinite",
};

const LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "rgba(255,255,255,0.32)",
  display: "block", marginBottom: 8,
};

/* ─── 4-point sparkle ─────────────────────────────────────────────────── */
function Sp({ size = 12, color = "rgba(0,245,255,0.84)", style }: {
  size?: number; color?: string; style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0, ...style }}>
      <path d="M10 0 L11.9 8.1 L20 10 L11.9 11.9 L10 20 L8.1 11.9 L0 10 L8.1 8.1 Z" fill={color} />
    </svg>
  );
}

/* ─── God rays — 3 light beams from top, opacity 15% ─────────────────── */
function GodRays() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {[
        { left: "28%", rotate: -14 },
        { left: "50%", rotate:   0 },
        { left: "72%", rotate:  14 },
      ].map((r, i) => (
        <div key={i} style={{
          position: "absolute", top: 0, left: r.left,
          transform: `translateX(-50%) rotate(${r.rotate}deg)`,
          transformOrigin: "top center",
          width: 80, height: "62%",
          background: "linear-gradient(to bottom,rgba(168,85,247,0.18) 0%,rgba(168,85,247,0.06) 55%,transparent 100%)",
          filter: "blur(12px)",
        }} />
      ))}
    </div>
  );
}

/* ─── Sacred Geometry Halo — hexagram + concentric circles ───────────── */
function SacredHalo({ size = 230 }: { size?: number }) {
  const cx = size / 2, cy = size / 2, R = size * 0.44;
  const tri = (offset: number) =>
    [0, 120, 240].map(d => {
      const rad = ((d + offset) - 90) * Math.PI / 180;
      return `${(cx + R * Math.cos(rad)).toFixed(1)},${(cy + R * Math.sin(rad)).toFixed(1)}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
      <defs>
        <filter id="sh-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Concentric rings */}
      {[0.30, 0.50, 0.68, 0.85, 1.00].map((f, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * f}
          fill="none" stroke="rgba(168,85,247,0.13)" strokeWidth="0.7"/>
      ))}

      {/* Hexagram triangles */}
      <polygon points={tri(0)}  fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.28)" strokeWidth="0.8" filter="url(#sh-glow)"/>
      <polygon points={tri(60)} fill="rgba(168,85,247,0.06)" stroke="rgba(168,85,247,0.28)" strokeWidth="0.8" filter="url(#sh-glow)"/>

      {/* Outer neon ring */}
      <circle cx={cx} cy={cy} r={R * 1.01}
        fill="none" stroke="rgba(168,85,247,0.52)" strokeWidth="1.3" filter="url(#sh-glow)"/>

      {/* Radial spokes × 12 */}
      {Array.from({ length: 12 }, (_, i) => {
        const rad = (i * 30 - 90) * Math.PI / 180;
        const r0 = R * 0.32, r1 = R;
        return (
          <line key={i}
            x1={(cx + r0 * Math.cos(rad)).toFixed(1)} y1={(cy + r0 * Math.sin(rad)).toFixed(1)}
            x2={(cx + r1 * Math.cos(rad)).toFixed(1)} y2={(cy + r1 * Math.sin(rad)).toFixed(1)}
            stroke="rgba(168,85,247,0.09)" strokeWidth="0.5"/>
        );
      })}
    </svg>
  );
}

/* ─── Crystal sphere field — iridescent force-field ring ─────────────── */
function CrystalSphereField({ size = 195 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
      style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
      <defs>
        <radialGradient id="csf-glass" cx="35%" cy="26%" r="65%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.10"/>
          <stop offset="50%" stopColor="#00f5ff" stopOpacity="0.03"/>
          <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="csf-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00f5ff" stopOpacity="0.70"/>
          <stop offset="45%"  stopColor="#c084fc" stopOpacity="0.60"/>
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.60"/>
        </linearGradient>
        <filter id="csf-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Glass fill */}
      <circle cx="100" cy="100" r="96" fill="url(#csf-glass)"/>

      {/* Iridescent border */}
      <circle cx="100" cy="100" r="96"
        fill="none" stroke="url(#csf-border)" strokeWidth="1.8" filter="url(#csf-glow)"/>

      {/* Inner force-field dashes */}
      <circle cx="100" cy="100" r="80"
        fill="none" stroke="rgba(0,245,255,0.09)" strokeWidth="0.8" strokeDasharray="7,9"/>
      <circle cx="100" cy="100" r="62"
        fill="none" stroke="rgba(192,132,252,0.07)" strokeWidth="0.6" strokeDasharray="4,12"/>

      {/* Top specular crescent */}
      <ellipse cx="58" cy="30" rx="28" ry="10" fill="rgba(255,255,255,0.16)"
        transform="rotate(-18,58,30)"/>
    </svg>
  );
}

/* ─── Crystal Jelly Cat-Octopus mascot (based on image-3.png) ─────────── */
function CrystalCatMascot({ size = 160, wink = false }: { size?: number; wink?: boolean }) {
  return (
    <svg viewBox="0 0 200 228" width={size} height={Math.round(size * 1.14)}>
      <defs>
        {/* Main translucent teal body */}
        <radialGradient id="cc-body" cx="37%" cy="26%" r="72%">
          <stop offset="0%"  stopColor="#c4f8f8" stopOpacity="0.94"/>
          <stop offset="28%" stopColor="#67e3ec" stopOpacity="0.80"/>
          <stop offset="62%" stopColor="#22b8c8" stopOpacity="0.62"/>
          <stop offset="100%" stopColor="#0c7490" stopOpacity="0.42"/>
        </radialGradient>
        {/* Iridescent blue-purple overlay */}
        <linearGradient id="cc-irid" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor="#818cf8" stopOpacity="0.28"/>
          <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.22"/>
        </linearGradient>
        {/* Main specular highlight */}
        <radialGradient id="cc-hl" cx="28%" cy="20%" r="58%">
          <stop offset="0%"  stopColor="white" stopOpacity="0.92"/>
          <stop offset="48%" stopColor="white" stopOpacity="0.26"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        {/* Tentacle gradient */}
        <radialGradient id="cc-tent" cx="45%" cy="32%" r="65%">
          <stop offset="0%"  stopColor="#a5f3fc" stopOpacity="0.80"/>
          <stop offset="65%" stopColor="#22d3ee" stopOpacity="0.58"/>
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.36"/>
        </radialGradient>
        {/* Glow filter */}
        <filter id="cc-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="cc-soft" x="-12%" y="-12%" width="124%" height="124%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Ambient glow behind body */}
      <ellipse cx="100" cy="148" rx="68" ry="55" fill="rgba(34,211,238,0.12)" filter="url(#cc-glow)"/>

      {/* ── TENTACLES (5 blob shapes at bottom) ── */}
      <ellipse cx="48"  cy="198" rx="20" ry="22" fill="url(#cc-tent)"/>
      <ellipse cx="72"  cy="204" rx="20" ry="22" fill="url(#cc-tent)"/>
      <ellipse cx="100" cy="207" rx="20" ry="22" fill="url(#cc-tent)"/>
      <ellipse cx="128" cy="204" rx="20" ry="22" fill="url(#cc-tent)"/>
      <ellipse cx="152" cy="198" rx="20" ry="22" fill="url(#cc-tent)"/>
      {/* Tentacle highlights */}
      <ellipse cx="44"  cy="191" rx="9"  ry="6"  fill="rgba(255,255,255,0.35)"/>
      <ellipse cx="68"  cy="197" rx="9"  ry="6"  fill="rgba(255,255,255,0.30)"/>
      <ellipse cx="96"  cy="200" rx="9"  ry="6"  fill="rgba(255,255,255,0.30)"/>
      <ellipse cx="124" cy="197" rx="9"  ry="6"  fill="rgba(255,255,255,0.30)"/>
      <ellipse cx="148" cy="191" rx="9"  ry="6"  fill="rgba(255,255,255,0.35)"/>
      {/* Tentacle glass borders */}
      <ellipse cx="48"  cy="198" rx="20" ry="22" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1"/>
      <ellipse cx="100" cy="207" rx="20" ry="22" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1"/>
      <ellipse cx="152" cy="198" rx="20" ry="22" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1"/>

      {/* ── CAT EARS ── */}
      <path d="M 62,74 L 50,40 L 87,62 Z" fill="#4dd8e8" opacity="0.88"/>
      <path d="M 138,74 L 150,40 L 113,62 Z" fill="#4dd8e8" opacity="0.88"/>
      {/* Ear inner highlight */}
      <path d="M 68,72 L 59,46 L 83,63 Z" fill="rgba(240,230,255,0.24)"/>
      <path d="M 132,72 L 141,46 L 117,63 Z" fill="rgba(240,230,255,0.24)"/>

      {/* ── MAIN BODY ── */}
      <ellipse cx="100" cy="142" rx="77" ry="82" fill="url(#cc-body)"/>
      <ellipse cx="100" cy="142" rx="77" ry="82" fill="url(#cc-irid)"/>
      {/* Glass edge ring */}
      <ellipse cx="100" cy="142" rx="77" ry="82" fill="none"
        stroke="rgba(167,139,250,0.26)" strokeWidth="1.5"/>

      {/* ── SPECULAR HIGHLIGHTS ── */}
      {/* Large primary highlight (upper-left) */}
      <ellipse cx="65"  cy="100" rx="36" ry="26" fill="url(#cc-hl)" transform="rotate(-20,65,100)"/>
      {/* Hot-spot */}
      <ellipse cx="53"  cy="88"  rx="17" ry="11" fill="rgba(255,255,255,0.60)"/>
      <ellipse cx="47"  cy="82"  rx="8"  ry="5.5" fill="rgba(255,255,255,0.82)" filter="url(#cc-soft)"/>
      {/* Right-side iridescent gleam */}
      <ellipse cx="150" cy="118" rx="12" ry="18" fill="rgba(192,132,252,0.20)"
        transform="rotate(22,150,118)"/>
      {/* Bottom secondary */}
      <ellipse cx="100" cy="198" rx="28" ry="5"  fill="rgba(255,255,255,0.12)"/>

      {/* ── EYES ── */}
      {wink ? (
        /* Wink: closed crescent arcs + blush */
        <>
          <path d="M 65,134 Q 80,123 95,134" fill="none"
            stroke="rgba(15,6,42,0.85)" strokeWidth="5.5" strokeLinecap="round"/>
          <path d="M 105,134 Q 120,123 135,134" fill="none"
            stroke="rgba(15,6,42,0.85)" strokeWidth="5.5" strokeLinecap="round"/>
          <ellipse cx="72"  cy="143" rx="14" ry="6" fill="rgba(252,165,165,0.32)"/>
          <ellipse cx="128" cy="143" rx="14" ry="6" fill="rgba(252,165,165,0.32)"/>
        </>
      ) : (
        /* Open dark oval eyes */
        <>
          <ellipse cx="80"  cy="134" rx="15.5" ry="18" fill="rgba(15,6,42,0.92)"/>
          <ellipse cx="120" cy="134" rx="15.5" ry="18" fill="rgba(15,6,42,0.92)"/>
          {/* Primary specular dot */}
          <circle cx="74"  cy="127" r="4.8" fill="rgba(255,255,255,0.90)"/>
          <circle cx="114" cy="127" r="4.8" fill="rgba(255,255,255,0.90)"/>
          {/* Secondary micro-reflection */}
          <circle cx="86"  cy="141" r="2.2" fill="rgba(255,255,255,0.40)"/>
          <circle cx="126" cy="141" r="2.2" fill="rgba(255,255,255,0.40)"/>
        </>
      )}

      {/* ── NOSE + MOUTH ── */}
      <circle cx="100" cy="153" r="3" fill="rgba(15,6,42,0.42)"/>
      {!wink && (
        <path d="M 94,158 Q 100,163 106,158" fill="none"
          stroke="rgba(15,6,42,0.32)" strokeWidth="2.2" strokeLinecap="round"/>
      )}
    </svg>
  );
}

/* ─── Shockwave — expanding ring on mascot press ─────────────────────── */
function Shockwave({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          initial={{ width: 24, height: 24, opacity: 0.92 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            border: "2px solid rgba(0,245,255,0.75)",
            boxShadow: "0 0 16px rgba(0,245,255,0.45), 0 0 32px rgba(192,132,252,0.35)",
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Glassmorphism gradient-border input ───────────────────────────── */
function GlassInput({ field, type, placeholder, value, onChange, focused, onFocus, onBlur, flex }: {
  field: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; focused: string | null;
  onFocus: () => void; onBlur: () => void; flex?: number;
}) {
  const active = focused === field;
  return (
    <div style={{
      flex, borderRadius: 14, padding: 1,
      background: active
        ? "linear-gradient(135deg,rgba(0,245,255,0.76),rgba(192,132,252,0.66),rgba(249,168,212,0.66))"
        : "linear-gradient(135deg,rgba(0,245,255,0.26),rgba(192,132,252,0.18),rgba(249,168,212,0.18))",
      boxShadow: active
        ? "0 0 18px rgba(0,245,255,0.22),0 0 36px rgba(192,132,252,0.16)"
        : "0 0 6px rgba(0,245,255,0.05)",
      transition: "box-shadow 0.28s ease, background 0.28s ease",
    }}>
      <div style={{ borderRadius: 13, display: "flex", alignItems: "center", position: "relative" }}>
        <Sp size={9} color={active ? "rgba(0,245,255,0.95)" : "rgba(192,132,252,0.42)"}
          style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          style={{
            width: "100%", padding: "13px 14px 13px 32px",
            background: "rgba(255,255,255,0.06)",
            border: "none", color: "#fff", outline: "none",
            fontSize: 14.5, backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxSizing: "border-box", fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, setUserName } = useAppContext();

  const [step, setStep]                   = useState(0); // 0 = splash
  const [splashPhase, setSplashPhase]     = useState(0); // 0 ¡Hola… | 1 blank | 2 full reveal
  const [wink, setWink]                   = useState(false);
  const [squishTrigger, setSquishTrigger] = useState(0);
  const [knowsCycle, setKnowsCycle]       = useState<boolean | null>(null);
  const [name, setName]                   = useState("");
  const [age, setAge]                     = useState("");
  const [weight, setWeight]               = useState("");
  const [height, setHeight]               = useState("");
  const [focused, setFocused]             = useState<string | null>(null);
  const [btnHover, setBtnHover]           = useState(false);

  const goToForm = useCallback(() => setStep(1), []);

  /* Splash timing: 800 → blank → 1500 → reveal → 3800 → form */
  useEffect(() => {
    if (step !== 0) return;
    const ts = [
      setTimeout(() => setSplashPhase(1), 800),
      setTimeout(() => setSplashPhase(2), 1500),
      setTimeout(() => goToForm(), 3800),
    ];
    return () => ts.forEach(clearTimeout);
  }, [step, goToForm]);

  const handleMascotPress = () => {
    setWink(true);
    setSquishTrigger(n => n + 1);
    setTimeout(() => setWink(false), 620);
  };

  const tmb = age && weight && height
    ? Math.round(655.1 + 9.563 * Number(weight) + 1.85 * Number(height) - 4.676 * Number(age))
    : null;

  const handleNext = () => {
    if (step < STEPS) setStep(s => s + 1);
    else {
      if (name) setUserName(name);
      completeOnboarding();
      navigate("/dashboard");
    }
  };

  const btnShadow = btnHover
    ? "0 14px 50px rgba(109,40,217,0.70),0 0 70px rgba(192,132,252,0.44),0 0 0 1px rgba(255,255,255,0.18) inset"
    : "0 8px 36px rgba(109,40,217,0.50),0 0 0 1px rgba(255,255,255,0.11) inset";

  return (
    <div className="h-full flex flex-col relative overflow-hidden">

      {/* Stars */}
      {STARS.map((st, i) => (
        <div key={i} className="animate-twinkle" style={{
          position: "absolute", left: `${st.x}%`, top: `${st.y}%`,
          width: st.s, height: st.s, borderRadius: "50%",
          background: i % 6 === 0 ? "rgba(192,132,252,0.9)" : i % 5 === 0 ? "rgba(249,168,212,0.8)" : "#fff",
          opacity: 0.28 + (i % 4) * 0.12, animationDelay: `${st.d}s`,
          animationDuration: `${2.6 + (i % 5) * 0.65}s`, pointerEvents: "none",
        }} />
      ))}

      {/* Nebulae blobs */}
      <div className="animate-nebula pointer-events-none" style={{
        position: "absolute", top: -80, left: -80, width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(88,28,220,0.24) 0%,transparent 65%)",
        filter: "blur(52px)",
      }} />
      <div className="animate-nebula pointer-events-none" style={{
        position: "absolute", bottom: -40, right: -40, width: 240, height: 240,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(216,50,130,0.18) 0%,transparent 65%)",
        filter: "blur(44px)", animationDelay: "8s",
      }} />

      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════
            STEP 0 — CINEMATIC SPLASH
        ════════════════════════════════════ */}
        {step === 0 && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* God rays — always visible during splash */}
            <GodRays />

            {/* Deep violet + fuchsia background glow (Estado A) */}
            <div style={{
              position: "absolute", top: "25%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 320, height: 320, borderRadius: "50%",
              background: "radial-gradient(circle,rgba(236,72,153,0.16) 0%,rgba(168,85,247,0.20) 50%,transparent 78%)",
              filter: "blur(38px)", pointerEvents: "none",
            }} />

            {/* ─ Phase 0: "¡Hola..." ─ */}
            <motion.div
              animate={{
                opacity: splashPhase === 0 ? 1 : 0,
                y: splashPhase === 0 ? 0 : -14,
              }}
              transition={{ duration: 0.42, ease: "easeInOut" }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                pointerEvents: splashPhase === 0 ? "auto" : "none",
              }}
            >
              <h1 style={{
                fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                fontSize: 34, fontWeight: 400, color: "#fff",
                letterSpacing: "-0.02em",
              }}>¡Hola...</h1>
            </motion.div>

            {/* ─ Phase 2: Full reveal (mascot + title + subtitle) ─ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: splashPhase === 2 ? 1 : 0 }}
              transition={{ duration: 0.62, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 20, padding: "48px 24px",
                pointerEvents: splashPhase === 2 ? "auto" : "none",
              }}
            >
              {/* Title */}
              <motion.div
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: splashPhase === 2 ? 0 : 18, opacity: splashPhase === 2 ? 1 : 0 }}
                transition={{ duration: 0.55, delay: 0.12 }}
                style={{ textAlign: "center" }}
              >
                <h1 style={{
                  fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                  fontSize: 30, fontWeight: 400, color: "#fff",
                  letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  Yo soy{" "}
                  <span style={{ ...HOLO, fontSize: 42, fontStyle: "italic" }}>LUNIA</span>
                  <span style={{ color: "#fff" }}>!</span>
                </h1>
              </motion.div>

              {/* Mascot container: halo + sphere + mascot + shockwave */}
              <motion.div
                initial={{ y: 44, opacity: 0, scale: 0.72 }}
                animate={{
                  y: splashPhase === 2 ? 0 : 44,
                  opacity: splashPhase === 2 ? 1 : 0,
                  scale: splashPhase === 2 ? 1 : 0.72,
                }}
                transition={{ duration: 0.75, delay: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ position: "relative", width: 230, height: 230 }}
              >
                {/* Sacred geometry halo (z: 0) */}
                <SacredHalo size={230} />

                {/* Crystal sphere force-field (z: 1) */}
                <CrystalSphereField size={196} />

                {/* Mascot float + squish (z: 2) */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                  <div className="animate-float">
                    <motion.div
                      onTapStart={handleMascotPress}
                      whileTap={{ scaleY: 0.80, scaleX: 1.10 }}
                      transition={{ type: "spring", stiffness: 500, damping: 12 }}
                      style={{ cursor: "pointer", display: "inline-block" }}
                    >
                      <CrystalCatMascot size={155} wink={wink} />
                    </motion.div>
                  </div>
                </div>

                {/* Shockwave ring */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)", pointerEvents: "none",
                }}>
                  <Shockwave trigger={squishTrigger} />
                </div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: splashPhase === 2 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                style={{
                  color: "#E9D5FF", fontSize: 14, textAlign: "center",
                  fontFamily: "inherit", letterSpacing: "0.01em",
                }}
              >
                Tu guía astral y compañera de bienestar.
              </motion.p>

              {/* Manual skip */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: splashPhase === 2 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: 0.75 }}
                onClick={goToForm}
                whileHover={{ scale: 1.06, filter: "brightness(1.14)" }}
                whileTap={{ scale: 0.94 }}
                style={{
                  padding: "12px 36px", borderRadius: 99, border: "none", cursor: "pointer",
                  background: "linear-gradient(130deg,#6d28d9,#a855f7,#ec4899)",
                  boxShadow: "0 8px 28px rgba(109,40,217,0.55)",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 99,
                  background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.15) 50%,transparent 72%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer-sweep 3s ease-in-out infinite",
                }} />
                <Sp size={11} color="rgba(255,255,255,0.85)" style={{ position: "relative", zIndex: 1 }} />
                <span style={{ position: "relative", zIndex: 1 }}>Comenzar</span>
                <Sp size={11} color="rgba(255,255,255,0.85)" style={{ position: "relative", zIndex: 1 }} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ════════════════════════════════════
            STEPS 1-3 — FORM FLOW
        ════════════════════════════════════ */}
        {step > 0 && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.46, ease: [0.4, 0, 0.2, 1] }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Progress pills */}
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: 6, paddingTop: 52, paddingBottom: 10,
              position: "relative", zIndex: 10,
            }}>
              {Array.from({ length: STEPS }).map((_, i) => (
                <motion.div key={i}
                  animate={{ width: i + 1 === step ? 28 : 7 }}
                  transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    height: 5, borderRadius: 99,
                    background: i + 1 <= step
                      ? "linear-gradient(90deg,#7c3aed,#c084fc,#ec4899)"
                      : "rgba(255,255,255,0.10)",
                    boxShadow: i + 1 === step ? "0 0 10px rgba(192,132,252,0.70)" : "none",
                  }} />
              ))}
            </div>

            {/* Step content area */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "0 24px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              position: "relative", zIndex: 10,
            }}>
              <AnimatePresence mode="wait">

                {/* ── Step 1: Profile ── */}
                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -22, filter: "blur(4px)" }}
                    transition={{ duration: 0.44, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 4 }}>
                      <h2 style={{
                        fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                        fontSize: 28, fontWeight: 400, color: "#fff",
                        letterSpacing: "-0.02em", marginBottom: 8,
                      }}>Tu perfil cósmico</h2>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13.5 }}>
                        Cuéntame un poco sobre ti
                      </p>
                    </div>

                    <div>
                      <label style={LABEL}>Tu nombre</label>
                      <GlassInput field="name" type="text" placeholder="¿Cómo te llaman las estrellas?"
                        value={name} onChange={setName} focused={focused}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                    </div>
                    <div>
                      <label style={LABEL}>Edad</label>
                      <GlassInput field="age" type="number" placeholder="Ej. 28"
                        value={age} onChange={setAge} focused={focused}
                        onFocus={() => setFocused("age")} onBlur={() => setFocused(null)} />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={LABEL}>Peso (kg)</label>
                        <GlassInput field="weight" type="number" placeholder="65"
                          value={weight} onChange={setWeight} focused={focused}
                          onFocus={() => setFocused("weight")} onBlur={() => setFocused(null)} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={LABEL}>Altura (cm)</label>
                        <GlassInput field="height" type="number" placeholder="165"
                          value={height} onChange={setHeight} focused={focused}
                          onFocus={() => setFocused("height")} onBlur={() => setFocused(null)} />
                      </div>
                    </div>

                    {tmb && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{
                          padding: "14px 18px", borderRadius: 16, textAlign: "center",
                          background: "rgba(0,245,255,0.05)",
                          border: "1px solid rgba(0,245,255,0.16)",
                          backdropFilter: "blur(20px)",
                        }}
                      >
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginBottom: 4,
                          letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Tasa Metabólica Basal
                        </p>
                        <p style={{ fontSize: 24, fontWeight: 600, ...HOLO }}>
                          {tmb}{" "}
                          <span style={{ fontSize: 12, fontWeight: 400 }}>kcal/día</span>
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ── Step 2: Cycle question ── */}
                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -22, filter: "blur(4px)" }}
                    transition={{ duration: 0.44, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 64, height: 64, borderRadius: "50%", marginBottom: 14,
                        background: "rgba(0,245,255,0.07)",
                        border: "1px solid rgba(0,245,255,0.22)",
                        boxShadow: "0 0 28px rgba(0,245,255,0.14)",
                        backdropFilter: "blur(16px)",
                      }}>
                        <Calendar size={26} style={{ color: "#67e8f9" }} />
                      </div>
                      <h2 style={{
                        fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                        fontSize: 24, fontWeight: 400, color: "#fff", marginBottom: 8,
                      }}>Tu Ciclo Lunar</h2>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
                        ¿Conoces la fecha de tu último ciclo menstrual?
                      </p>
                    </div>

                    {[
                      { label: "Sí, lo sé",      sub: "Ingresaré la fecha exacta",      val: true,  dot: "#00f5ff" },
                      { label: "No estoy segura", sub: "Comenzaremos a explorar juntas", val: false, dot: "#f9a8d4" },
                    ].map((opt, idx) => (
                      <motion.button
                        key={String(opt.val)}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ scale: 1.012, y: -1 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => { setKnowsCycle(opt.val); handleNext(); }}
                        style={{
                          width: "100%", padding: "15px 18px", borderRadius: 16,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          backdropFilter: "blur(16px)",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: opt.dot, boxShadow: `0 0 10px ${opt.dot}`,
                          }} />
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 14.5, color: "#fff", marginBottom: 2 }}>
                              {opt.label}
                            </p>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.34)" }}>
                              {opt.sub}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.26)", flexShrink: 0 }} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {/* ── Step 3a: 7-day calibration ── */}
                {step === 3 && knowsCycle === false && (
                  <motion.div key="s3a"
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -22, filter: "blur(4px)" }}
                    transition={{ duration: 0.44, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <h2 style={{
                        fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                        fontSize: 24, fontWeight: 400, color: "#fff", marginBottom: 8,
                      }}>Descubriendo tu ritmo</h2>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
                        7 días de observación para sincronizarnos.
                      </p>
                    </div>
                    <div style={{
                      padding: "28px 22px", borderRadius: 24, textAlign: "center",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(0,245,255,0.14)",
                      backdropFilter: "blur(20px)",
                    }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 54, height: 54, borderRadius: "50%", marginBottom: 14,
                        background: "linear-gradient(135deg,#6d28d9,#a855f7,#ec4899)",
                        color: "#fff", fontSize: 16, fontWeight: 700,
                        boxShadow: "0 8px 28px rgba(109,40,217,0.60)",
                      }}>1/7</div>
                      <h3 style={{ fontWeight: 500, fontSize: 15, color: "#fff", marginBottom: 6 }}>
                        Día 1 de Calibración
                      </h3>
                      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.36)", marginBottom: 18 }}>
                        Registra tus síntomas cada día para que LUNIA aprenda tu ritmo único.
                      </p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: i === 0 ? "linear-gradient(135deg,#00f5ff,#8b5cf6)" : "rgba(255,255,255,0.10)",
                            boxShadow: i === 0 ? "0 0 10px rgba(0,245,255,0.80)" : "none",
                          }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3b: date picker ── */}
                {step === 3 && knowsCycle === true && (
                  <motion.div key="s3b"
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -22, filter: "blur(4px)" }}
                    transition={{ duration: 0.44, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: "flex", flexDirection: "column", gap: 20 }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <h2 style={{
                        fontFamily: "var(--font-serif,'Playfair Display',Georgia,serif)",
                        fontSize: 24, fontWeight: 400, color: "#fff", marginBottom: 8,
                      }}>Fecha de inicio</h2>
                      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
                        Selecciona el primer día de tu último ciclo
                      </p>
                    </div>
                    <div style={{
                      borderRadius: 14, padding: 1,
                      background: focused === "date"
                        ? "linear-gradient(135deg,rgba(0,245,255,0.76),rgba(192,132,252,0.65))"
                        : "linear-gradient(135deg,rgba(0,245,255,0.26),rgba(192,132,252,0.18))",
                      boxShadow: focused === "date" ? "0 0 18px rgba(0,245,255,0.20)" : "none",
                      transition: "all 0.28s ease",
                    }}>
                      <input type="date"
                        onFocus={() => setFocused("date")} onBlur={() => setFocused(null)}
                        style={{
                          width: "100%", padding: "14px 18px",
                          background: "rgba(255,255,255,0.06)",
                          border: "none", borderRadius: 13, color: "#fff",
                          outline: "none", fontSize: 14.5,
                          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                          boxSizing: "border-box", colorScheme: "dark", fontFamily: "inherit",
                        }} />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* CTA button — hidden on step 2 (options are inline) */}
            <AnimatePresence>
              {step !== 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28 }}
                  style={{ padding: "0 24px 32px", position: "relative", zIndex: 10 }}
                >
                  {/* Iridescent aura */}
                  <div style={{
                    position: "absolute", bottom: 24, left: "10%", right: "10%", height: 20,
                    background: "radial-gradient(ellipse,rgba(0,245,255,0.22) 0%,rgba(192,132,252,0.32) 45%,rgba(236,72,153,0.18) 70%,transparent)",
                    filter: "blur(18px)", borderRadius: "50%",
                    opacity: btnHover ? 1 : 0.6, transition: "opacity 0.25s ease",
                    pointerEvents: "none",
                  }} />

                  <motion.button
                    onHoverStart={() => setBtnHover(true)}
                    onHoverEnd={() => setBtnHover(false)}
                    whileHover={{ scale: 1.018, y: -2, filter: "brightness(1.15)" }}
                    whileTap={{ scale: 0.972, filter: "brightness(1)" }}
                    onClick={handleNext}
                    style={{
                      position: "relative", overflow: "hidden",
                      width: "100%", padding: "16px 24px", borderRadius: 20,
                      background: "linear-gradient(130deg,#6d28d9 0%,#8b5cf6 35%,#a855f7 60%,#db2777 100%)",
                      boxShadow: btnShadow,
                      color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "0.025em",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      marginBottom: 10, transition: "box-shadow 0.25s ease",
                    }}
                  >
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 20,
                      background: "linear-gradient(105deg,transparent 28%,rgba(255,255,255,0.16) 50%,transparent 72%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer-sweep 3.2s ease-in-out infinite",
                    }} />
                    <Sp size={14} color="rgba(255,255,255,0.88)" style={{ position: "relative", zIndex: 1 }} />
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {step === STEPS ? "Comenzar mi viaje cósmico" : "Continuar"}
                    </span>
                    <Sp size={14} color="rgba(255,255,255,0.88)" style={{ position: "relative", zIndex: 1 }} />
                  </motion.button>

                  <p style={{
                    textAlign: "center", fontSize: 10.5,
                    color: "rgba(255,255,255,0.16)", letterSpacing: "0.05em",
                  }}>
                    Paso {step} de {STEPS} · LUNIA protege tus datos con amor
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
