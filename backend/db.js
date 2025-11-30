import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`------------------------------------------------`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Active Database Name: "${conn.connection.name}"`); 
    console.log(`------------------------------------------------`);
    
  } catch (error) {
    console.error(`❌ Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;