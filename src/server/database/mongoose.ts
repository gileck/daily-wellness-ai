import mongoose from 'mongoose';
import { appConfig } from '@/app.config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = appConfig.dbName;

let isConnected = false;

export const connectToDatabase = async (): Promise<void> => {
    if (isConnected) {
        return;
    }

    try {
        // Use strictQuery setting to suppress deprecation warning
        mongoose.set('strictQuery', false);

        // Don't add DB_NAME to the URI if it's already included
        const connectionString = MONGO_URI.includes(DB_NAME)
            ? MONGO_URI
            : `${MONGO_URI}/${DB_NAME}`;

        await mongoose.connect(connectionString);
        isConnected = true;
        console.log('MongoDB connected via Mongoose');
    } catch (error) {
        console.error('Error connecting to MongoDB via Mongoose:', error);
        throw error;
    }
};

// Connect by default when this module is imported
connectToDatabase().catch(err => {
    console.error('Failed to establish initial Mongoose connection:', err);
}); 