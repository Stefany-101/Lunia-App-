import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { Wind, Battery, Sparkles, Heart, MessageCircleHeart, RefreshCw } from "lucide-react";
import { LunaChatModal } from "./LunaChatModal";

type PhaseKey = "A" | "B" | "C" | "D";

const PHASES: Record<PhaseKey, {
  title: string; desc: string;
  moonEmoji: string; moonLabel: string;
  petEmoji: string; petMood: string;
  accent: string; glow: string; orb: string;
}> = {
  A: { title: "Fase Menstrual", desc: "Tiempo de descanso y reflexión profunda.", moonEmoji: "🌑", moonLabel: "Luna Nueva", petEmoji: "🌙", petMood: "Descansando...", accent: "#f472b6", glow: "rgba(244,114,182,0.5)", orb: "radial-gradient(circle,rgba(244,114,182,0.3) 0%,transparent 70%)" },
  B: { title: "Fase Folicular", desc: "Energía en ascenso. Ideal para nuevos comienzos.", moonEmoji: "🌒", moonLabel: "Luna Creciente", petEmoji: "✨", petMood: "¡Creciendo contigo!", accent: "#818cf8", glow: "rgba(129,140,248,0.5)", orb: "radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)" },
  C: { title: "Fase Ovulatoria", desc: "Pico de energía y sociabilidad. ¡El universo te acompaña!", moonEmoji: "🌕", moonLabel: "Luna Llena", petEmoji: "⭐", petMood: "¡Brillando al máximo!", accent: "#fde68a", glow: "rgba(253,230,138,0.7)", orb: "radial-gradient(circle,rgba(253,230,138,0.3) 0%,transparent 70%)" },
  D: { title: "Fase Lútea", desc: "La energía desciende. Escucha a tu cuerpo con amor.", moonEmoji: "🌖", moonLabel: "Luna Menguante", petEmoji: "💜", petMood: "Calmando las olas...", accent: "#c084fc", glow: "rgba(192,132,252,0.5)", orb: "radial-gradient(circle,rgba(139,92,246,0.3) 0%,transparent 70%)" },
};

const BREATHE_PHASES = ["Inhala", "Mantén", "Exhala", "Pausa"];

const ENERGY_META: Record<string, { emoji: string; label: string; color: string }> = {
  high:   { emoji: "⭐", label: "En modo galaxia",      color: "#fde68a" },
  medium: { emoji: "🌙", label: "Navegando las olas",   color: "#c084fc" },
  low:    { emoji: "🌑", label: "Recargando baterías",  color: "#f472b6" },
};

function energyMeta(e: number) {
  if (e >= 68) return ENERGY_META.high;
  if (e >= 42) return ENERGY_META.medium;
  return ENERGY_META.low;
}

export function Dashboard() {
  const { profile, stressLevel, setStressLevel, userName } = useAppContext();
  const [showBreathing, setShowBreathing] = useState(stressLevel > 3);
  const [breatheStep, setBreatheStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [detectedEnergy, setDetectedEnergy] = useState<number | null>(null);

  const phase = PHASES[profile];
  const greeting = userName ? `Hola, ${userName}` : "Hola, viajera";
  const em = detectedEnergy !== null ? energyMeta(detectedEnergy) : null;

  return (
    <>
      <div className="min-h-screen pb-28 relative">
        {/* Phase ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-72 pointer-events-none"
          style={{ background: phase.orb, filter: "blur(64px)", opacity: 0.75 }} />

        <div className="relative z-10 px-5 pt-12 space-y-4">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{greeting}</p>
            <h1 className="text-3xl font-light mb-1" style={{ color: "#fff", letterSpacing: "-0.02em" }}>{phase.title}</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{phase.desc}</p>
          </motion.div>

          {/* Moon Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", minHeight: 210 }}>
            {[...Array(14)].map((_, i) => (
              <div key={i} className="absolute rounded-full animate-twinkle"
                style={{ width: i % 3 === 0 ? 2 : 1.5, height: i % 3 === 0 ? 2 : 1.5, left: `${6 + i * 6.5}%`, top: `${12 + (i % 4) * 22}%`, background: "#fff", opacity: 0.5, animationDelay: `${i * 0.35}s`, animationDuration: `${2.2 + (i % 3) * 0.8}s` }} />
            ))}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl select-none text-[#ffffff]" style={{ filter: `drop-shadow(0 0 18px ${phase.glow}) drop-shadow(0 0 36px ${phase.glow})`, lineHeight: 1 }}>
                {phase.moonEmoji}
              </motion.div>
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.38)" }}>{phase.moonLabel}</span>
            </div>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-3">
              <motion.div animate={{ rotate: [0, 10, -6, 0], scale: [1, 1.1, 0.95, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl select-none">{phase.petEmoji}</motion.div>
              <div className="px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
                <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.72)" }}>{phase.petMood}</p>
              </div>
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>Mascota Cósmica · Sincronizada con tu ciclo</span>
            </div>
          </motion.div>

          {/* ── SOCIAL BATTERY / ENERGY CHAT WIDGET ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-5 rounded-3xl relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>

            {/* Ambient pink glow */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(244,114,182,0.2) 0%,transparent 70%)", filter: "blur(18px)" }} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Batería Social</p>
                  <h3 className="font-medium" style={{ color: "#fff" }}>
                    {detectedEnergy !== null ? "Energía detectada 🔮" : "¿Cómo estás hoy?"}
                  </h3>
                </div>
                <Battery size={20} style={{ color: "rgba(255,255,255,0.3)", marginTop: 2 }} />
              </div>

              {detectedEnergy !== null && em ? (
                /* ─ Result state ─ */
                <AnimatePresence mode="wait">
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    {/* Energy bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{em.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{em.label}</span>
                          <span className="text-xs font-bold" style={{ color: em.color }}>{detectedEnergy}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${detectedEnergy}%` }}
                            transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1] }}
                            style={{ background: `linear-gradient(90deg,#7c3aed,${em.color})`, boxShadow: `0 0 10px ${em.color}88` }} />
                        </div>
                      </div>
                    </div>
                    {/* Re-detect button */}
                    <button onClick={() => setShowChat(true)}
                      className="w-full py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                      <RefreshCw size={13} />
                      Volver a chatear con LUNA
                    </button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                /* ─ CTA state ─ */
                <AnimatePresence mode="wait">
                  <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {/* Placeholder energy */}
                    <div className="flex items-center gap-2 mb-3">
                      {["🌑", "🌒", "🌓", "🌔", "🌕"].map((moon, i) => (
                        <div key={i} className="flex-1 h-8 rounded-xl flex items-center justify-center text-sm"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", opacity: 0.5 + i * 0.1 }}>
                          {moon}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.38)" }}>
                      Cuéntale a LUNA cómo va tu día y detectará tu nivel de energía real ✨
                    </p>
                    <button onClick={() => setShowChat(true)}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)", color: "#fff", boxShadow: "0 6px 24px rgba(124,58,237,0.45)" }}>
                      <MessageCircleHeart size={17} />
                      ¿Cómo estás hoy? ¡Detectemos tu energía! 💫
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Cortisol Regulator */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>

            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(129,140,248,0.18) 0%,transparent 70%)", filter: "blur(20px)" }} />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <h3 className="font-medium" style={{ color: "#fff" }}>Regulador de Cortisol</h3>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Estrés detectado: {stressLevel}/5</p>
              </div>
              <Wind size={22} style={{ color: "rgba(255,255,255,0.32)" }} />
            </div>

            <AnimatePresence mode="wait">
              {showBreathing ? (
                <motion.div key="breathing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 relative z-10">
                  <div className="relative w-32 h-32 flex items-center justify-center cursor-pointer mb-3"
                    onClick={() => setBreatheStep(s => (s + 1) % BREATHE_PHASES.length)}>
                    <div className="absolute inset-0 rounded-full animate-breathe" style={{ background: "rgba(129,140,248,0.12)", animationDuration: "7s" }} />
                    <div className="absolute inset-4 rounded-full animate-breathe" style={{ background: "rgba(139,92,246,0.18)", animationDuration: "7s", animationDelay: "1.2s" }} />
                    <div className="absolute inset-8 rounded-full animate-breathe" style={{ background: "rgba(192,132,252,0.22)", animationDuration: "7s", animationDelay: "2.4s" }} />
                    <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <span className="text-[11px] font-semibold text-center" style={{ color: "#c084fc", lineHeight: 1.2 }}>
                        {BREATHE_PHASES[breatheStep]}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>Toca el círculo para avanzar</p>
                  <button onClick={() => { setStressLevel(2); setShowBreathing(false); }}
                    className="px-5 py-2 rounded-full text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.6)" }}>
                    Finalizar ejercicio
                  </button>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-2 relative z-10">
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} onClick={() => setStressLevel(i + 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: i < stressLevel ? "linear-gradient(135deg,#7c3aed,#ec4899)" : "rgba(255,255,255,0.07)",
                          color: i < stressLevel ? "#fff" : "rgba(255,255,255,0.28)",
                          boxShadow: i < stressLevel ? "0 2px 12px rgba(124,58,237,0.5)" : "none",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {stressLevel <= 2 ? "Tus niveles están controlados ✨" : stressLevel <= 3 ? "Un poco de tensión, normal 🌙" : "Hagamos una pausa cósmica 💜"}
                  </p>
                  <button onClick={() => setShowBreathing(true)}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(139,92,246,0.35)", color: "#c084fc" }}>
                    <Sparkles size={12} className="inline mr-1.5" />
                    Iniciar respiración cósmica
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <LunaChatModal
            onClose={() => setShowChat(false)}
            onEnergyDetected={(e) => { setDetectedEnergy(e); setShowChat(false); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
