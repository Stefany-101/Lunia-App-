// ─── Cycle phases ──────────────────────────────────────────────────────────
export type CyclePhase = "folicular" | "ovulatoria" | "lutea" | "menstrual";

// ─── Core Recipe interface ─────────────────────────────────────────────────
export interface Recipe {
  id: string;
  name: string;
  category: CyclePhase;
  ingredients: string[];
  steps: string[];
  source: string;

  // Optional enrichment fields
  description?: string;
  prepTimeMin?: number;
  cookTimeMin?: number;
  servings?: number;
  imageUrl?: string;
  tags?: string[];
  nutrients?: RecipeNutrients;
}

export interface RecipeNutrients {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  ironMg?: number;
  magnesiumMg?: number;
  omega3?: boolean;
  antiInflammatory?: boolean;
}

// ─── Search / filter options ───────────────────────────────────────────────
export interface RecipeFilter {
  category?: CyclePhase;
  query?: string;          // free-text search against name + tags
  maxPrepTime?: number;    // minutes
  tags?: string[];
}

export interface RecipeSearchResult {
  recipes: Recipe[];
  total: number;
  filtered: number;
}

// ─── External data formats (Kaggle / GitHub sources) ──────────────────────

/** RecipeNLG / generic Kaggle format */
export interface ExternalRecipeNLG {
  title?: string;
  name?: string;
  recipe_name?: string;
  ingredients?: string | string[];
  ingredient_list?: string | string[];
  NER?: string[];
  directions?: string | string[];
  instructions?: string | string[];
  steps?: string | string[];
  instruction_steps?: string | string[];
  link?: string;
  source?: string;
  source_url?: string;
  url?: string;
  category?: string;
  tags?: string | string[];
  calories?: number;
  nutrition?: Record<string, number | string>;
  prep_time?: number | string;
  cook_time?: number | string;
  servings?: number | string;
  image?: string;
  image_url?: string;
}

/** Food.com / Epicurious stringified format */
export interface ExternalRecipeFoodCom {
  name: string;
  ingredients: string;       // serialized list
  steps: string;             // serialized list
  tags?: string;             // serialized list
  nutrition?: string;        // serialized dict
  minutes?: number;
  contributor_id?: number;
  submitted?: string;
  description?: string;
  n_steps?: number;
  n_ingredients?: number;
}
