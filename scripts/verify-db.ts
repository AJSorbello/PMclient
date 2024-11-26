import dbConnect from '../lib/db';

async function verifyConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoose = await dbConnect();
    console.log('Successfully connected to MongoDB!');
    
    // Get connection information
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Close the connection
    await mongoose.disconnect();
    console.log('\nConnection closed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

verifyConnection();
