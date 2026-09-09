import type {
  Recipe,
  CyclePhase,
  RecipeFilter,
  RecipeSearchResult,
  RecipeNutrients,
  ExternalRecipeNLG,
  ExternalRecipeFoodCom,
} from "../types/recipe";

// ─── Alma: assistant soul ──────────────────────────────────────────────────
export const ASSISTANT_NAME = "Alma" as const;

export const ALMA_RESPONSES = {
  loading:   "Buscando recetas deliciosas para ti...",
  searching: "Explorando el universo culinario de tu fase... ✨",
  success:   "¡Mamma mía! He encontrado este clásico para ti",
  noResults: "Hmm, no encontré recetas para eso, ¡pero podemos improvisar! 🌙",
  aiLoading: "Alma está pensando en alternativas mágicas para ti...",
  aiSuccess: "¡Aquí van mis sugerencias, espero que se te antoje alguna! 💜",
  error:     "Algo salió mal en la cocina cósmica, intenta de nuevo 🌑",
  phaseGreet: {
    folicular:  "Tu cuerpo está recargando energía. ¡Estas recetas te van a encantar! 🌒",
    ovulatoria: "¡Estás en tu pico! Estas recetas potencian tu brillo natural 🌕",
    lutea:      "Tu cuerpo pide calma y nutrición. Aquí van recetas para abrazarte por dentro 🌖",
    menstrual:  "Mereces lo más reconfortante. Estas recetas fueron hechas con amor para ti 🌑",
  },
} as const;

// ─── Phase keyword map (for category inference) ────────────────────────────
const PHASE_KEYWORDS: Record<CyclePhase, string[]> = {
  menstrual:  ["hierro", "iron", "anti-inflammatory", "antiinflamatorio", "menstrual", "cólico", "magnesio", "magnesium", "cramps", "omega-3", "omega3", "salmón", "espinaca", "tomate", "remolacha", "jengibre", "ginger", "chocolate negro", "dark chocolate"],
  folicular:  ["proteína", "protein", "folicular", "follicular", "energía", "energy", "zinc", "brócoli", "huevo", "egg", "pollo", "chicken", "legumbre", "lentejas", "lentils", "quinoa", "semillas", "seeds"],
  ovulatoria: ["omega", "antioxidante", "antioxidant", "ovulación", "ovulatory", "colágeno", "collagen", "fibra", "fiber", "vitamina c", "vitamin c", "aguacate", "avocado", "berries", "frutos rojos", "almendra", "almond", "nuez", "walnut"],
  lutea:      ["magnesio", "magnesium", "progesterona", "progesterone", "lútea", "luteal", "calabaza", "pumpkin", "batata", "camote", "sweet potato", "avena", "oats", "plátano", "banana", "nuez", "cúrcuma", "turmeric", "canela", "cinnamon"],
};

function inferCategory(text: string): CyclePhase {
  const lower = text.toLowerCase();
  const scores: Record<CyclePhase, number> = {
    menstrual: 0, folicular: 0, ovulatoria: 0, lutea: 0,
  };
  for (const [phase, keywords] of Object.entries(PHASE_KEYWORDS) as [CyclePhase, string[]][]) {
    keywords.forEach(kw => { if (lower.includes(kw)) scores[phase]++; });
  }
  const best = (Object.entries(scores) as [CyclePhase, number][]).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : "folicular"; // default fallback
}

// ─── Core filter / search ──────────────────────────────────────────────────

/**
 * Filter recipes by cycle phase.
 * O(n) — safe for thousands of entries loaded into memory.
 */
export function getRecipesByCategory(
  category: CyclePhase | string,
  allRecipes: Recipe[]
): Recipe[] {
  return allRecipes.filter(r => r.category === category);
}

/**
 * Full-text + category + tag search with optional time cap.
 * Returns ranked results (most matching fields first).
 */
export function searchRecipes(
  filter: RecipeFilter,
  allRecipes: Recipe[]
): RecipeSearchResult {
  let pool = allRecipes;

  if (filter.category) {
    pool = pool.filter(r => r.category === filter.category);
  }

  if (filter.maxPrepTime !== undefined) {
    pool = pool.filter(r => (r.prepTimeMin ?? 0) <= filter.maxPrepTime!);
  }

  if (filter.tags && filter.tags.length > 0) {
    pool = pool.filter(r =>
      filter.tags!.some(t => r.tags?.map(x => x.toLowerCase()).includes(t.toLowerCase()))
    );
  }

  let results = pool;
  if (filter.query && filter.query.trim()) {
    const q = filter.query.trim().toLowerCase();
    results = pool
      .map(r => {
        let score = 0;
        if (r.name.toLowerCase().includes(q)) score += 3;
        if (r.description?.toLowerCase().includes(q)) score += 2;
        if (r.tags?.some(t => t.toLowerCase().includes(q))) score += 2;
        if (r.ingredients.some(i => i.toLowerCase().includes(q))) score += 1;
        return { recipe: r, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.recipe);
  }

  return {
    recipes: results,
    total: allRecipes.length,
    filtered: results.length,
  };
}

// ─── Normalise helper utilities ────────────────────────────────────────────

function toStringArray(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
  // Try JSON parse first (Food.com stores lists as stringified arrays)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
  } catch { /* not JSON, treat as plain text */ }
  // Split on common separators
  return raw.split(/\n|;|\|/).map(s => s.trim()).filter(Boolean);
}

function toNumber(raw: number | string | undefined): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const n = Number(raw);
  return isNaN(n) ? undefined : n;
}

function generateId(name: string, index: number): string {
  return `recipe-${index}-${name.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`;
}

// ─── External → Recipe mapper: RecipeNLG / generic Kaggle ─────────────────

export function mapNLGRecipe(raw: ExternalRecipeNLG, index = 0): Recipe {
  const name =
    raw.title ?? raw.name ?? raw.recipe_name ?? `Receta ${index + 1}`;

  const ingredients =
    toStringArray(raw.ingredients ?? raw.ingredient_list ?? raw.NER);

  const steps =
    toStringArray(raw.directions ?? raw.instructions ?? raw.steps ?? raw.instruction_steps);

  const source =
    raw.source ?? raw.link ?? raw.source_url ?? raw.url ?? ASSISTANT_NAME;

  const tagsRaw = toStringArray(raw.tags);
  const searchBase = [name, ...tagsRaw, ...ingredients].join(" ");
  const category: CyclePhase =
    (raw.category && isValidPhase(raw.category))
      ? raw.category as CyclePhase
      : inferCategory(searchBase);

  const nutrients: RecipeNutrients = {};
  if (raw.calories) nutrients.calories = toNumber(raw.calories);
  if (raw.nutrition) {
    const n = raw.nutrition as Record<string, number | string>;
    if (n.calories) nutrients.calories = toNumber(n.calories as number);
    if (n.protein)  nutrients.proteinG = toNumber(n.protein as number);
    if (n.carbs)    nutrients.carbsG   = toNumber(n.carbs as number);
    if (n.fat)      nutrients.fatG     = toNumber(n.fat as number);
    if (n.fiber)    nutrients.fiberG   = toNumber(n.fiber as number);
  }

  return {
    id: generateId(name, index),
    name,
    category,
    ingredients,
    steps,
    source,
    prepTimeMin: toNumber(raw.prep_time),
    cookTimeMin: toNumber(raw.cook_time),
    servings: toNumber(raw.servings),
    imageUrl: raw.image ?? raw.image_url,
    tags: tagsRaw.length > 0 ? tagsRaw : undefined,
    nutrients: Object.keys(nutrients).length > 0 ? nutrients : undefined,
  };
}

// ─── External → Recipe mapper: Food.com stringified format ────────────────

export function mapFoodComRecipe(raw: ExternalRecipeFoodCom, index = 0): Recipe {
  const name = raw.name ?? `Receta ${index + 1}`;

  const ingredients = toStringArray(raw.ingredients);
  const steps = toStringArray(raw.steps);
  const tags = toStringArray(raw.tags);

  const searchBase = [name, ...tags, ...ingredients].join(" ");
  const category = inferCategory(searchBase);

  let nutrients: RecipeNutrients | undefined;
  if (raw.nutrition) {
    try {
      const n = JSON.parse(raw.nutrition);
      nutrients = {
        calories:  toNumber(n[0]),
        fatG:      toNumber(n[1]),
        carbsG:    toNumber(n[5]),
        proteinG:  toNumber(n[4]),
        fiberG:    toNumber(n[6]),
      };
    } catch { /* ignore malformed nutrition */ }
  }

  return {
    id: generateId(name, index),
    name,
    category,
    ingredients,
    steps,
    source: "food.com",
    description: raw.description,
    prepTimeMin: raw.minutes,
    tags: tags.length > 0 ? tags : undefined,
    nutrients,
  };
}

// ─── Bulk mapper (auto-detects format) ────────────────────────────────────

type RawRecipe = ExternalRecipeNLG | ExternalRecipeFoodCom | Record<string, unknown>;

function isFoodComFormat(raw: RawRecipe): raw is ExternalRecipeFoodCom {
  return typeof (raw as ExternalRecipeFoodCom).steps === "string" &&
         typeof (raw as ExternalRecipeFoodCom).ingredients === "string" &&
         "name" in raw;
}

/**
 * Main entry point: takes any raw JSON array (from Kaggle/GitHub)
 * and returns a typed Recipe[]. Auto-detects the source format.
 *
 * Usage:
 *   import rawData from "./my-kaggle-export.json";
 *   const recipes = mapExternalRecipes(rawData);
 */
export function mapExternalRecipes(rawArray: RawRecipe[]): Recipe[] {
  return rawArray
    .map((raw, i) => {
      try {
        if (isFoodComFormat(raw)) return mapFoodComRecipe(raw, i);
        return mapNLGRecipe(raw as ExternalRecipeNLG, i);
      } catch {
        console.warn(`[${ASSISTANT_NAME}] Skipped recipe at index ${i}: mapping failed`);
        return null;
      }
    })
    .filter((r): r is Recipe => r !== null);
}

// ─── Guard ─────────────────────────────────────────────────────────────────

function isValidPhase(val: string): val is CyclePhase {
  return ["folicular", "ovulatoria", "lutea", "menstrual"].includes(val);
}

// ─── Seed data: built-in recipes ──────────────────────────────────────────

export const SEED_RECIPES: Recipe[] = [
  {
    id: "seed-001",
    name: "Bowl Anti-inflamatorio de Salmón",
    category: "menstrual",
    description: "Rico en Omega-3 para reducir cólicos y la inflamación sistémica.",
    prepTimeMin: 15,
    cookTimeMin: 10,
    servings: 1,
    source: ASSISTANT_NAME,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    tags: ["omega-3", "antiinflamatorio", "hierro", "sin gluten"],
    ingredients: ["150g salmón fresco", "60g quinoa tricolor", "50g aguacate", "40g espinaca baby", "1 cdta aceite de oliva", "limón al gusto"],
    steps: ["Cocina la quinoa en agua con sal por 15 min.", "Sella el salmón en sartén con aceite 3-4 min por lado.", "Monta el bowl: quinoa, salmón, aguacate y espinaca.", "Aliña con aceite de oliva y limón."],
    nutrients: { calories: 450, proteinG: 38, omega3: true, antiInflammatory: true, fiberG: 7 },
  },
  {
    id: "seed-002",
    name: "Smoothie Energizante Folicular",
    category: "folicular",
    description: "Proteínas y zinc para la regeneración celular en tu fase de máxima recarga.",
    prepTimeMin: 5,
    servings: 1,
    source: ASSISTANT_NAME,
    imageUrl: "https://images.unsplash.com/photo-1638176066959-c228e5d8cf5c?w=800&q=80",
    tags: ["proteína", "zinc", "energía", "vegano"],
    ingredients: ["1 plátano congelado", "200ml leche de almendra", "2 cdas mantequilla de almendra", "1 cda semillas de calabaza", "1/2 cdta maca en polvo", "hielo"],
    steps: ["Agrega todos los ingredientes a la licuadora.", "Licúa a velocidad alta por 60 segundos.", "Sirve inmediatamente.", "Opcional: decora con semillas extra."],
    nutrients: { calories: 320, proteinG: 12, carbsG: 38, fiberG: 5 },
  },
  {
    id: "seed-003",
    name: "Tortilla Española con Cúrcuma",
    category: "lutea",
    description: "Magnesio y cúrcuma para calmar el síndrome premenstrual y estabilizar el ánimo.",
    prepTimeMin: 10,
    cookTimeMin: 20,
    servings: 2,
    source: ASSISTANT_NAME,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    tags: ["magnesio", "cúrcuma", "antiinflamatorio", "vegetariano"],
    ingredients: ["4 huevos", "2 papas medianas", "1/2 cebolla", "1 cdta cúrcuma", "aceite de oliva", "sal y pimienta"],
    steps: ["Pela y rebana las papas finamente.", "Sofríe papas y cebolla en aceite a fuego medio 15 min.", "Bate los huevos con cúrcuma, sal y pimienta.", "Mezcla con las papas y cuaja en sartén 5 min por lado."],
    nutrients: { calories: 380, proteinG: 18, magnesiumMg: 45, antiInflammatory: true },
  },
  {
    id: "seed-004",
    name: "Buddha Bowl Ovulatorio",
    category: "ovulatoria",
    description: "Antioxidantes y fibra para acompañar tu pico de energía y vitalidad.",
    prepTimeMin: 20,
    servings: 1,
    source: ASSISTANT_NAME,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    tags: ["antioxidante", "fibra", "vitamina-c", "vegano"],
    ingredients: ["80g arroz integral", "100g garbanzos asados", "50g frutos rojos", "30g nueces", "1/2 aguacate", "vinagreta de limón y jengibre"],
    steps: ["Cocina el arroz integral según instrucciones.", "Asa los garbanzos con aceite y especias 20 min a 200°C.", "Monta el bowl con todos los ingredientes.", "Rocía con vinagreta y sirve fresco."],
    nutrients: { calories: 520, proteinG: 16, carbsG: 68, fiberG: 14, antiInflammatory: true },
  },
];
