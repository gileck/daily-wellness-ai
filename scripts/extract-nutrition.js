const https = require('https');

const API_KEY = process.env.USDA_API_KEY || 'WEd2NH5T2Lq28DnfyQq2IO1LZDyhJK4Nl9ffglar';

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

        // Only process if unit is grams or kcal and amount exists
        if (!amount || (unit !== 'g' && unit !== 'kcal')) return;

        switch (name) {
            case 'Energy':
                if (unit === 'kcal') {
                    nutrition.calories = amount;
                }
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
                name: portion.modifier, // "1 cup, cubes", "1 medium", etc.
                gramsEquivalent: portion.gramWeight
            });
        }
    });

    return servings;
}

async function testNutritionExtraction() {
    try {
        console.log('Testing nutrition extraction...\n');

        // Test with multiple foods
        const testFoods = [
            { id: 171705, name: 'Avocado' },
            { id: 173944, name: 'Banana' },
            { id: 170148, name: 'Chicken breast' },
            { id: 173410, name: 'Whole wheat bread' }
        ];

        for (const food of testFoods) {
            console.log(`=== ${food.name.toUpperCase()} ===`);

            const foodUrl = `https://api.nal.usda.gov/fdc/v1/food/${food.id}?api_key=${API_KEY}`;
            const foodData = await makeRequest(foodUrl);

            console.log(`Description: ${foodData.description}`);

            const nutrition = extractNutrition(foodData);
            console.log('Nutrition per 100g:');
            console.log(`  Calories: ${nutrition.calories} kcal`);
            console.log(`  Protein: ${nutrition.protein}g`);
            console.log(`  Carbs: ${nutrition.carbs}g`);
            console.log(`  Fat: ${nutrition.fat}g`);
            console.log(`  Fiber: ${nutrition.fiber}g`);

            const servings = extractServingSizes(foodData);
            console.log('Common serving sizes:');
            servings.forEach(serving => {
                console.log(`  ${serving.name}: ${serving.gramsEquivalent}g`);
            });

            console.log('');

            // Rate limiting - wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Show the transformation to our Food schema
function transformToOurSchema(foodData) {
    return {
        id: `usda-${foodData.fdcId}`,
        name: foodData.description,
        brand: foodData.brandOwner || null,
        category: 'uncategorized', // Would need to categorize based on description
        nutritionPer100g: extractNutrition(foodData),
        commonServings: extractServingSizes(foodData),
        isUserCreated: false,
        source: 'usda',
        usdaFdcId: foodData.fdcId,
        dataType: foodData.dataType
    };
}

async function showTransformation() {
    try {
        console.log('\n=== TRANSFORMATION EXAMPLE ===');

        const foodUrl = `https://api.nal.usda.gov/fdc/v1/food/171705?api_key=${API_KEY}`;
        const foodData = await makeRequest(foodUrl);

        const transformed = transformToOurSchema(foodData);

        console.log('Transformed to our schema:');
        console.log(JSON.stringify(transformed, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function main() {
    await testNutritionExtraction();
    await showTransformation();
}

main(); 