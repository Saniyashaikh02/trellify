const express = require('express');
const router = express.Router();
const {
  getTasksByBoard,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTask);

router.get('/board/:boardId', protect, getTasksByBoard);
router.patch('/:id/status', protect, updateTaskStatus);
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;