import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI not found in environment variables');
            return;
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};
