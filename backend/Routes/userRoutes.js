import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  updateUserProfile // <--- Import the new controller
} from '../Controller/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);

// --- NEW ROUTE for Profile Update ---
router.put('/profile/:id', updateUserProfile);

// Routes for Admin Management
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);

export default router;