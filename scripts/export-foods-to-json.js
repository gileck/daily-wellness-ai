const fs = require('fs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gileck:jfxccnxeruiowqrioqsdjkla@cluster0.frtddwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'daily_wellness_db';

async function exportFoodsToJSON() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        console.log('Fetching all foods from database...');
        const foods = await foodsCollection.find({}).toArray();

        console.log(`Found ${foods.length} foods in database`);

        // Sort foods by category and name for better readability
        foods.sort((a, b) => {
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }
            return a.name.localeCompare(b.name);
        });

        // Save to JSON file
        const outputFile = 'scripts/exported-foods-collection.json';
        fs.writeFileSync(outputFile, JSON.stringify(foods, null, 2));

        console.log(`✅ Exported ${foods.length} foods to ${outputFile}`);

        // Show some statistics
        const categories = {};
        foods.forEach(food => {
            categories[food.category] = (categories[food.category] || 0) + 1;
        });

        console.log('\nExported foods by category:');
        Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`  ${category}: ${count}`);
            });

        // Show file size
        const stats = fs.statSync(outputFile);
        console.log(`\nFile size: ${(stats.size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('Error exporting foods:', error);
    } finally {
        await client.close();
    }
}

exportFoodsToJSON(); 