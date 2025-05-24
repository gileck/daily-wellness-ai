const fs = require('fs');

console.log('Reading USDA Foundation Foods file...');
const data = fs.readFileSync('scripts/FoodData_Central_foundation_food_json_2025-04-24.json', 'utf8');

console.log('Parsing JSON...');
const jsonData = JSON.parse(data);

// The JSON structure has a FoundationFoods wrapper
const foods = jsonData.FoundationFoods || jsonData;

console.log(`Found ${foods.length} foods in file`);
console.log('Analyzing categories...\n');

// Count categories
const categoryCount = {};

foods.forEach(food => {
    if (food.foodCategory && food.foodCategory.description) {
        const category = food.foodCategory.description;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
});

// Sort categories by count (descending)
const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1]);

console.log('=== FOOD CATEGORIES ===');
sortedCategories.forEach(([category, count]) => {
    console.log(`${category} ${count}`);
});

console.log(`\nTotal unique categories: ${sortedCategories.length}`);
console.log(`Total foods with categories: ${sortedCategories.reduce((sum, [, count]) => sum + count, 0)}`); 