import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Replace this string with your actual MongoDB URL if not using .env yet
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;