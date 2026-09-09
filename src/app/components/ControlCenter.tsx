import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { Moon, Sun, ShieldAlert, Crown, Code2, User, Zap } from "lucide-react";

export function ControlCenter() {
  const { zenMode, toggleZenMode, devMode, toggleDevMode, isPremium, setPremium, profile, setProfile, stressLevel, cycleDay, userName, userAvatar } = useAppContext();
  const [showPremiumError, setShowPremiumError] = useState(false);

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  };

  const Toggle = ({ active, onToggle, colorOn = 'linear-gradient(135deg,#7c3aed,#ec4899)' }: { active: boolean; onToggle: () => void; colorOn?: string }) => (
    <button onClick={onToggle}
      className="w-12 h-6 rounded-full p-0.5 transition-all duration-300 relative flex items-center"
      style={{ background: active ? colorOn : 'rgba(255,255,255,0.1)', boxShadow: active ? '0 0 12px rgba(124,58,237,0.5)' : 'none' }}>
      <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ marginLeft: active ? '50%' : '0', transform: active ? 'translateX(-2px)' : 'translateX(0)' }} />
    </button>
  );

  return (
    <div className="min-h-screen pb-28 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="relative z-10 px-5 pt-12 space-y-4">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Configuración</p>
          <h1 className="text-3xl font-light" style={{ color: '#fff', letterSpacing: '-0.02em' }}>Centro de Control</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Ajustes y personalización de LUNA</p>
        </motion.div>

        {/* Zen Mode */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-3xl" style={glassCard}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl" style={{ background: zenMode ? 'rgba(251,191,36,0.15)' : 'rgba(244,114,182,0.15)', border: `1px solid ${zenMode ? 'rgba(251,191,36,0.3)' : 'rgba(244,114,182,0.3)'}` }}>
                {zenMode ? <Moon size={20} style={{ color: '#fbbf24' }} /> : <Sun size={20} style={{ color: '#f472b6' }} />}
              </div>
              <div>
                <h3 className="font-medium text-sm" style={{ color: '#fff' }}>Modo Zen</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Reduce saturación y pausa animaciones</p>
              </div>
            </div>
            <Toggle active={zenMode} onToggle={toggleZenMode} colorOn="linear-gradient(135deg,#78350f,#fbbf24)" />
          </div>
        </motion.section>

        {/* Dev Mode */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-3xl overflow-hidden" style={glassCard}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl" style={{ background: devMode ? 'rgba(57,255,20,0.1)' : 'rgba(99,102,241,0.15)', border: `1px solid ${devMode ? 'rgba(57,255,20,0.3)' : 'rgba(99,102,241,0.3)'}` }}>
                  <Code2 size={20} style={{ color: devMode ? '#39ff14' : '#818cf8' }} />
                </div>
                <div>
                  <h3 className="font-medium text-sm" style={{ color: '#fff' }}>Modo Desarrollador</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Hackea tu propio bienestar</p>
                </div>
              </div>
              <Toggle active={devMode} onToggle={toggleDevMode} colorOn="linear-gradient(135deg,#064e3b,#39ff14)" />
            </div>
          </div>

          {/* Dev panel inline */}
          <AnimatePresence>
            {devMode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="px-5 pb-5">
                  <div className="p-4 rounded-2xl dev-panel" style={{ border: '1px solid rgba(57,255,20,0.22)' }}>
                    <p className="mb-2" style={{ color: 'rgba(57,255,20,0.4)' }}>// LUNA app state — live</p>
                    <p><span className="dk">user</span> = {"{"}</p>
                    <p className="ml-4"><span className="dk">name</span>: <span className="ds">"{userName || 'anon'}"</span>,</p>
                    <p className="ml-4"><span className="dk">avatar</span>: <span className="ds">"{userAvatar}"</span>,</p>
                    <p className="ml-4"><span className="dk">premium</span>: <span className="db">{String(isPremium)}</span>,</p>
                    <p>{"}"}</p>
                    <p className="mt-1"><span className="dk">cycle</span> = {"{"}</p>
                    <p className="ml-4"><span className="dk">profile</span>: <span className="ds">"{profile}"</span>,</p>
                    <p className="ml-4"><span className="dk">day</span>: <span className="dn">{cycleDay}</span>,</p>
                    <p className="ml-4"><span className="dk">stressLevel</span>: <span className="dn">{stressLevel}</span>,</p>
                    <p>{"}"}</p>
                    <p className="mt-1"><span className="dk">ui</span> = {"{"}</p>
                    <p className="ml-4"><span className="dk">zenMode</span>: <span className="db">{String(zenMode)}</span>,</p>
                    <p className="ml-4"><span className="dk">devMode</span>: <span className="db">{String(devMode)}</span>,</p>
                    <p>{"}"}</p>
                    <p className="mt-2" style={{ color: 'rgba(57,255,20,0.35)' }}>// build: LUNA v1.0.0 · cosmic branch</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Phase Simulator */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-3xl" style={glassCard}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}>
              <Zap size={20} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h3 className="font-medium text-sm" style={{ color: '#fff' }}>Simulador de Fase Biológica</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Cambia la fase para ver la UI adaptarse</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['A','B','C','D'] as const).map(p => {
              const labels = { A: '🌑 Men.', B: '🌒 Fol.', C: '🌕 Ovu.', D: '🌖 Lút.' };
              return (
                <button key={p} onClick={() => setProfile(p)}
                  className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-300"
                  style={{
                    background: profile === p ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'rgba(255,255,255,0.06)',
                    border: profile === p ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: profile === p ? '#fff' : 'rgba(255,255,255,0.42)',
                    boxShadow: profile === p ? '0 4px 16px rgba(124,58,237,0.45)' : 'none',
                  }}>
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Profile link */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-3xl" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.3)' }}>
              <User size={20} style={{ color: '#f472b6' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm" style={{ color: '#fff' }}>Mi Identidad</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{userName || 'Configura tu nombre y avatar'}</p>
            </div>
            <div className="text-2xl">{userAvatar === 'moon' ? '🌙' : userAvatar === 'star' ? '⭐' : userAvatar === 'nebula' ? '🌌' : userAvatar === 'comet' ? '☄️' : '🌀'}</div>
          </div>
        </motion.section>

        {/* Premium */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 rounded-3xl" style={glassCard}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                <Crown size={20} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <h3 className="font-medium text-sm" style={{ color: '#fff' }}>Licencia Premium</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {isPremium ? "Acceso completo al universo LUNA ✨" : "Desbloquea todas las funciones"}
                </p>
              </div>
            </div>
            <Toggle active={isPremium} onToggle={() => setPremium(!isPremium)} colorOn="linear-gradient(135deg,#92400e,#fbbf24)" />
          </div>

          <button onClick={() => { if (!isPremium) setShowPremiumError(true); else setPremium(false); }}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: isPremium
                ? 'rgba(255,255,255,0.07)'
                : 'linear-gradient(135deg,#d97706,#fbbf24)',
              border: isPremium ? '1px solid rgba(255,255,255,0.1)' : 'none',
              color: isPremium ? 'rgba(255,255,255,0.5)' : '#fff',
              boxShadow: !isPremium ? '0 6px 20px rgba(217,119,6,0.4)' : 'none',
            }}>
            {isPremium ? 'Gestionar suscripción' : '✨ Actualizar a Premium'}
          </button>
        </motion.section>
      </div>

      {/* Access Denied Modal */}
      <AnimatePresence>
        {showPremiumError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            onClick={() => setShowPremiumError(false)}>
            <motion.div initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 16 }}
              className="w-full max-w-sm p-8 rounded-3xl text-center"
              style={{ background: 'rgba(15,4,34,0.95)', border: '1px solid rgba(244,114,182,0.3)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.3)' }}>
                <ShieldAlert size={30} style={{ color: '#f472b6' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#fff' }}>Acceso Denegado</h2>
              <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.52)' }}>Esta función es exclusiva para usuarias con Licencia Premium activa.</p>
              <button onClick={() => setShowPremiumError(false)}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
