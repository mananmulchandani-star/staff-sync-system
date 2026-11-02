const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/staffsync';
  
  try {
    console.log(`Connecting to MongoDB at: ${uri} ...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ Connected to MongoDB successfully.`);
  } catch (err) {
    console.warn(`⚠️ Standard MongoDB connection failed (${err.message}).`);

    if (process.env.USE_MEMORY_DB_FALLBACK !== 'false') {
      try {
        console.log('🔄 Initializing in-memory MongoDB fallback server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`✅ Connected to in-memory MongoDB at: ${memoryUri}`);

        // Automatically seed demo data if in-memory is used
        const { seedDefaultData } = require('../seeds/seedData');
        await seedDefaultData();
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Could not connect to MongoDB:', err.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
