import express from 'express';
import { addFeedback, getTopFeedbacks, getAllFeedbacks } from '../Controller/FedbackController.js'; // Note the .js extension and path casing

const router = express.Router();

router.post('/add', addFeedback);
router.get('/top', getTopFeedbacks); // For Userpage (3 items, 5 stars)
router.get('/all', getAllFeedbacks); // For "Show All" page

export default router;