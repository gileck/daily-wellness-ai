const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gileck:jfxccnxeruiowqrioqsdjkla@cluster0.frtddwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'daily-wellness-ai';

async function clearFoodsCollection() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        const foodsCollection = db.collection('foods');

        const existingCount = await foodsCollection.countDocuments();
        console.log(`Found ${existingCount} existing foods`);

        if (existingCount > 0) {
            const result = await foodsCollection.deleteMany({});
            console.log(`Deleted ${result.deletedCount} foods`);
        } else {
            console.log('Collection is already empty');
        }

        console.log('Foods collection cleared!');

    } catch (error) {
        console.error('Error clearing foods collection:', error);
    } finally {
        await client.close();
    }
}

clearFoodsCollection(); 