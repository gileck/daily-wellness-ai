const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gileck:jfxccnxeruiowqrioqsdjkla@cluster0.frtddwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DB_NAME = 'daily_wellness_db';

async function convertFermentedFoodsToSystem() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        // Find the fermented foods we added
        const fermentedFoods = await foodsCollection.find({
            id: { $in: ['user-sourdough-bread', 'user-sauerkraut-long-fermented'] }
        }).toArray();

        console.log(`Found ${fermentedFoods.length} fermented foods to fix`);

        if (fermentedFoods.length === 0) {
            console.log('No fermented foods found to fix');
            return;
        }

        console.log('Converting fermented foods to system foods (available to all users)...');

        // Update the fermented foods to be system foods
        for (const food of fermentedFoods) {
            console.log(`\nUpdating ${food.name} to system food...`);
            
            const result = await foodsCollection.updateOne(
                { _id: food._id },
                { 
                    $set: { 
                        isUserCreated: false,
                        source: 'system',
                        updatedAt: new Date()
                    },
                    $unset: {
                        createdBy: ""  // Remove createdBy field if it exists
                    }
                }
            );

            if (result.modifiedCount === 1) {
                console.log(`✅ ${food.name} updated successfully to system food`);
            } else {
                console.log(`❌ Failed to update ${food.name}`);
            }
        }

        // Verify the updates
        console.log('\n--- Verification ---');
        const updatedFoods = await foodsCollection.find({
            id: { $in: ['user-sourdough-bread', 'user-sauerkraut-long-fermented'] }
        }).toArray();

        updatedFoods.forEach(food => {
            console.log(`${food.name}:`);
            console.log(`  - ID: ${food.id}`);
            console.log(`  - Created By: ${food.createdBy || 'NOT SET'}`);
            console.log(`  - Is User Created: ${food.isUserCreated}`);
            console.log(`  - Source: ${food.source}`);
        });

        console.log('\n✅ Fermented foods converted to system foods!');
        console.log('The foods should now appear in the FoodsManagement UI for all users without authentication requirements.');

    } catch (error) {
        console.error('Error fixing fermented foods ownership:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

async function main() {
    console.log('Convert Fermented Foods to System Foods Script');
    console.log('==============================================');
    console.log('This script converts the fermented foods to system foods');
    console.log('so they will be available to all users in the FoodsManagement UI.');
    console.log('');
    
    await convertFermentedFoodsToSystem();
}

main(); 