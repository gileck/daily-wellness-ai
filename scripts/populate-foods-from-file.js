const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gileck:jfxccnxeruiowqrioqsdjkla@cluster0.frtddwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DB_NAME = 'daily_wellness_db';
const JSON_FILE = 'scripts/FoodData_Central_foundation_food_json_2025-04-24.json';

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

// Add manual nutrition data for items missing from USDA data
function addManualNutrition(foodName, extractedNutrition) {
    const name = foodName.toLowerCase();

    // Handle oils - all oils are essentially 100% fat
    if (name.includes('oil')) {
        return {
            calories: 884, // Standard for oils
            protein: 0,
            carbs: 0,
            fat: 100,
            fiber: 0
        };
    }

    // Handle salt
    if (name.includes('salt')) {
        return {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };
    }

    // Handle pomegranate juice (approximate values)
    if (name.includes('pomegranate') && name.includes('juice')) {
        return {
            calories: 54, // Typical for fruit juice
            protein: 0.2,
            carbs: 13.1,
            fat: 0.3,
            fiber: 0.1
        };
    }

    // Return original nutrition if no manual override needed
    return extractedNutrition;
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

// Map USDA categories to simplified categories (optional, for UI)
function getSimplifiedCategory(usdaCategory) {
    const category = usdaCategory.toLowerCase();

    if (category.includes('fruit')) return 'fruits';
    if (category.includes('vegetable')) return 'vegetables';
    if (category.includes('cereal') || category.includes('grain') || category.includes('pasta') || category.includes('baked')) return 'grains';
    if (category.includes('beef') || category.includes('pork') || category.includes('poultry') || category.includes('lamb') || category.includes('finfish') || category.includes('shellfish')) return 'animal_proteins';
    if (category.includes('dairy') || category.includes('egg')) return 'dairy';
    if (category.includes('nut') || category.includes('seed')) return 'nuts_seeds';
    if (category.includes('fats') || category.includes('oils')) return 'oils_fats';
    if (category.includes('beverage')) return 'beverages';
    if (category.includes('sweets')) return 'sweets';
    if (category.includes('spices') || category.includes('herbs') || category.includes('sauce') || category.includes('soup')) return 'condiments';

    return 'other';
}

function transformToOurSchema(foodData) {
    const extractedNutrition = extractNutrition(foodData);
    const nutrition = addManualNutrition(foodData.description, extractedNutrition);

    return {
        name: foodData.description,
        brand: foodData.brandOwner || null,
        category: foodData.foodCategory.description,
        categorySimplified: getSimplifiedCategory(foodData.foodCategory.description),
        nutritionPer100g: nutrition,
        commonServings: extractServingSizes(foodData),
        isUserCreated: false,
        source: 'usda',
        usdaFdcId: foodData.fdcId,
        usdaDataType: foodData.dataType
    };
}

async function populateAllFounationFoods() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        // Check existing count
        const existingCount = await foodsCollection.countDocuments();
        console.log(`Existing foods in database: ${existingCount}`);

        console.log('Reading USDA Foundation Foods file...');
        const fileContent = fs.readFileSync(JSON_FILE, 'utf8');

        let foodsData;
        try {
            const jsonData = JSON.parse(fileContent);
            foodsData = jsonData.FoundationFoods || jsonData;
        } catch (error) {
            console.error('Error parsing JSON file:', error.message);
            return;
        }

        if (!Array.isArray(foodsData)) {
            console.error('Expected JSON file to contain an array of foods');
            return;
        }

        console.log(`Found ${foodsData.length} Foundation Foods in file`);

        // Transform all foods
        console.log('Processing all Foundation Foods...');
        const allTransformed = [];

        for (const foodData of foodsData) {
            const transformed = transformToOurSchema(foodData);
            allTransformed.push(transformed);
        }

        console.log(`\nProcessing complete:`);
        console.log(`  Total foods: ${foodsData.length}`);
        console.log(`  Ready to insert: ${allTransformed.length}`);

        // Insert in batches
        console.log(`\nInserting ${allTransformed.length} foods into database...`);
        const batchSize = 50;
        let insertedCount = 0;
        let updatedCount = 0;

        for (let i = 0; i < allTransformed.length; i += batchSize) {
            const batch = allTransformed.slice(i, i + batchSize);

            try {
                // Prepare upsert operations
                const operations = batch.map(food => ({
                    updateOne: {
                        filter: { id: `usda-${food.usdaFdcId}` },
                        update: {
                            $set: {
                                ...food,
                                id: `usda-${food.usdaFdcId}`,
                                updatedAt: new Date()
                            },
                            $setOnInsert: {
                                createdAt: new Date()
                            }
                        },
                        upsert: true
                    }
                }));

                const result = await foodsCollection.bulkWrite(operations);
                insertedCount += result.upsertedCount;
                updatedCount += result.modifiedCount;

                console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${result.upsertedCount} new, ${result.modifiedCount} updated`);

            } catch (error) {
                console.log(`  Batch ${Math.floor(i / batchSize) + 1}: Error:`, error.message);
            }
        }

        console.log(`\nPopulation complete!`);
        console.log(`Total foods inserted: ${insertedCount}`);
        console.log(`Total foods updated: ${updatedCount}`);

        const finalCount = await foodsCollection.countDocuments();
        console.log(`Final foods count in database: ${finalCount}`);

        // Show statistics
        const stats = await foodsCollection.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('\nFoods by category:');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count}`);
        });

    } catch (error) {
        console.error('Error populating foods database:', error);
    } finally {
        await client.close();
    }
}

async function main() {
    console.log('USDA Foundation Foods Complete Population Script');
    console.log('===============================================');

    // Check if file exists
    if (!fs.existsSync(JSON_FILE)) {
        console.error(`File not found: ${JSON_FILE}`);
        console.log('Please ensure the USDA JSON file is in the scripts folder');
        return;
    }

    await populateAllFounationFoods();
}

main(); 