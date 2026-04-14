const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user._id });
    const tasks = await Task.find({ userId: req.user._id });
    
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    
    const productivity = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100) 
      : 0;
    
    res.json({
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalBoards: boards.length,
      activeDays: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)),
      productivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user activities
// @route   GET /api/users/activities
// @access  Private
router.get('/activities', protect, async (req, res) => {
  try {
    // This would typically come from an activity log collection
    // For demo, return recent tasks as activities
    const recentTasks = await Task.find({ userId: req.user._id })
      .sort('-updatedAt')
      .limit(10);
    
    const activities = recentTasks.map(task => ({
      type: task.status === 'done' ? 'complete' : 'update',
      description: `${task.status === 'done' ? 'Completed' : 'Updated'} task: ${task.title}`,
      timestamp: task.updatedAt
    }));
    
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    // Delete all user's boards and tasks
    await Board.deleteMany({ userId: req.user._id });
    await Task.deleteMany({ userId: req.user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;