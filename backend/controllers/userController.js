const User = require('../models/User');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Server-side confirm-password validation
    if (typeof confirmPassword !== 'undefined' && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Server-side password complexity validation
    const passwordChecks = [];
    if (!password || password.length < 8) passwordChecks.push('Password must be at least 8 characters long.');
    if (!/[A-Z]/.test(password)) passwordChecks.push('Password must include at least one uppercase letter.');
    if (!/[a-z]/.test(password)) passwordChecks.push('Password must include at least one lowercase letter.');
    if (!/[0-9]/.test(password)) passwordChecks.push('Password must include at least one number.');
    if (!/[!@#$%^&*(),.?"':{}|<>\[\]\\/;_+=~-]/.test(password)) passwordChecks.push('Password must include at least one special character.');
    if (passwordChecks.length > 0) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements.', errors: passwordChecks });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with default role 'user'
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("email", email);
    // console.log("password", password);
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    // cleaned logs

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    // password verified

    // Generate token
    const token = generateToken(user._id);

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({ message: 'Login successful.', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logout successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Add to following/followers if not already
    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }
    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
      await targetUser.save();
    }
    res.json({ message: 'Followed user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);
    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    await currentUser.save();
    await targetUser.save();
    res.json({ message: 'Unfollowed user.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username email');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username email');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get public user profile by ID
const getUserById = async (req, res) => {
  try {
    console.log('getUserById called with id:', req.params.id, 'type:', typeof req.params.id);
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserById,
};
