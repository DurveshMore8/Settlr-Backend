import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`MongoDB connection error: ${error.message}`);
        console.warn('Server will continue without database connectivity.');
    }
};

export default connectDB;
