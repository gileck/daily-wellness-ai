const https = require('https');
const { MongoClient } = require('mongodb');

const API_KEY = process.env.USDA_API_KEY || 'WEd2NH5T2Lq28DnfyQq2IO1LZDyhJK4Nl9ffglar';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'daily-wellness-ai';

// Rate limiting - USDA allows 1000 requests/hour
const DELAY_BETWEEN_REQUESTS = 3000; // 3 seconds
const BATCH_SIZE = 20;

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

function extractNutrition(foodData) {
    const nutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
    };

    if (!foodData.foodNutrients) return nutrition;

    foodData.foodNutrients.forEach(nutrient => {
        const name = nutrient.nutrient.name;
        const amount = nutrient.amount || 0;
        const unit = nutrient.nutrient.unitName;

        if (!amount || (unit !== 'g' && unit !== 'kcal')) return;

        switch (name) {
            case 'Energy':
                if (unit === 'kcal') nutrition.calories = amount;
                break;
            case 'Protein':
                nutrition.protein = amount;
                break;
            case 'Carbohydrate, by difference':
                nutrition.carbs = amount;
                break;
            case 'Total lipid (fat)':
                nutrition.fat = amount;
                break;
            case 'Fiber, total dietary':
                nutrition.fiber = amount;
                break;
        }
    });

    return nutrition;
}

function extractServingSizes(foodData) {
    const servings = [];

    if (!foodData.foodPortions) return servings;

    foodData.foodPortions.forEach(portion => {
        if (portion.gramWeight && portion.modifier) {
            servings.push({
                name: portion.modifier,
                gramsEquivalent: portion.gramWeight
            });
        }
    });

    return servings;
}

function categorizeFood(description) {
    const desc = description.toLowerCase();

    // Fruits
    if (desc.includes('apple') || desc.includes('banana') || desc.includes('orange') ||
        desc.includes('grape') || desc.includes('berry') || desc.includes('melon') ||
        desc.includes('pear') || desc.includes('peach') || desc.includes('plum') ||
        desc.includes('cherry') || desc.includes('lemon') || desc.includes('lime') ||
        desc.includes('grapefruit') || desc.includes('pineapple') || desc.includes('mango') ||
        desc.includes('avocado') || desc.includes('kiwi')) {
        return 'fruits';
    }

    // Vegetables
    if (desc.includes('broccoli') || desc.includes('carrot') || desc.includes('spinach') ||
        desc.includes('lettuce') || desc.includes('tomato') || desc.includes('potato') ||
        desc.includes('onion') || desc.includes('pepper') || desc.includes('cucumber') ||
        desc.includes('celery') || desc.includes('cabbage') || desc.includes('kale') ||
        desc.includes('asparagus') || desc.includes('mushroom') || desc.includes('corn') ||
        desc.includes('peas') || desc.includes('beans') || desc.includes('squash')) {
        return 'vegetables';
    }

    // Proteins
    if (desc.includes('chicken') || desc.includes('beef') || desc.includes('pork') ||
        desc.includes('fish') || desc.includes('salmon') || desc.includes('tuna') ||
        desc.includes('egg') || desc.includes('turkey') || desc.includes('lamb') ||
        desc.includes('shrimp') || desc.includes('crab') || desc.includes('lobster')) {
        return 'proteins';
    }

    // Grains
    if (desc.includes('rice') || desc.includes('wheat') || desc.includes('bread') ||
        desc.includes('pasta') || desc.includes('oats') || desc.includes('quinoa') ||
        desc.includes('barley') || desc.includes('cereal') || desc.includes('flour') ||
        desc.includes('bagel') || desc.includes('tortilla')) {
        return 'grains';
    }

    // Dairy
    if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt') ||
        desc.includes('butter') || desc.includes('cream') || desc.includes('cottage cheese')) {
        return 'dairy';
    }

    // Nuts & Seeds
    if (desc.includes('almond') || desc.includes('walnut') || desc.includes('peanut') ||
        desc.includes('cashew') || desc.includes('pistachio') || desc.includes('pecan') ||
        desc.includes('seed') || desc.includes('nut')) {
        return 'nuts_seeds';
    }

    // Oils & Fats
    if (desc.includes('oil') || desc.includes('fat') || desc.includes('lard')) {
        return 'oils_fats';
    }

    return 'other';
}

function transformToOurSchema(foodData) {
    const nutrition = extractNutrition(foodData);

    // Skip foods with no calorie data
    if (nutrition.calories === 0) return null;

    return {
        name: foodData.description,
        brand: foodData.brandOwner || null,
        category: categorizeFood(foodData.description),
        nutritionPer100g: nutrition,
        commonServings: extractServingSizes(foodData),
        isUserCreated: false,
        source: 'usda',
        usdaFdcId: foodData.fdcId,
        usdaDataType: foodData.dataType
    };
}

// Most common foods to search for
const COMMON_FOODS = [
    // Fruits
    'apple', 'banana', 'orange', 'grapes', 'strawberry', 'blueberry', 'raspberry',
    'pear', 'peach', 'plum', 'cherry', 'lemon', 'lime', 'grapefruit', 'pineapple',
    'mango', 'avocado', 'kiwi', 'watermelon', 'cantaloupe', 'honeydew',

    // Vegetables  
    'broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'potato', 'sweet potato',
    'onion', 'bell pepper', 'cucumber', 'celery', 'cabbage', 'kale', 'asparagus',
    'mushroom', 'corn', 'peas', 'green beans', 'zucchini', 'eggplant',

    // Proteins
    'chicken breast', 'chicken thigh', 'ground beef', 'beef steak', 'pork chop',
    'salmon', 'tuna', 'cod', 'tilapia', 'egg', 'turkey', 'shrimp', 'tofu',

    // Grains
    'white rice', 'brown rice', 'whole wheat bread', 'white bread', 'pasta',
    'oatmeal', 'quinoa', 'barley', 'bagel', 'tortilla', 'cereal',

    // Dairy
    'whole milk', 'skim milk', '2% milk', 'cheddar cheese', 'mozzarella cheese',
    'greek yogurt', 'regular yogurt', 'cottage cheese', 'butter', 'cream cheese',

    // Nuts & Seeds
    'almonds', 'walnuts', 'peanuts', 'cashews', 'pistachios', 'pecans',
    'sunflower seeds', 'pumpkin seeds', 'chia seeds', 'flax seeds',

    // Oils
    'olive oil', 'coconut oil', 'vegetable oil', 'canola oil'
];

async function searchUSDAFood(query) {
    try {
        const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${encodeURIComponent(query)}&dataType=SR%20Legacy&pageSize=3`;

        console.log(`Searching for: ${query}`);
        const searchData = await makeRequest(searchUrl);

        if (!searchData.foods || searchData.foods.length === 0) {
            console.log(`  No results found for ${query}`);
            return [];
        }

        const results = [];

        // Get detailed info for top 2 results
        for (let i = 0; i < Math.min(2, searchData.foods.length); i++) {
            const food = searchData.foods[i];

            // Only process SR Legacy foods (most reliable)
            if (food.dataType !== 'SR Legacy') continue;

            console.log(`  Found: ${food.description}`);

            try {
                const foodUrl = `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`;
                const foodData = await makeRequest(foodUrl);

                const transformed = transformToOurSchema(foodData);
                if (transformed) {
                    results.push(transformed);
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.log(`    Error getting details for ${food.description}:`, error.message);
            }
        }

        return results;

    } catch (error) {
        console.log(`Error searching for ${query}:`, error.message);
        return [];
    }
}

async function populateFoodsDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        // Check existing count
        const existingCount = await foodsCollection.countDocuments();
        console.log(`Existing foods in database: ${existingCount}`);

        if (existingCount > 500) {
            console.log('Database already has many foods. Skipping population.');
            return;
        }

        console.log(`Starting to populate foods database with ${COMMON_FOODS.length} searches...`);

        let totalProcessed = 0;
        let totalAdded = 0;

        for (let i = 0; i < COMMON_FOODS.length; i += BATCH_SIZE) {
            const batch = COMMON_FOODS.slice(i, i + BATCH_SIZE);
            console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(COMMON_FOODS.length / BATCH_SIZE)}`);

            const batchResults = [];

            for (const foodQuery of batch) {
                const foods = await searchUSDAFood(foodQuery);
                batchResults.push(...foods);
                totalProcessed++;

                // Rate limiting between searches
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            }

            // Insert batch into database
            if (batchResults.length > 0) {
                try {
                    // Add timestamps
                    const foodsWithTimestamps = batchResults.map(food => ({
                        ...food,
                        id: `usda-${food.usdaFdcId}`,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));

                    const result = await foodsCollection.insertMany(foodsWithTimestamps, { ordered: false });
                    totalAdded += result.insertedCount;
                    console.log(`  Inserted ${result.insertedCount} foods from this batch`);

                } catch (error) {
                    // Handle duplicate key errors gracefully
                    if (error.code === 11000) {
                        console.log('  Some foods already exist in database (duplicates skipped)');
                    } else {
                        console.log('  Error inserting batch:', error.message);
                    }
                }
            }
        }

        console.log(`\nPopulation complete!`);
        console.log(`Total searches processed: ${totalProcessed}`);
        console.log(`Total foods added: ${totalAdded}`);

        const finalCount = await foodsCollection.countDocuments();
        console.log(`Final foods count in database: ${finalCount}`);

    } catch (error) {
        console.error('Error populating foods database:', error);
    } finally {
        await client.close();
    }
}

async function main() {
    console.log('USDA Foods Database Population Script');
    console.log('=====================================');

    if (API_KEY === 'DEMO_KEY') {
        console.log('Warning: Using DEMO_KEY. Get a real API key from https://fdc.nal.usda.gov/api-guide.html');
        console.log('Set it as: export USDA_API_KEY=your_key_here');
    }

    await populateFoodsDatabase();
}

main(); 