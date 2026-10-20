import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
    try {
        if (!config.databaseUrl) {
            throw new Error('Database URL is not configured');
        }

        mongoose.connection.on('connected', function () {
            console.log('Connected to database successfully');
        });

        mongoose.connection.on('error', function (err) {
            console.log('Error in connecting to database. ', err);
        });

        await mongoose.connect(config.databaseUrl as string);
    } catch (error) {
        console.error('Failed to connect to database. ', error);
        process.exit(1);
    }
};

export default connectDB;
