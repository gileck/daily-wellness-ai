const fs = require('fs');

console.log('Reading USDA Foundation Foods file...');
const data = fs.readFileSync('scripts/FoodData_Central_foundation_food_json_2025-04-24.json', 'utf8');

console.log('Parsing JSON...');
const jsonData = JSON.parse(data);

const foods = jsonData.FoundationFoods || jsonData;

// Group foods by category
const foodsByCategory = {};

foods.forEach(food => {
    if (food.foodCategory && food.foodCategory.description) {
        const category = food.foodCategory.description;
        if (!foodsByCategory[category]) {
            foodsByCategory[category] = [];
        }
        foodsByCategory[category].push(food.description);
    }
});

// Show vegetables
console.log('=== VEGETABLES AND VEGETABLE PRODUCTS (78 items) ===');
if (foodsByCategory['Vegetables and Vegetable Products']) {
    foodsByCategory['Vegetables and Vegetable Products']
        .sort()
        .forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });
}

console.log('\n=== FRUITS AND FRUIT JUICES (48 items) ===');
if (foodsByCategory['Fruits and Fruit Juices']) {
    foodsByCategory['Fruits and Fruit Juices']
        .sort()
        .forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });
}

console.log('\n=== LEGUMES AND LEGUME PRODUCTS (37 items) ===');
if (foodsByCategory['Legumes and Legume Products']) {
    foodsByCategory['Legumes and Legume Products']
        .sort()
        .forEach((name, index) => {
            console.log(`${index + 1}. ${name}`);
        });
} 