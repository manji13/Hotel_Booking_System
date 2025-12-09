import Room from '../Model/roomModel.js';
import fs from 'fs';
import path from 'path';

// Helper to map uploaded files to stored paths
const buildPathsFromFiles = (files) => {
  if (!files || files.length === 0) return [];
  return files.map(file => `/uploads/${file.filename}`);
};

// Create room
export const createRoom = async (req, res) => {
  try {
    // Added availableCount to destructuring
    const { roomType, beds, capacity, price, description, availableCount } = req.body;
    const images = buildPathsFromFiles(req.files);

    if (!roomType || !beds || !capacity || !price || images.length === 0) {
      return res.status(400).json({ message: 'All fields are required with at least 1 image' });
    }

    // Include availableCount in creation
    const room = await Room.create({ 
        roomType, 
        beds, 
        capacity, 
        price, 
        description, 
        images,
        availableCount: availableCount || 1 
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Added availableCount
    const { roomType, beds, capacity, price, description, availableCount } = req.body;
    
    room.roomType = roomType ?? room.roomType;
    room.beds = beds ?? room.beds;
    room.capacity = capacity ?? room.capacity;
    room.price = price ?? room.price;
    room.description = description ?? room.description;
    // Update count if provided
    if (availableCount !== undefined) {
        room.availableCount = availableCount;
    }

    if (req.files && req.files.length > 0) {
      // Delete old images
      room.images.forEach(img => {
        const fullPath = path.join(process.cwd(), img);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
      // Save new images
      room.images = buildPathsFromFiles(req.files);
    }

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.images.forEach(img => {
      const fullPath = path.join(process.cwd(), img);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};