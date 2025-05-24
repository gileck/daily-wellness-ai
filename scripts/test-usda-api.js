const https = require('https');

// You need to get a free API key from: https://fdc.nal.usda.gov/api-guide.html
const API_KEY = "WEd2NH5T2Lq28DnfyQq2IO1LZDyhJK4Nl9ffglar"

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

async function testSingleFood() {
    try {
        console.log('Testing USDA API with a single food item...\n');

        // Test 1: Get specific food by FDC ID (avocado example)
        const fdcId = 171705; // Avocados, raw
        const foodUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;

        console.log(`Fetching food details for FDC ID: ${fdcId}`);
        const foodData = await makeRequest(foodUrl);

        console.log('=== FOOD DETAILS ===');
        console.log(`Description: ${foodData.description}`);
        console.log(`Brand: ${foodData.brandOwner || 'N/A'}`);
        console.log(`Data Type: ${foodData.dataType}`);
        console.log(`Publication Date: ${foodData.publicationDate}`);

        console.log('\n=== NUTRIENTS (first 10) ===');
        if (foodData.foodNutrients) {
            foodData.foodNutrients.slice(0, 10).forEach(nutrient => {
                console.log(`${nutrient.nutrient.name}: ${nutrient.amount || 'N/A'} ${nutrient.nutrient.unitName}`);
            });
        }

        console.log('\n=== FOOD PORTIONS ===');
        if (foodData.foodPortions) {
            foodData.foodPortions.forEach(portion => {
                console.log(`${portion.measureUnit.name}: ${portion.gramWeight}g`);
            });
        }

        console.log('\n=== RAW JSON STRUCTURE (truncated) ===');
        console.log(JSON.stringify({
            fdcId: foodData.fdcId,
            description: foodData.description,
            dataType: foodData.dataType,
            foodNutrients: foodData.foodNutrients ? foodData.foodNutrients.slice(0, 3) : [],
            foodPortions: foodData.foodPortions ? foodData.foodPortions.slice(0, 2) : []
        }, null, 2));

    } catch (error) {
        console.error('Error testing USDA API:', error.message);
        if (error.message.includes('DEMO_KEY')) {
            console.log('\nNote: You need to get a free API key from https://fdc.nal.usda.gov/api-guide.html');
            console.log('Set it as environment variable: export USDA_API_KEY=your_key_here');
        }
    }
}

async function testFoodSearch() {
    try {
        console.log('\n\n=== TESTING SEARCH API ===');

        const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=banana&pageSize=5`;

        console.log('Searching for "banana"...');
        const searchData = await makeRequest(searchUrl);

        console.log(`Total results: ${searchData.totalHits}`);
        console.log('\n=== SEARCH RESULTS ===');

        if (searchData.foods) {
            searchData.foods.forEach((food, index) => {
                console.log(`${index + 1}. ${food.description} (ID: ${food.fdcId})`);
                console.log(`   Data Type: ${food.dataType}`);
                console.log(`   Brand: ${food.brandOwner || 'N/A'}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('Error testing search API:', error.message);
    }
}

async function main() {
    await testSingleFood();
    await testFoodSearch();
}

main(); 