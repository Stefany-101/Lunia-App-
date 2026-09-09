import { useState } from "react";
import { motion } from "motion/react";
import { useAppContext, AvatarType } from "../context/AppContext";
import { Save, Sparkles } from "lucide-react";

const AVATARS: { id: AvatarType; emoji: string; label: string; desc: string }[] = [
  { id: 'moon', emoji: '🌙', label: 'Luna', desc: 'Suave y misteriosa' },
  { id: 'star', emoji: '⭐', label: 'Estrella', desc: 'Brillante y única' },
  { id: 'nebula', emoji: '🌌', label: 'Nebulosa', desc: 'Infinita y colorida' },
  { id: 'comet', emoji: '☄️', label: 'Cometa', desc: 'Veloz y audaz' },
  { id: 'galaxy', emoji: '🌀', label: 'Galaxia', desc: 'Profunda y girante' },
];

const PALETTES = [
  { name: 'Aurora', from: '#7c3aed', to: '#ec4899' },
  { name: 'Océano', from: '#0891b2', to: '#6366f1' },
  { name: 'Amanecer', from: '#d97706', to: '#ec4899' },
  { name: 'Bosque', from: '#059669', to: '#0891b2' },
];

export function Identity() {
  const { userName, setUserName, userAvatar, setUserAvatar } = useAppContext();
  const [localName, setLocalName] = useState(userName);
  const [localAvatar, setLocalAvatar] = useState<AvatarType>(userAvatar);
  const [palette, setPalette] = useState(0);
  const [saved, setSaved] = useState(false);
  const [bio, setBio] = useState("");

  const selectedAvatar = AVATARS.find(a => a.id === localAvatar)!;
  const currentPalette = PALETTES[palette];

  const handleSave = () => {
    setUserName(localName);
    setUserAvatar(localAvatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#fff',
    outline: 'none',
    fontSize: 15,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-64 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${currentPalette.from}44 0%, transparent 70%)`, filter: 'blur(56px)', transition: 'background 0.5s' }} />

      <div className="relative z-10 px-5 pt-12 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Personalización</p>
          <h1 className="text-3xl font-light" style={{ color: '#fff', letterSpacing: '-0.02em' }}>Mi Identidad</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Define cómo te ven las estrellas</p>
        </motion.div>

        {/* Profile preview card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl text-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
          {/* Gradient stripe at top */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, ${currentPalette.from}, ${currentPalette.to})`, transition: 'background 0.5s' }} />

          <motion.div
            key={localAvatar}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl mb-3 animate-float"
            style={{
              background: `radial-gradient(circle, ${currentPalette.from}33 0%, transparent 70%)`,
              border: `2px solid ${currentPalette.from}55`,
              boxShadow: `0 0 32px ${currentPalette.from}44`,
            }}
          >
            {selectedAvatar.emoji}
          </motion.div>

          <h2 className="text-xl font-medium mb-0.5" style={{ color: '#fff' }}>
            {localName || "Tu nombre aquí"}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>{selectedAvatar.label} · {selectedAvatar.desc}</p>

          {bio && <p className="text-xs mt-3 italic" style={{ color: 'rgba(255,255,255,0.38)' }}>"{bio}"</p>}
        </motion.div>

        {/* Name input */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Tu nombre cósmico</label>
          <input
            type="text"
            placeholder="¿Cómo te llaman las estrellas?"
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            style={inputStyle}
          />
        </motion.div>

        {/* Bio */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Tu mantra (opcional)</label>
          <textarea
            placeholder="Una frase que te define..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </motion.div>

        {/* Avatar selector */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Elige tu avatar cósmico</label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map(av => (
              <button key={av.id} onClick={() => setLocalAvatar(av.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300"
                style={{
                  background: localAvatar === av.id ? `linear-gradient(135deg, ${currentPalette.from}33, ${currentPalette.to}22)` : 'rgba(255,255,255,0.05)',
                  border: localAvatar === av.id ? `1.5px solid ${currentPalette.from}66` : '1px solid rgba(255,255,255,0.09)',
                  boxShadow: localAvatar === av.id ? `0 4px 20px ${currentPalette.from}33` : 'none',
                }}>
                <span className="text-2xl">{av.emoji}</span>
                <span className="text-[9px] font-medium" style={{ color: localAvatar === av.id ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  {av.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Color palette */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <label className="text-xs font-semibold uppercase tracking-widest mb-3 block" style={{ color: 'rgba(255,255,255,0.4)' }}>Paleta de energía</label>
          <div className="flex gap-3">
            {PALETTES.map((p, i) => (
              <button key={i} onClick={() => setPalette(i)}
                className="flex-1 h-10 rounded-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                  border: palette === i ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
                  boxShadow: palette === i ? `0 0 16px ${p.from}66` : 'none',
                }}>
                {palette === i && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {p.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-500"
            style={{
              background: saved
                ? 'linear-gradient(135deg,#059669,#10b981)'
                : `linear-gradient(135deg, ${currentPalette.from}, ${currentPalette.to})`,
              color: '#fff',
              boxShadow: saved ? '0 8px 28px rgba(16,185,129,0.45)' : `0 8px 28px ${currentPalette.from}55`,
              transition: 'all 0.4s',
            }}>
            {saved ? (
              <><Sparkles size={17} />¡Identidad guardada en las estrellas!</>
            ) : (
              <><Save size={17} />Guardar mi identidad cósmica</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
