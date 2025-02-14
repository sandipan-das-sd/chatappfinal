const mongoose = require('mongoose');

async function connectDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully');
        
        mongoose.connection.on('connected', () => {
            console.log(`📊 Connected to database: ${mongoose.connection.name}`);
        });

        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB Connection Error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('❗ MongoDB Disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
}

module.exports = connectDB;