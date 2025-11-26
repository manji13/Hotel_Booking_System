import express from 'express';
import multer from 'multer';
import path from 'path';
import { createRoom, getRooms, updateRoom, deleteRoom } from '../Controller/roomController.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb('Images only!');
};

const upload = multer({ storage, fileFilter: (req, file, cb) => checkFileType(file, cb), limits: { fileSize: 5 * 1024 * 1024 } });

router.route('/')
  .post(upload.array('images', 4), createRoom)
  .get(getRooms);

router.route('/:id')
  .put(upload.array('images', 4), updateRoom)
  .delete(deleteRoom);

export default router;
