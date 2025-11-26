import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  // --- NEW FIELD: ROLE ---
  role: {
    type: String,
    enum: ['user', 'employee'], // Define allowed roles
    default: 'user',            // Default is always 'user'
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);