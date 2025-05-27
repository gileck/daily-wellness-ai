const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gileck:jfxccnxeruiowqrioqsdjkla@cluster0.frtddwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DB_NAME = 'daily_wellness_db';

function createSourdoughBreadData() {
    return {
        id: 'user-sourdough-bread',
        name: 'Sourdough Bread',
        brand: null,
        category: 'Baked Products',
        categorySimplified: 'grains',
        nutritionPer100g: {
            calories: 215, // Typical for sourdough bread
            protein: 8.5,
            carbs: 41.0,
            fat: 1.1,
            fiber: 2.6,
            sugar: 1.0,
            sodium: 490 // mg per 100g
        },
        commonServings: [
            {
                name: 'slice',
                gramsEquivalent: 28 // Standard slice weight
            },
            {
                name: 'thick slice',
                gramsEquivalent: 35
            },
            {
                name: 'thin slice', 
                gramsEquivalent: 20
            },
            {
                name: '100g',
                gramsEquivalent: 100
            }
        ],
        isUserCreated: true,
        source: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

function createSauerkrautData() {
    return {
        id: 'user-sauerkraut-long-fermented',
        name: 'Sauerkraut (Long Fermented)',
        brand: null,
        category: 'Vegetables and Vegetable Products',
        categorySimplified: 'vegetables',
        nutritionPer100g: {
            calories: 19, // Low calorie fermented vegetable
            protein: 0.9,
            carbs: 4.3,
            fat: 0.1,
            fiber: 2.9,
            sugar: 1.8,
            sodium: 661 // mg per 100g - high due to fermentation salt
        },
        commonServings: [
            {
                name: '1/2 cup',
                gramsEquivalent: 71 // Standard serving
            },
            {
                name: '1 cup',
                gramsEquivalent: 142
            },
            {
                name: '1 tablespoon',
                gramsEquivalent: 15
            },
            {
                name: '100g',
                gramsEquivalent: 100
            }
        ],
        isUserCreated: true,
        source: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

async function addFermentedFoods() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        const foodsToAdd = [
            { 
                data: createSourdoughBreadData(), 
                name: 'Sourdough Bread',
                id: 'user-sourdough-bread'
            },
            { 
                data: createSauerkrautData(), 
                name: 'Sauerkraut (Long Fermented)',
                id: 'user-sauerkraut-long-fermented'
            }
        ];

        let addedCount = 0;
        let skippedCount = 0;

        for (const food of foodsToAdd) {
            console.log(`\n--- Processing ${food.name} ---`);
            
            // Check if food already exists
            const existing = await foodsCollection.findOne({ id: food.id });
            
            if (existing) {
                console.log(`${food.name} already exists in the database.`);
                skippedCount++;
                continue;
            }

            console.log(`Adding ${food.name} to database...`);

            // Insert the food
            const result = await foodsCollection.insertOne(food.data);

            if (result.acknowledged) {
                console.log(`✅ ${food.name} added successfully!`);
                console.log(`Document ID: ${result.insertedId}`);
                
                // Verify insertion
                const inserted = await foodsCollection.findOne({ id: food.id });
                console.log(`\nVerification - Added ${food.name.toLowerCase()}:`);
                console.log(`  Name: ${inserted.name}`);
                console.log(`  Category: ${inserted.category}`);
                console.log(`  Calories per 100g: ${inserted.nutritionPer100g.calories}`);
                console.log(`  Common servings: ${inserted.commonServings.length}`);
                inserted.commonServings.forEach(serving => {
                    const calsPerServing = Math.round((inserted.nutritionPer100g.calories * serving.gramsEquivalent) / 100);
                    console.log(`    - ${serving.name}: ${serving.gramsEquivalent}g (${calsPerServing} calories)`);
                });
                
                addedCount++;
            } else {
                console.log(`❌ Failed to add ${food.name}`);
            }
        }

        // Show summary
        console.log('\n=== Summary ===');
        console.log(`Foods added: ${addedCount}`);
        console.log(`Foods skipped (already exist): ${skippedCount}`);
        
        // Show updated total count
        const totalCount = await foodsCollection.countDocuments();
        console.log(`Total foods in database: ${totalCount}`);

    } catch (error) {
        console.error('Error adding fermented foods:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
}

async function main() {
    console.log('Add Fermented Foods Script');
    console.log('==========================');
    console.log('Adding: Sourdough Bread & Sauerkraut (Long Fermented)');
    console.log('');
    
    await addFermentedFoods();
}

main(); 