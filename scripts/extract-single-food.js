const fs = require('fs');

console.log('Reading USDA Foundation Foods file...');
const data = fs.readFileSync('scripts/FoodData_Central_foundation_food_json_2025-04-24.json', 'utf8');

console.log('Parsing JSON...');
const jsonData = JSON.parse(data);

// The JSON structure has a FoundationFoods wrapper
const foods = jsonData.FoundationFoods || jsonData;

console.log(`Found ${foods.length} foods in file`);

// Get the first food item
const singleFood = foods[0];

// Save it to a readable JSON file
fs.writeFileSync('scripts/single-food-example.json', JSON.stringify(singleFood, null, 2));

console.log('✅ Saved first food item to scripts/single-food-example.json');
console.log('\nFood details:');
console.log(`  Name: ${singleFood.description}`);
console.log(`  Category: ${singleFood.foodCategory ? singleFood.foodCategory.description : 'N/A'}`);
console.log(`  Data Type: ${singleFood.dataType}`);
console.log(`  FDC ID: ${singleFood.fdcId}`);
console.log(`  Nutrients: ${singleFood.foodNutrients ? singleFood.foodNutrients.length : 0}`);
console.log(`  Portions: ${singleFood.foodPortions ? singleFood.foodPortions.length : 0}`); 