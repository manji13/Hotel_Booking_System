import Feedback from '../Model/FeedbackModel.js'; // Ensure .js extension is here

// Add new feedback
export const addFeedback = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const newFeedback = new Feedback({ name, rating, comment });
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Top 3 reviews with 5 stars only
export const getTopFeedbacks = async (req, res) => {
  try {
    // Find rating 5, sort by newest, limit to 3
    const feedbacks = await Feedback.find({ rating: 5 })
      .sort({ createdAt: -1 })
      .limit(3);
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Feedbacks (For the "See All" page)
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};