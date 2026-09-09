import { useState } from "react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { FileDown, CloudLightning, CheckCircle2 } from "lucide-react";

export function HealthLog() {
  const { devMode } = useAppContext();
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [symptoms, setSymptoms] = useState({ cramps: 2, headache: 1, bloating: 3, mood: 4 });

  const handleSync = () => {
    setSyncing(true);
    setSynced(false);
    setTimeout(() => { setSyncing(false); setSynced(true); setTimeout(() => setSynced(false), 3000); }, 2500);
  };

  const ScaleRow = ({ label, emoji, value, onChange }: { label: string; emoji: string; value: number; onChange: (v: number) => void }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
          <span>{emoji}</span>{label}
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.25)' }}>
          {value}/5
        </span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} onClick={() => onChange(v)}
            className="flex-1 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={{
              background: value >= v
                ? `linear-gradient(135deg, rgba(124,58,237,${0.3 + v * 0.1}), rgba(236,72,153,${0.2 + v * 0.08}))`
                : 'rgba(255,255,255,0.05)',
              border: value >= v ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: value >= v ? '#e9d5ff' : 'rgba(255,255,255,0.25)',
              boxShadow: value >= v ? '0 2px 12px rgba(124,58,237,0.35)' : 'none',
            }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28 relative">
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 px-5 pt-12 space-y-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Registro de Salud</p>
            <h1 className="text-3xl font-light" style={{ color: '#fff', letterSpacing: '-0.02em' }}>Tu Cuerpo Hoy</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.48)' }}>Escucha y anota cómo te sientes.</p>
          </div>
          <button className="p-3 rounded-2xl transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
            <FileDown size={20} />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-6 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
          <ScaleRow label="Cólicos" emoji="🌊" value={symptoms.cramps} onChange={v => setSymptoms({ ...symptoms, cramps: v })} />
          <ScaleRow label="Dolor de cabeza" emoji="✦" value={symptoms.headache} onChange={v => setSymptoms({ ...symptoms, headache: v })} />
          <ScaleRow label="Inflamación" emoji="🌙" value={symptoms.bloating} onChange={v => setSymptoms({ ...symptoms, bloating: v })} />
          <ScaleRow label="Estado de ánimo" emoji="💫" value={symptoms.mood} onChange={v => setSymptoms({ ...symptoms, mood: v })} />
        </motion.div>

        {/* Dev mode: show raw state */}
        {devMode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl dev-panel text-[11px] leading-relaxed"
            style={{ border: '1px solid rgba(57,255,20,0.25)' }}>
            <p className="mb-1" style={{ color: 'rgba(57,255,20,0.5)' }}>// HealthLog state snapshot</p>
            <p><span className="dk">symptoms</span> = {"{"}</p>
            {Object.entries(symptoms).map(([k, v]) => (
              <p key={k} className="ml-4"><span className="dk">{k}</span>: <span className="dn">{v}</span>,</p>
            ))}
            <p>{"}"}</p>
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          onClick={handleSync} disabled={syncing}
          className="w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 text-sm"
          style={{
            background: syncing
              ? 'rgba(139,92,246,0.15)'
              : synced
                ? 'linear-gradient(135deg,#059669,#10b981)'
                : 'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)',
            border: syncing ? '1px solid rgba(139,92,246,0.3)' : 'none',
            color: '#fff',
            boxShadow: !syncing && !synced ? '0 8px 32px rgba(124,58,237,0.45)' : synced ? '0 8px 24px rgba(16,185,129,0.4)' : 'none',
          }}>
          {syncing ? (
            <><div className="loader" /><span>Conectando con el Webhook...</span></>
          ) : synced ? (
            <><CheckCircle2 size={20} /><span>¡Registro sincronizado! ✨</span></>
          ) : (
            <><CloudLightning size={20} /><span>Guardar en el Universo</span></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
