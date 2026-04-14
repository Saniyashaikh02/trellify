const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // Validate name length
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      createdAt: new Date()
    });

    if (user) {
      const token = generateToken(user._id);
      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
        createdAt: user.createdAt
      };
      
      console.log('User registered successfully:', { id: user._id, email: user.email });
      
      res.status(201).json(responseData);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error details:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    
    if (isPasswordMatch) {
      const token = generateToken(user._id);
      const responseData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
        createdAt: user.createdAt
      };
      
      console.log('User logged in successfully:', { id: user._id, email: user.email });
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
      
      res.json(responseData);
    } else {
      console.log('Login failed: Invalid password for user:', email);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: {
          totalBoards: user.totalBoards || 0,
          totalTasks: user.totalTasks || 0
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    
    // Update name if provided
    if (req.body.name) {
      if (req.body.name.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
      }
      user.name = req.body.name.trim();
      updates.name = user.name;
    }
    
    // Update email if provided
    if (req.body.email) {
      // Validate email format
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: req.body.email.toLowerCase(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      
      user.email = req.body.email.toLowerCase().trim();
      updates.email = user.email;
    }
    
    // Update password if provided
    if (req.body.newPassword) {
      // Verify current password is provided
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      
      // Verify current password is correct
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Validate new password length
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      
      // Check if new password is different from current
      const isSamePassword = await user.matchPassword(req.body.newPassword);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password must be different from current password' });
      }
      
      user.password = req.body.newPassword;
      updates.passwordChanged = true;
    }

    const updatedUser = await user.save();

    // Generate new token
    const token = generateToken(updatedUser._id);

    const responseData = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: token,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
    
    console.log('User profile updated:', { id: updatedUser._id, updates: Object.keys(updates) });
    
    res.json(responseData);
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all password fields' });
    }
    
    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match' });
    }
    
    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Find user with password
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Check if new password is different from current
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    console.log('Password changed for user:', user.email);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's boards and tasks (cascading delete)
    const Board = require('../models/Board');
    const Task = require('../models/Task');
    
    await Board.deleteMany({ userId: user._id });
    await Task.deleteMany({ userId: user._id });
    await user.deleteOne();
    
    console.log('Account deleted:', { id: user._id, email: user.email });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

// @desc    Get user statistics
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const Board = require('../models/Board');
    const Task = require('../models/Task');
    
    const boards = await Board.find({ userId: req.user._id });
    const tasks = await Task.find({ userId: req.user._id });
    
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status !== 'done').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    
    const productivity = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100) 
      : 0;
    
    // Get activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTasks = tasks.filter(t => new Date(t.createdAt) > sevenDaysAgo);
    
    res.json({
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalBoards: boards.length,
      activeDays: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)),
      productivity,
      recentActivity: recentTasks.length,
      memberSince: req.user.createdAt
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
};

// @desc    Get user activities
// @route   GET /api/auth/activities
// @access  Private
const getUserActivities = async (req, res) => {
  try {
    const Task = require('../models/Task');
    
    const recentTasks = await Task.find({ userId: req.user._id })
      .sort('-updatedAt')
      .limit(20);
    
    const activities = recentTasks.map(task => {
      let type = 'update';
      let description = '';
      
      if (task.status === 'done' && task.updatedAt > task.createdAt) {
        type = 'complete';
        description = `Completed task: ${task.title}`;
      } else if (task.createdAt === task.updatedAt) {
        type = 'create';
        description = `Created task: ${task.title}`;
      } else {
        description = `Updated task: ${task.title}`;
      }
      
      return {
        type,
        description,
        timestamp: task.updatedAt,
        taskId: task._id,
        status: task.status
      };
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error while fetching activities' });
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
const updateUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { theme, notifications, emailNotifications, language, compactView } = req.body;
    
    user.settings = {
      theme: theme || user.settings?.theme || 'light',
      notifications: notifications !== undefined ? notifications : (user.settings?.notifications ?? true),
      emailNotifications: emailNotifications !== undefined ? emailNotifications : (user.settings?.emailNotifications ?? true),
      language: language || user.settings?.language || 'en',
      compactView: compactView !== undefined ? compactView : (user.settings?.compactView ?? false)
    };
    
    await user.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error while updating settings' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  getUserStats,
  getUserActivities,
  updateUserSettings
};