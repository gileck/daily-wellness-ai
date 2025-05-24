# Scripts

## USDA API Setup

To use the USDA FoodData Central API scripts:

1. Get a free API key from: https://fdc.nal.usda.gov/api-guide.html
2. Set it as environment variable:
   ```bash
   export USDA_API_KEY=your_key_here
   ```

## Available Scripts

- `test-usda-api.js` - Test the USDA API with a single food item
- `extract-nutrition.js` - Test nutrition extraction from multiple foods
- `populate-foods.js` - Populate foods collection via USDA API (slow due to rate limits)
- `populate-foods-from-file.js` - **RECOMMENDED** - Populate foods collection from local USDA JSON file

## Usage

```bash
# Test the API
node scripts/test-usda-api.js

# Test nutrition extraction
node scripts/extract-nutrition.js

# Populate from API (takes ~3 hours due to rate limiting)
node scripts/populate-foods.js

# Populate from local file (RECOMMENDED - takes ~30 seconds)
node scripts/populate-foods-from-file.js
```

## Foods Population Strategy

### Method 1: API-based (populate-foods.js)
- Searches for 80+ common foods via USDA API
- Rate limited to 1000 requests/hour
- Results in ~160 foods
- Takes ~3 hours to complete

### Method 2: File-based (populate-foods-from-file.js) - **RECOMMENDED**
- Uses local USDA Foundation Foods JSON file
- Processes all Foundation Foods (~1000+ items)
- Prioritizes common foods (fruits, vegetables, proteins, etc.)
- Takes ~30 seconds to complete
- Results in 1000 high-quality foods

The file includes Foundation Foods with the most accurate nutrition data from USDA. Foods are categorized as:
- **Fruits**: Fruits and Fruit Juices → 'fruits'
- **Vegetables**: Vegetables and Vegetable Products → 'vegetables'  
- **Proteins**: Beef/Pork/Poultry/Fish Products → 'proteins'
- **Grains**: Cereal Grains, Pasta, Baked Products → 'grains'
- **Dairy**: Dairy and Egg Products → 'dairy'
- **Nuts/Seeds**: Nut and Seed Products → 'nuts_seeds'
- **Oils**: Fats and Oils → 'oils_fats'
- **Beverages**: Beverages → 'beverages'
- **Sweets**: Sweets → 'sweets'
- **Condiments**: Spices, Herbs, Sauces, Soups → 'condiments' 