import { NutritionInfo, FoodCategory } from '@/server/database/collections/foods/types';

// Required nutrition fields that must be present
export const REQUIRED_NUTRITION_FIELDS = [
  'calories',
  'protein', 
  'carbs',
  'fat',
  'fiber'
] as const;

// All possible nutrition fields including optional ones
export const ALL_NUTRITION_FIELDS = [
  'calories',
  'protein',
  'carbs', 
  'fat',
  'fiber',
  'sugar',
  'sodium',
  'cholesterol',
  'saturatedFat',
  'transFat'
] as const;

// Valid food categories for dropdown
export const VALID_FOOD_CATEGORIES: FoodCategory[] = [
  'fruits',
  'vegetables',
  'grains',
  'proteins',
  'dairy',
  'nuts_seeds',
  'oils_fats',
  'beverages',
  'sweets',
  'condiments',
  'other'
];

// Human-readable labels for food categories
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  fruits: 'Fruits',
  vegetables: 'Vegetables', 
  grains: 'Grains & Cereals',
  proteins: 'Proteins & Meat',
  dairy: 'Dairy & Eggs',
  nuts_seeds: 'Nuts & Seeds',
  oils_fats: 'Oils & Fats',
  beverages: 'Beverages',
  sweets: 'Sweets & Desserts',
  condiments: 'Condiments & Sauces',
  other: 'Other'
};

// Default nutrition values (all zeros)
export const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  saturatedFat: 0,
  transFat: 0
};

// Category mapping for common food categories to our simplified categories
const CATEGORY_MAPPING: Record<string, FoodCategory> = {
  // Fruits
  'fruits and fruit juices': 'fruits',
  'fruit products': 'fruits',
  'citrus fruits': 'fruits',
  'berries': 'fruits',
  'tropical fruits': 'fruits',
  'dried fruits': 'fruits',
  
  // Vegetables
  'vegetables and vegetable products': 'vegetables',
  'leafy vegetables': 'vegetables',
  'root vegetables': 'vegetables',
  'cruciferous vegetables': 'vegetables',
  'legumes and legume products': 'vegetables',
  'mushrooms': 'vegetables',
  
  // Grains
  'cereal grains and pasta': 'grains',
  'grain products': 'grains',
  'bread products': 'grains',
  'breakfast cereals': 'grains',
  'rice products': 'grains',
  'pasta products': 'grains',
  'baked products': 'grains',
  
  // Proteins
  'beef products': 'proteins',
  'pork products': 'proteins',
  'poultry products': 'proteins',
  'lamb, veal, and game products': 'proteins',
  'sausages and luncheon meats': 'proteins',
  'finfish and shellfish products': 'proteins',
  'egg products': 'proteins',
  'meat products': 'proteins',
  'seafood': 'proteins',
  'fish': 'proteins',
  'chicken': 'proteins',
  
  // Dairy
  'dairy and egg products': 'dairy',
  'milk and milk products': 'dairy',
  'cheese products': 'dairy',
  'yogurt products': 'dairy',
  'cream products': 'dairy',
  
  // Nuts & Seeds
  'nut and seed products': 'nuts_seeds',
  'nuts and seeds': 'nuts_seeds',
  'tree nuts': 'nuts_seeds',
  
  // Oils & Fats
  'fats and oils': 'oils_fats',
  'vegetable oils': 'oils_fats',
  'animal fats': 'oils_fats',
  
  // Beverages
  'beverages': 'beverages',
  'alcoholic beverages': 'beverages',
  'soft drinks': 'beverages',
  'coffee and tea': 'beverages',
  'fruit juices': 'beverages',
  
  // Sweets
  'sweets': 'sweets',
  'confectionery': 'sweets',
  'desserts': 'sweets',
  'candy': 'sweets',
  'chocolate products': 'sweets',
  'ice cream and frozen desserts': 'sweets',
  'cookies and crackers': 'sweets',
  
  // Pizza and mixed dishes
  'pizza products': 'grains',
  'fast foods': 'other',
  'restaurant foods': 'other',
  'frozen meals': 'other',
  'mixed dishes': 'other',
  
  // Condiments
  'soups, sauces, and gravies': 'condiments',
  'spices and herbs': 'condiments',
  'condiments': 'condiments',
  'salad dressings': 'condiments',
  'vinegars': 'condiments'
};

/**
 * Maps a free-form category to one of our valid simplified categories
 */
export function mapCategoryToSimplified(category: string): FoodCategory {
  const lowerCategory = category.toLowerCase().trim();
  
  // Direct match
  if (lowerCategory in CATEGORY_MAPPING) {
    return CATEGORY_MAPPING[lowerCategory];
  }
  
  // Partial matches
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return value;
    }
  }
  
  // Fallback to 'other'
  return 'other';
}

/**
 * Validates the AI response structure and required fields
 */
export function validateAIFoodResponse(response: unknown): response is {
  name: string;
  category: string;
  categorySimplified: FoodCategory;
  brand?: string;
  nutritionPer100g: NutritionInfo;
  commonServings: Array<{
    name: string;
    gramsEquivalent: number;
  }>;
} {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const res = response as Record<string, unknown>;

  // Check required top-level fields
  if (!res.name || typeof res.name !== 'string') {
    return false;
  }

  if (!res.category || typeof res.category !== 'string') {
    return false;
  }

  // Require categorySimplified and validate it
  if (!res.categorySimplified || !VALID_FOOD_CATEGORIES.includes(res.categorySimplified as FoodCategory)) {
    // If categorySimplified is missing or invalid, try to map the category
    const mappedCategory = mapCategoryToSimplified(res.category as string);
    (res as Record<string, unknown>).categorySimplified = mappedCategory;
  }

  // Validate nutrition object
  if (!res.nutritionPer100g || typeof res.nutritionPer100g !== 'object') {
    return false;
  }

  const nutrition = res.nutritionPer100g as Record<string, unknown>;

  // Check required nutrition fields
  for (const field of REQUIRED_NUTRITION_FIELDS) {
    const value = nutrition[field];
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return false;
    }
  }

  // Validate optional nutrition fields if present
  for (const field of ALL_NUTRITION_FIELDS) {
    if (field in nutrition) {
      const value = nutrition[field];
      if (typeof value !== 'number' || isNaN(value) || value < 0) {
        return false;
      }
    }
  }

  // Validate common servings array
  if (!Array.isArray(res.commonServings)) {
    return false;
  }

  for (const serving of res.commonServings) {
    if (!serving || typeof serving !== 'object') {
      return false;
    }
    const s = serving as Record<string, unknown>;
    if (!s.name || typeof s.name !== 'string') {
      return false;
    }
    if (typeof s.gramsEquivalent !== 'number' || isNaN(s.gramsEquivalent) || s.gramsEquivalent <= 0) {
      return false;
    }
  }

  return true;
}

/**
 * Generates a detailed prompt for AI food data generation
 */
export function generateFoodDataPrompt(foodDescription: string, additionalContext?: string): string {
  const categoriesText = VALID_FOOD_CATEGORIES.map(cat => 
    `"${cat}" (${FOOD_CATEGORY_LABELS[cat]})`
  ).join(', ');

  const prompt = `Generate comprehensive nutrition data for the following food item: "${foodDescription}"

${additionalContext ? `Additional context: ${additionalContext}\n` : ''}

Please provide the response as a JSON object with the following exact structure:

{
  "name": "Descriptive food name with appropriate emoji (e.g., '🍕 Margherita Pizza', '🥗 Caesar Salad', '🍎 Red Apple')",
  "category": "Specific food category (e.g., 'Fruits and Fruit Juices', 'Beef Products')",
  "categorySimplified": "REQUIRED - Must be exactly one of: ${categoriesText}",
  "brand": "Brand name if applicable (optional)",
  "nutritionPer100g": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "cholesterol": number,
    "saturatedFat": number,
    "transFat": number
  },
  "commonServings": [
    {
      "name": "1 medium",
      "gramsEquivalent": 150
    },
    {
      "name": "1 cup diced",
      "gramsEquivalent": 200
    }
  ]
}

IMPORTANT REQUIREMENTS:
- Food name should include an appropriate emoji at the beginning (🍎 for apple, 🥩 for meat, 🥛 for milk, etc.)
- All nutrition values are per 100 grams
- Sodium and cholesterol in milligrams (mg), all others in grams
- All nutrition values must be non-negative numbers
- Provide 2-4 realistic serving sizes with descriptive names
- Use accurate nutrition data based on USDA or reliable sources
- CategorySimplified is REQUIRED and must be exactly one of the listed categories: ${VALID_FOOD_CATEGORIES.join(', ')}
- If it's a branded product, include the brand name
- ServingSize must use "gramsEquivalent" field for the weight in grams

Respond only with the JSON object, no additional text.`;

  return prompt;
} 