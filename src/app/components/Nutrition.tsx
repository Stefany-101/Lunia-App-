import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { ChevronDown, ChevronUp, Sparkles, Scale, Info, Search, Clock, Users, Tag } from "lucide-react";
import {
  ASSISTANT_NAME,
  ALMA_RESPONSES,
  getRecipesByCategory,
  searchRecipes,
  SEED_RECIPES,
  mapExternalRecipes,
} from "../lib/recipes";
import type { Recipe, CyclePhase, RecipeFilter } from "../types/recipe";

// Phase → CyclePhase adapter
const PROFILE_TO_PHASE: Record<string, CyclePhase> = {
  A: "menstrual",
  B: "folicular",
  C: "ovulatoria",
  D: "lutea",
};

// All recipes in memory (seed + any future external loads)
let RECIPE_STORE: Recipe[] = [...SEED_RECIPES];

/** Call this once with your Kaggle/GitHub JSON to hydrate the store */
export function loadExternalRecipes(rawData: Record<string, unknown>[]) {
  const mapped = mapExternalRecipes(rawData);
  RECIPE_STORE = [...SEED_RECIPES, ...mapped];
  console.info(`[${ASSISTANT_NAME}] Loaded ${mapped.length} external recipes. Total: ${RECIPE_STORE.length}`);
}

// ─── Sub-components ────────────────────────────────────────────────────────

function NutrientBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function RecipeCard({
  recipe, isActive, onSelect,
}: { recipe: Recipe; isActive: boolean; onSelect: () => void }) {
  const [bioOpen, setBioOpen] = useState(false);
  const [portion, setPortion] = useState(1);

  const parseAmount = (ing: string, mult: number): string => {
    return ing.replace(/(\d+(?:[.,]\d+)?)/g, (_, n) =>
      String(Math.round(parseFloat(n.replace(",", ".")) * mult * 10) / 10)
    );
  };

  if (!isActive) {
    return (
      <button onClick={onSelect}
        className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/10">
          {recipe.imageUrl
            ? <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>{recipe.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {recipe.prepTimeMin && (
              <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.38)" }}>
                <Clock size={9} />{recipe.prepTimeMin + (recipe.cookTimeMin ?? 0)} min
              </span>
            )}
            {recipe.nutrients?.calories && (
              <span className="text-[10px] flex items-center gap-1" style={{ color: "rgba(255,255,255,0.38)" }}>
                <Scale size={9} />{recipe.nutrients.calories} kcal
              </span>
            )}
          </div>
        </div>
        <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.25)" }}>

      {/* Hero */}
      {recipe.imageUrl && (
        <div className="relative h-44 overflow-hidden">
          <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(7,1,26,0.9) 0%,rgba(7,1,26,0.15) 60%,transparent 100%)" }} />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <p className="font-semibold" style={{ color: "#fff" }}>{recipe.name}</p>
            {recipe.nutrients?.calories && (
              <span className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", color: "#fff" }}>
                <Scale size={11} />{recipe.nutrients.calories} kcal
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {recipe.prepTimeMin && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              <Clock size={12} style={{ color: "#c084fc" }} />{recipe.prepTimeMin + (recipe.cookTimeMin ?? 0)} min
            </span>
          )}
          {recipe.servings && (
            <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              <Users size={12} style={{ color: "#c084fc" }} />{recipe.servings} porción{recipe.servings !== 1 ? "es" : ""}
            </span>
          )}
          <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.38)" }}>
            <Tag size={11} />fuente: {recipe.source}
          </span>
        </div>

        {/* Nutrient badges */}
        {recipe.nutrients && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.nutrients.omega3 && <NutrientBadge label="Omega-3" color="#818cf8" />}
            {recipe.nutrients.antiInflammatory && <NutrientBadge label="Anti-inflamatorio" color="#34d399" />}
            {recipe.nutrients.ironMg && <NutrientBadge label="Hierro" color="#f472b6" />}
            {recipe.nutrients.magnesiumMg && <NutrientBadge label="Magnesio" color="#a78bfa" />}
            {recipe.nutrients.proteinG && <NutrientBadge label={`${recipe.nutrients.proteinG}g proteína`} color="#60a5fa" />}
            {recipe.nutrients.fiberG && <NutrientBadge label={`${recipe.nutrients.fiberG}g fibra`} color="#4ade80" />}
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Bio explanation */}
        {recipe.description && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <button onClick={() => setBioOpen(o => !o)} className="w-full p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Info size={15} style={{ color: "#818cf8" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Explicación Biológica · {ASSISTANT_NAME}</span>
              </div>
              {bioOpen ? <ChevronUp size={15} style={{ color: "rgba(255,255,255,0.35)" }} /> : <ChevronDown size={15} style={{ color: "rgba(255,255,255,0.35)" }} />}
            </button>
            <AnimatePresence>
              {bioOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>{recipe.description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Dynamic ingredients */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium" style={{ color: "#fff" }}>Ingredientes</p>
            <div className="flex items-center rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setPortion(Math.max(1, portion - 1))} className="w-8 h-8 flex items-center justify-center text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>−</button>
              <span className="w-8 text-center text-xs font-bold" style={{ color: "#fff" }}>{portion}x</span>
              <button onClick={() => setPortion(portion + 1)} className="w-8 h-8 flex items-center justify-center text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>+</button>
            </div>
          </div>
          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-[10px] mt-0.5" style={{ color: "#c084fc" }}>✦</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {portion === 1 ? ing : parseAmount(ing, portion)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        {recipe.steps.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: "#fff" }}>Preparación</p>
            <div className="space-y-2">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff" }}>
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapse */}
        <button onClick={onSelect}
          className="w-full py-2.5 rounded-xl text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)" }}>
          Cerrar receta
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function Nutrition() {
  const { profile, devMode } = useAppContext();
  const phase = PROFILE_TO_PHASE[profile] ?? "folicular";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState(ALMA_RESPONSES.loading);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(() => {
    setIsLoading(true);
    setLoadMsg(ALMA_RESPONSES.searching);
    // Simulates async loading (replace with fetch() when using real endpoint)
    setTimeout(() => {
      const filter: RecipeFilter = { category: phase, query: query || undefined };
      const result = query
        ? searchRecipes(filter, RECIPE_STORE)
        : { recipes: getRecipesByCategory(phase, RECIPE_STORE), total: RECIPE_STORE.length, filtered: 0 };
      setRecipes(result.recipes);
      setLoadMsg(result.recipes.length ? ALMA_RESPONSES.success : ALMA_RESPONSES.noResults);
      setIsLoading(false);
      setActiveId(result.recipes[0]?.id ?? null);
    }, 800);
  }, [phase, query]);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const handleAiGenerate = () => {
    setIsGenerating(true);
    setAiResults([]);
    setTimeout(() => {
      // Return recipes from OTHER phases as "AI alternatives"
      const alts = RECIPE_STORE.filter(r => r.category !== phase).slice(0, 3);
      setAiResults(alts);
      setIsGenerating(false);
    }, 3000);
  };

  const phaseGreet = ALMA_RESPONSES.phaseGreet[phase];

  return (
    <div className="min-h-screen pb-28 relative">
      <div className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)", filter: "blur(56px)" }} />

      <div className="relative z-10 px-5 pt-12 space-y-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Nutrición Funcional · {ASSISTANT_NAME}
          </p>
          <h1 className="text-3xl font-light" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
            Cocina para tu Ciclo
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.48)" }}>{phaseGreet}</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.11)" }}>
            <Search size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadRecipes()}
              placeholder="Buscar ingrediente o receta..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#fff", caretColor: "#c084fc" }}
            />
          </div>
          <button onClick={loadRecipes}
            className="px-4 py-3 rounded-2xl text-xs font-semibold transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", color: "#fff", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
            Buscar
          </button>
        </motion.div>

        {/* Phase tag */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-widest"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", color: "#c084fc" }}>
            {phase}
          </span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {recipes.length} receta{recipes.length !== 1 ? "s" : ""} encontrada{recipes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Recipe list */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12 gap-4">
              <div className="loader" />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{loadMsg}</p>
            </motion.div>
          ) : recipes.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-6 rounded-3xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-3xl mb-3">🌙</p>
              <p className="text-sm font-medium mb-1" style={{ color: "#fff" }}>{ASSISTANT_NAME} no encontró recetas</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>{ALMA_RESPONSES.noResults}</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-2">
              {recipes.map(r => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  isActive={activeId === r.id}
                  onSelect={() => setActiveId(activeId === r.id ? null : r.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI alternatives */}
        <div>
          <button onClick={handleAiGenerate} disabled={isGenerating}
            className="w-full p-5 rounded-3xl flex flex-col items-center gap-3 transition-all"
            style={{
              background: isGenerating ? "rgba(99,102,241,0.06)" : "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.28),rgba(168,85,247,0.22))",
              border: "1px solid rgba(139,92,246,0.3)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}>
            {isGenerating ? (
              <><div className="loader" /><span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{ALMA_RESPONSES.aiLoading}</span></>
            ) : (
              <>
                <Sparkles size={22} style={{ color: "#c084fc" }} />
                <span className="font-semibold text-sm" style={{ color: "#fff" }}>¿No tienes estos ingredientes?</span>
                <span className="text-xs text-center px-4" style={{ color: "rgba(255,255,255,0.42)" }}>
                  {ASSISTANT_NAME} generará alternativas inteligentes basadas en tu alacena y fase lunar.
                </span>
              </>
            )}
          </button>

          <AnimatePresence>
            {aiResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 space-y-2">
                <p className="text-xs px-1 mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                  ✨ {ALMA_RESPONSES.aiSuccess}
                </p>
                {aiResults.map(r => (
                  <RecipeCard key={r.id} recipe={r}
                    isActive={activeId === r.id}
                    onSelect={() => setActiveId(activeId === r.id ? null : r.id)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dev panel */}
        {devMode && (
          <div className="p-4 rounded-2xl dev-panel" style={{ border: "1px solid rgba(57,255,20,0.2)" }}>
            <p style={{ color: "rgba(57,255,20,0.45)" }}>// Nutrition · {ASSISTANT_NAME} data layer</p>
            <p><span className="dk">ASSISTANT_NAME</span>: <span className="ds">"{ASSISTANT_NAME}"</span></p>
            <p><span className="dk">phase</span>: <span className="ds">"{phase}"</span></p>
            <p><span className="dk">totalInStore</span>: <span className="dn">{RECIPE_STORE.length}</span></p>
            <p><span className="dk">filteredCount</span>: <span className="dn">{recipes.length}</span></p>
            <p><span className="dk">query</span>: <span className="ds">"{query || "(none)"}"</span></p>
            <p className="mt-1" style={{ color: "rgba(57,255,20,0.35)" }}>// To load Kaggle data:</p>
            <p style={{ color: "rgba(57,255,20,0.5)" }}>// import {"{"} loadExternalRecipes {"}"} from '../lib/recipes'</p>
            <p style={{ color: "rgba(57,255,20,0.5)" }}>// loadExternalRecipes(rawKaggleJSON)</p>
          </div>
        )}

      </div>
    </div>
  );
}
