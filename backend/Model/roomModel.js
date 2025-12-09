import mongoose from 'mongoose';

function arrayLimit(val) {
  return val.length >= 1 && val.length <= 4;
}

const roomSchema = mongoose.Schema({
  roomType: {
    type: String,
    required: [true, 'Please add a room type'],
  },
  images: {
    type: [String],
    required: [true, 'Please upload at least one image'],
    validate: [arrayLimit, '{PATH} must have between 1 and 4 images'],
  },
  beds: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  // --- NEW FIELD ---
  availableCount: {
    type: Number,
    required: true,
    default: 1, // Default to 1 room available if not specified
    min: 0
  },
  // ----------------
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Room', roomSchema);