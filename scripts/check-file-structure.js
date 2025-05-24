const fs = require('fs');

console.log('Reading USDA Foundation Foods file...');
const data = fs.readFileSync('scripts/FoodData_Central_foundation_food_json_2025-04-24.json', 'utf8');

console.log('File size:', (data.length / 1024 / 1024).toFixed(2) + ' MB');

console.log('Parsing JSON...');
const jsonData = JSON.parse(data);

console.log('JSON structure:');
console.log('- Top level keys:', Object.keys(jsonData));

if (jsonData.FoundationFoods) {
    console.log('- FoundationFoods is an array:', Array.isArray(jsonData.FoundationFoods));
    console.log('- FoundationFoods length:', jsonData.FoundationFoods.length);
} else if (Array.isArray(jsonData)) {
    console.log('- Root is an array with length:', jsonData.length);
} else {
    console.log('- Root is an object with keys:', Object.keys(jsonData));
}

// Check if there are other food-related keys
Object.keys(jsonData).forEach(key => {
    if (typeof jsonData[key] === 'object' && Array.isArray(jsonData[key])) {
        console.log(`- Array "${key}" has ${jsonData[key].length} items`);
    }
});

// Sample a few items to see their structure
const foods = jsonData.FoundationFoods || jsonData;
if (Array.isArray(foods) && foods.length > 0) {
    console.log('\nSample food item structure:');
    const sample = foods[0];
    console.log('- Keys:', Object.keys(sample));
    console.log('- Description:', sample.description);
    console.log('- Data type:', sample.dataType);
    console.log('- FDC ID:', sample.fdcId);
}

// Check for different data types
if (Array.isArray(foods)) {
    const dataTypes = {};
    foods.forEach(food => {
        const type = food.dataType || 'unknown';
        dataTypes[type] = (dataTypes[type] || 0) + 1;
    });

    console.log('\nData types found:');
    Object.entries(dataTypes).forEach(([type, count]) => {
        console.log(`- ${type}: ${count}`);
    });
} 