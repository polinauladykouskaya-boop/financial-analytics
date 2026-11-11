
const mongoose = require('mongoose');

const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error(
            'MONGODB_URI is not defined in environment variables'
        );
    }

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000
    });

    console.log('MongoDB connected successfully');
};

module.exports = connectDatabase;
