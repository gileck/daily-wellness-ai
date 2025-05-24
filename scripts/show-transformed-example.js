const fs = require('fs');

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
    const nutrition = extractNutrition(foodData);

    return {
        id: `usda-${foodData.fdcId}`,
        name: foodData.description,
        brand: foodData.brandOwner || null,
        category: foodData.foodCategory.description,
        categorySimplified: getSimplifiedCategory(foodData.foodCategory.description),
        nutritionPer100g: nutrition,
        commonServings: extractServingSizes(foodData),
        isUserCreated: false,
        source: 'usda',
        usdaFdcId: foodData.fdcId,
        usdaDataType: foodData.dataType,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

// Read and parse the file
console.log('Reading USDA Foundation Foods file...');
const data = fs.readFileSync('scripts/FoodData_Central_foundation_food_json_2025-04-24.json', 'utf8');
const jsonData = JSON.parse(data);
const foods = jsonData.FoundationFoods || jsonData;

// Find a food with good nutrition data
const goodFoods = ['apple', 'chicken', 'broccoli', 'banana'];
let example = null;

for (const foodName of goodFoods) {
    example = foods.find(food => food.description.toLowerCase().includes(foodName));
    if (example) {
        const nutrition = extractNutrition(example);
        if (nutrition.calories > 0) break;
    }
}

if (example) {
    console.log('=== ORIGINAL USDA DATA (partial) ===');
    console.log('Description:', example.description);
    console.log('FDC ID:', example.fdcId);
    console.log('Category:', example.foodCategory.description);
    console.log('Data Type:', example.dataType);
    console.log('Nutrients count:', example.foodNutrients.length);
    console.log('Portions count:', example.foodPortions?.length || 0);

    // Show some nutrient details
    console.log('\nSample nutrients:');
    example.foodNutrients.slice(0, 5).forEach(nutrient => {
        console.log(`  ${nutrient.nutrient.name}: ${nutrient.amount} ${nutrient.nutrient.unitName}`);
    });

    console.log('\n=== TRANSFORMED FOR OUR DATABASE ===');
    const transformed = transformToOurSchema(example);
    console.log(JSON.stringify(transformed, null, 2));

    // Save to file
    fs.writeFileSync('scripts/transformed-food-example.json', JSON.stringify(transformed, null, 2));
    console.log('\n✅ Saved transformed example to scripts/transformed-food-example.json');

    // Also save the original USDA data for comparison
    fs.writeFileSync('scripts/original-usda-example.json', JSON.stringify(example, null, 2));
    console.log('✅ Saved original USDA data to scripts/original-usda-example.json');
} else {
    console.log('No food with good nutrition data found');
} 