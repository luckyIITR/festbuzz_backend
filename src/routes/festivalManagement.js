const express = require('express');
const router = express.Router();
const FestivalUserRole = require('../models/FestivalUserRole');
const User = require('../models/User');
const Fest = require('../models/Fest');
const { authMiddleware, permitRoles, canManageFestival } = require('../middlewares/auth');

// Assign role to user in a festival (only superadmin or festival admin can do this)
router.post('/:festId/assign-role', authMiddleware, canManageFestival, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const { festId } = req.params;

    // Validate role
    const validRoles = ['admin', 'festival head', 'event manager', 'event coordinator', 'event volunteer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if festival exists
    const fest = await Fest.findById(festId);
    if (!fest) {
      return res.status(404).json({ msg: 'Festival not found' });
    }

    // Create or update festival role
    const festivalRole = await FestivalUserRole.findOneAndUpdate(
      { userId, festId },
      { 
        role, 
        assignedBy: req.user.id,
        isActive: true 
      },
      { upsert: true, new: true }
    );

    res.json({ msg: 'Role assigned successfully', festivalRole });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove role from user in a festival
router.delete('/:festId/remove-role/:userId', authMiddleware, canManageFestival, async (req, res) => {
  try {
    const { festId, userId } = req.params;

    const festivalRole = await FestivalUserRole.findOneAndUpdate(
      { userId, festId },
      { isActive: false },
      { new: true }
    );

    if (!festivalRole) {
      return res.status(404).json({ msg: 'Role assignment not found' });
    }

    res.json({ msg: 'Role removed successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users with roles in a festival
router.get('/:festId/users', authMiddleware, canManageFestival, async (req, res) => {
  try {
    const { festId } = req.params;

    const festivalRoles = await FestivalUserRole.find({ 
      festId, 
      isActive: true 
    }).populate('userId', 'name email');

    res.json(festivalRoles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's role in a specific festival
router.get('/:festId/my-role', authMiddleware, async (req, res) => {
  try {
    const { festId } = req.params;
    const userId = req.user.id;

    // Superadmin has access to all festivals
    if (req.user.role === 'superadmin') {
      return res.json({ role: 'superadmin', hasAccess: true });
    }

    const festivalRole = await FestivalUserRole.findOne({
      userId,
      festId,
      isActive: true
    });

    if (!festivalRole) {
      return res.json({ role: null, hasAccess: false });
    }

    res.json({ role: festivalRole.role, hasAccess: true });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 