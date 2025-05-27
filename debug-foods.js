const { MongoClient } = require('mongodb');

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'daily-wellness-ai';

async function debugFoodsCollection() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');
        
        // Check total count
        const totalCount = await foodsCollection.countDocuments();
        console.log(`\n📊 Total foods in collection: ${totalCount}`);
        
        if (totalCount === 0) {
            console.log('❌ No foods found in collection!');
            console.log('\n💡 You may need to populate the database first.');
            console.log('   Try running: node scripts/populate-foods.js');
            return;
        }
        
        // Check by source
        const usdaCount = await foodsCollection.countDocuments({ source: 'usda' });
        const userCount = await foodsCollection.countDocuments({ source: 'user' });
        console.log(`   - USDA foods: ${usdaCount}`);
        console.log(`   - User foods: ${userCount}`);
        
        // Sample some foods
        console.log('\n📝 Sample foods:');
        const sampleFoods = await foodsCollection.find({}).limit(5).toArray();
        sampleFoods.forEach((food, index) => {
            console.log(`   ${index + 1}. ${food.name} (${food.source}) - ID: ${food.id}`);
        });
        
        // Check indexes
        console.log('\n🔍 Collection indexes:');
        const indexes = await foodsCollection.indexes();
        indexes.forEach(index => {
            console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

// Also test the search function directly
async function testSearchFoods() {
    try {
        // This simulates what the API does
        const { searchFoods } = require('./src/server/database/collections/foods/index.ts');
        
        console.log('\n🔍 Testing searchFoods function...');
        
        // Test empty filters (should return all foods)
        const allFoods = await searchFoods({}, 10);
        console.log(`   Empty filters result: ${allFoods.length} foods`);
        
        // Test with a search query
        const searchResults = await searchFoods({ query: 'apple' }, 5);
        console.log(`   Search for "apple": ${searchResults.length} foods`);
        
        if (allFoods.length > 0) {
            console.log('\n📝 Sample search results:');
            allFoods.slice(0, 3).forEach((food, index) => {
                console.log(`   ${index + 1}. ${food.name} (${food.source})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing search function:', error);
    }
}

async function main() {
    console.log('🔧 Debugging Foods Management Data Issue...\n');
    
    await debugFoodsCollection();
    // await testSearchFoods(); // Commented out as it requires TypeScript compilation
    
    console.log('\n✅ Debug complete!');
}

main().catch(console.error); 