import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, Zap } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Message {
  id: string;
  role: "luna" | "user";
  text: string;
}

// ─── Sentiment analysis ────────────────────────────────────────────────────
const VERY_BAD = ["lloré", "llorando", "deprimida", "terrible", "horrible", "no aguanto", "no puedo más", "odio todo", "peor día", "quería llorar", "ganas de llorar"];
const BAD      = ["mal", "cansada", "agotada", "estrés", "estresada", "ansiosa", "ansiedad", "triste", "pelea", "discutí", "discutimos", "hartada", "difícil", "pesado", "sola", "enojada", "frustrada", "exhausta", "cansadísima", "rendirme", "no sé qué hacer"];
const GOOD     = ["bien", "genial", "feliz", "emocionada", "contenta", "chido", "chida", "padre", "cool", "bueno", "alegre", "bonito", "logré", "me fue bien", "quedé bien", "salió bien"];
const VERY_GOOD = ["increíble", "mejor día", "emocionadísima", "super bien", "fantástico", "maravilloso", "espectacular", "de maravilla", "me fue increíble", "estoy genial"];

function getSentimentScore(text: string): number {
  const t = text.toLowerCase();
  let s = 0;
  VERY_BAD.forEach(k => { if (t.includes(k)) s -= 22; });
  BAD.forEach(k => { if (t.includes(k)) s -= 9; });
  GOOD.forEach(k => { if (t.includes(k)) s += 11; });
  VERY_GOOD.forEach(k => { if (t.includes(k)) s += 22; });
  return s;
}

// ─── Topic extraction ──────────────────────────────────────────────────────
const TOPIC_MAP: Record<string, string[]> = {
  "el trabajo":    ["trabajo", "jefe", "jefa", "oficina", "laboral", "empresa", "reunión", "compañero", "compañera", "jefes"],
  "tu familia":    ["mamá", "papá", "hermano", "hermana", "familia", "padres", "abuela", "abuelo", "tíos"],
  "tu relación":   ["novio", "novia", "pareja", "ex", "relación", "galán", "chavo", "chava"],
  "tus amigos":    ["amiga", "amigo", "amigas", "amigos", "salimos", "fiesta", "salida", "amiguis"],
  "la escuela":    ["escuela", "universidad", "uni", "examen", "tarea", "clase", "maestro", "maestra", "profe", "carrera", "semestre"],
  "tu salud":      ["salud", "dolor", "cita", "médico", "médica", "síntoma", "me duele", "me siento mal físicamente"],
};

function extractTopic(msgs: string[]): string | null {
  const all = msgs.join(" ").toLowerCase();
  for (const [topic, kws] of Object.entries(TOPIC_MAP)) {
    if (kws.some(k => all.includes(k))) return topic;
  }
  return null;
}

// ─── Response bank ─────────────────────────────────────────────────────────
function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

const R = {
  greeting: [
    "Ey ey ey!! 👋✨ cuéntame todo bb, ¿cómo va tu día? Y no me digas solo el 'bien' de cortesía jajaja, quiero los detalles 👀",
  ],
  bad_1: [
    "ptmr que horrible 😭 en serio?? eso suena muy pesado, cuéntame más... ¿desde cuándo te está pasando eso?",
    "wey NO. eso no debería pasarte a ti 😤 primero que todo: ¿cómo te sientes ahorita con todo eso?",
    "ay no bb que horrible 😭 oye pero espera, ¿ha habido algo bueno hoy aunque sea pequeñito?",
    "ptmr eso suena agotador 😭 cuéntame más, ¿qué fue exactamente lo que pasó?",
  ],
  good_1: [
    "GENIALLL!! eso sí que es vibrar alto bb 💅✨ cuéntame más!! ¿qué fue lo mejor?",
    "WEY FLUYE!! me alegra tanto escuchar eso 🥹 ¿y qué más? no te cortes para nada",
    "ay wey qué bonito!! que sigan los días así siempre 💜 ¿y qué fue lo que más disfrutaste?",
    "JAJAJA ay bb me alegra muchísimo!! 🌟 cuéntame todo, quiero los detalles de lo increíble que fue",
  ],
  neutral_1: [
    "ok ok, ¿pero cómo estás de verdad verdad? jajaja el 'más o menos' a veces esconde muchas cosas 👀",
    "mmm cuéntame más bb, ¿qué fue lo más destacado del día? ¿algo que te haya alegrado o que te haya pesado?",
    "aja aja... ¿y cómo te sientes tú internamente con todo eso? ¿cómo está el ánimo?",
  ],
  bad_2: [
    "ay bb cuánto lo siento 😭 eso suena muy agotador. ¿llevas mucho tiempo cargando con todo eso?",
    "Podría ser peor. Podría ser MI problema JAKAKAKA. Pero vamoss, no te preocupes, de seguro pronto se resuelve, yo sé que sí. VOY MANIFESTANDO QUE TODO SALGA BIEN GUAPAAA 🙏✨",
    "oye eso es mucho para cargarlo sola bb 💜 ¿tienes a alguien con quien hablarlo aparte de mí?",
    "wey eso de verdad que es muy heavy 😭 pero aquí estoy yo. Oye y ¿cómo estás durmiendo con todo eso encima?",
    "no no no espera, eso NO te lo mereces bb 😤 en serio. ¿y cómo está tu cuerpo? ¿lo estás sintiendo también físicamente?",
  ],
  good_2: [
    "qué bonito bb 🥹✨ en serio mereces todos esos momentos buenos, ¡que sigan!",
    "aaay me hace tan feliz escucharte así 💜 eres una crack absoluta, ¿lo sabías?",
    "WEY QUÉ INCREÍBLE!! oye y ¿cómo te sientes tú internamente con todo eso tan bueno?",
    "ay bb me alegra muchísimo 🌟 ¿y hay algo más que quieras compartir? estoy toda oídos",
  ],
  follow_sleep: [
    "oye y aparte de eso, ¿cómo estás durmiendo últimamente? porque eso dice MUCHO del estado de energía, en serio 👀",
    "¿y cómo estás durmiendo bb? porque con todo lo que me cuentas, el sueño es superimportante 💤",
  ],
  follow_food: [
    "¿has comido bien hoy? (no me juzgues si la respuesta es 'un café y vibras positivas' JAKAKAKA 😂)",
    "oye y pregunta importante: ¿has comido hoy? porque el cuerpo también habla bb 🍽️",
  ],
  follow_support: [
    "¿y las personas a tu alrededor? ¿sientes que tienes apoyo o estás cargando mucho sola? 💜",
    "oye y ¿tienes a alguien con quien hablar de esto? ¿o sientes que lo cargas sola? 🥺",
  ],
  manifest: [
    "oye escucharte me hace querer darte un abrazo virtual fuertísimo 🤗 en serio llevas mucho bb... pero sé que puedes con todo, lo sé.",
    "bb, no te mereces nada de eso 😭 pero algo que sé con certeza: eres más fuerte de lo que crees. VOY MANIFESTANDO QUE TODO SE RESUELVA 🙏✨",
    "uy wey, eso sí que es mucho para una sola persona 😭 oye, ¿y qué haces tú para desconectarte cuando todo se siente pesado?",
  ],
  good_deep: [
    "ay bb que hermoso 🥹 en serio me llena de alegría escuchar eso. ¿Y hay algo más que te haya hecho sentir así hoy?",
    "qué bonito que tengas esos momentos 💜 oye y ¿cómo te sientes al final del día pensando en todo eso?",
  ],
  transition: [
    "Phew bb, qué conversación tan bonita tuvimos hoy 🥹✨ Oye, creo que ya puedo detectar tu nivel de energía...",
    "ay bb qué bueno haber hablado contigo 🥹 Ya tengo suficiente para calcular tu energía cósmica del día...",
    "jajaja qué conversación tan rica 🥹 oye ya con todo lo que me contaste creo que puedo ver tu energía...",
  ],
};

// ─── Response engine ───────────────────────────────────────────────────────
interface EngineResult {
  text: string;
  energyDelta: number;
  showWrap?: boolean;
  followUpKey?: "sleep" | "food" | "support";
}

function lunaRespond(
  userMsg: string,
  count: number,
  energy: number,
  allMsgs: string[],
  asked: { sleep: boolean; food: boolean; support: boolean }
): EngineResult {
  const score = getSentimentScore(userMsg);
  const showWrap = count >= 4;

  if (count === 1) {
    if (score <= -10) return { text: pick(R.bad_1), energyDelta: score };
    if (score >= 10)  return { text: pick(R.good_1), energyDelta: score };
    return { text: pick(R.neutral_1), energyDelta: 0 };
  }

  if (count === 2) {
    const topic = extractTopic(allMsgs);
    if (score <= -5) {
      let t = pick(R.bad_2);
      if (topic) t = t.replace("eso", `lo de ${topic}`);
      return { text: t, energyDelta: score };
    }
    if (score >= 5) return { text: pick(R.good_2), energyDelta: score };
    if (!asked.sleep) return { text: pick(R.follow_sleep), energyDelta: 0, followUpKey: "sleep" };
    return { text: pick(R.neutral_1), energyDelta: 0 };
  }

  if (count === 3) {
    if (!asked.food) return { text: pick(R.follow_food), energyDelta: score, followUpKey: "food" };
    if (!asked.support) return { text: pick(R.follow_support), energyDelta: score, followUpKey: "support" };
    if (score <= -5) return { text: pick(R.manifest), energyDelta: score };
    return { text: pick(R.good_deep), energyDelta: score };
  }

  if (count === 4) {
    return { text: pick(R.transition), energyDelta: score, showWrap: true };
  }

  // 5+: keep going, show wrap button
  if (score <= -5) return { text: pick(R.bad_2), energyDelta: score, showWrap };
  if (score >= 5)  return { text: pick(R.good_2), energyDelta: score, showWrap };
  return { text: pick(R.follow_support), energyDelta: score, showWrap };
}

// ─── Final message builder ─────────────────────────────────────────────────
function buildResult(energy: number, allMsgs: string[], userName: string) {
  const topic = extractTopic(allMsgs);
  const name = userName || "bb";
  const capped = Math.max(10, Math.min(95, energy));

  const topicBad  = topic ? `Aww, espero que lo de ${topic} se resuelva pronto, no te mereces todo eso 😭💜` : `Oye, llevas mucho encima bb. Pero no estás sola, ¿ok? Aquí estoy yo siempre 💜`;
  const topicGood = topic ? `Geniallll!! me encanta que hayas tenido un día tan increíble en ${topic} bro! 🌟` : `Geniallll!! me encanta que hayas tenido un día tan increíble bro! 🌟`;
  const topicMid  = topic ? `Los días así también cuentan. Espero que lo de ${topic} mejore pronto 💜` : `Los días 'normales' también cuentan bb. ¡Vas bien! 💫`;

  if (capped >= 68) {
    return { emoji: "⭐", level: "Alta · En modo galaxia", color: "#fde68a", glow: "rgba(253,230,138,0.6)", closing: `${topicGood}\n\nQue sigan muchos días así, mereces todo lo bueno del universo ✨💜` };
  }
  if (capped >= 42) {
    return { emoji: "🌙", level: "Media · Navegando las olas", color: "#c084fc", glow: "rgba(192,132,252,0.5)", closing: `${topicMid}\n\nCuídate mucho hoy, ¿sí? 🌙` };
  }
  return { emoji: "🌑", level: "Baja · Recargando baterías", color: "#f472b6", glow: "rgba(244,114,182,0.5)", closing: `${topicBad}\n\nDescansa hoy, te lo mereces. Mañana es otro día 🌑💜` };
}

// ─── Animated counter ──────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

// ─── Component ─────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onEnergyDetected: (energy: number) => void;
}

export function LunaChatModal({ onClose, onEnergyDetected }: Props) {
  const { userName } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [energyScore, setEnergyScore] = useState(50);
  const [showWrap, setShowWrap] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof buildResult> | null>(null);
  const [finalEnergy, setFinalEnergy] = useState(50);
  const [asked, setAsked] = useState({ sleep: false, food: false, support: false });
  const allUserMsgs = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useCounter(showResult ? finalEnergy : 0, 1600);

  // Greeting on mount
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 400);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages([{ id: "0", role: "luna", text: R.greeting[0] }]);
      inputRef.current?.focus();
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 80);
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    const id = Date.now().toString();
    setMessages(prev => [...prev, { id, role: "user", text: userMsg }]);
    allUserMsgs.current.push(userMsg);
    const newCount = exchangeCount + 1;
    setExchangeCount(newCount);

    setIsTyping(true);
    const delay = 1000 + Math.random() * 900;
    setTimeout(() => {
      const res = lunaRespond(userMsg, newCount, energyScore, allUserMsgs.current, asked);
      setEnergyScore(prev => Math.max(5, Math.min(95, prev + res.energyDelta)));
      if (res.showWrap) setShowWrap(true);
      if (res.followUpKey) setAsked(prev => ({ ...prev, [res.followUpKey!]: true }));
      if (res.text.toLowerCase().includes("durmiendo")) setAsked(prev => ({ ...prev, sleep: true }));
      if (res.text.toLowerCase().includes("comido")) setAsked(prev => ({ ...prev, food: true }));
      if (res.text.toLowerCase().includes("apoyo") || res.text.toLowerCase().includes("sola")) setAsked(prev => ({ ...prev, support: true }));
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "luna", text: res.text }]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, delay);
  };

  const handleWrapUp = () => {
    const fe = Math.max(10, Math.min(95, energyScore));
    setFinalEnergy(fe);
    setResult(buildResult(fe, allUserMsgs.current, userName));
    setShowResult(true);
  };

  const handleSave = () => {
    onEnergyDetected(finalEnergy);
    onClose();
  };

  const bubbleStyle = (role: "luna" | "user"): React.CSSProperties =>
    role === "luna"
      ? { background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: "18px 18px 18px 4px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }
      : { background: "linear-gradient(135deg,rgba(124,58,237,0.55),rgba(236,72,153,0.45))", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px 18px 4px 18px" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "rgba(6,1,15,0.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
    >
      {/* Nebula glows */}
      <div className="absolute top-0 left-0 w-72 h-72 pointer-events-none" style={{ background: "radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)", filter: "blur(56px)" }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle,rgba(236,72,153,0.18) 0%,transparent 70%)", filter: "blur(50px)" }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl animate-float"
            style={{ background: "radial-gradient(circle,rgba(253,230,138,0.9) 0%,rgba(253,186,116,0.4) 70%)", boxShadow: "0 0 20px rgba(253,230,138,0.5)" }}>
            🌙
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#fff" }}>LUNA</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {isTyping ? "escribiendo..." : "tu amiga cósmica ✨"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full transition-all"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar relative z-10">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
              {msg.role === "luna" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mb-1"
                  style={{ background: "rgba(253,230,138,0.15)", border: "1px solid rgba(253,230,138,0.25)" }}>🌙</div>
              )}
              <div style={{ ...bubbleStyle(msg.role), maxWidth: "78%", padding: "10px 14px" }}>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: msg.role === "luna" ? "rgba(255,255,255,0.88)" : "#fff" }}>
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: "rgba(253,230,138,0.15)", border: "1px solid rgba(253,230,138,0.25)" }}>🌙</div>
              <div className="px-4 py-3 rounded-[18px_18px_18px_4px] flex gap-1.5 items-center"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#c084fc" }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wrap-up button */}
        {showWrap && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center py-2">
            <button onClick={handleWrapUp}
              className="px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(236,72,153,0.35))", border: "1px solid rgba(139,92,246,0.4)", color: "#e9d5ff" }}>
              <Zap size={13} />
              Detectar mi energía de hoy 🔮
            </button>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Cuéntame todo bb... 💜"
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", caretColor: "#c084fc" }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all"
            style={{
              background: input.trim() && !isTyping ? "linear-gradient(135deg,#7c3aed,#ec4899)" : "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: input.trim() && !isTyping ? "#fff" : "rgba(255,255,255,0.25)",
              boxShadow: input.trim() && !isTyping ? "0 4px 16px rgba(124,58,237,0.45)" : "none",
            }}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* ─── Result overlay ─── */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 26, stiffness: 200 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6"
            style={{ background: "rgba(6,1,15,0.97)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}>

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${result.glow} 0%, transparent 70%)`, opacity: 0.6 }} />

            <div className="relative z-10 flex flex-col items-center text-center space-y-5 w-full max-w-sm">
              {/* Energy orb */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 16 }}
                className="relative w-36 h-36 flex items-center justify-center">
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: result.color + "33" }} />
                <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: result.color + "22", animationDelay: "0.8s" }} />
                {/* Orb */}
                <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center relative"
                  style={{ background: `radial-gradient(circle,${result.color}55 0%,${result.color}22 60%,transparent 100%)`, border: `2px solid ${result.color}66`, boxShadow: `0 0 40px ${result.glow}, 0 0 80px ${result.glow}` }}>
                  <span className="text-3xl">{result.emoji}</span>
                  <span className="text-2xl font-bold mt-1" style={{ color: result.color }}>{counter}%</span>
                </div>
              </motion.div>

              {/* Level label */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Tu energía detectada</p>
                <p className="text-lg font-semibold" style={{ color: result.color }}>{result.level}</p>
              </motion.div>

              {/* Closing message */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                className="p-5 rounded-3xl w-full text-left"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>🌙 LUNA dice...</p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.82)" }}>
                  Phew! pero qué buena conversación hemos tenido {userName || "bb"} 🥹{"\n\n"}{result.closing}
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
                className="w-full space-y-2">
                <button onClick={handleSave}
                  className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)", color: "#fff", boxShadow: "0 8px 28px rgba(124,58,237,0.5)" }}>
                  <Sparkles size={16} />
                  Guardar mi energía cósmica
                </button>
                <button onClick={() => setShowResult(false)}
                  className="w-full py-3 rounded-2xl text-sm font-medium"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
                  Volver al chat
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
