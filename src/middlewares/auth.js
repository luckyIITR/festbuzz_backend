const jwt = require('jsonwebtoken');
const FestivalUserRole = require('../models/FestivalUserRole');

const authMiddleware = (req, res, next) => {
  // console.log(`authMiddleware`);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Check global roles (superadmin, admin, participant)
const permitRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ msg: 'Access denied' });
  }
  next();
};

// Check festival-specific roles
const permitFestivalRoles = (...roles) => async (req, res, next) => {
  try {
    const festId = req.params.festId || req.body.festId || req.query.festId;
    
    if (!festId) {
      return res.status(400).json({ msg: 'Festival ID required' });
    }

    // Superadmin has access to all festivals
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check if user has a role in this specific festival
    const festivalRole = await FestivalUserRole.findOne({
      userId: req.user.id,
      festId: festId,
      isActive: true
    });

    if (!festivalRole || !roles.includes(festivalRole.role)) {
      return res.status(403).json({ msg: 'Access denied for this festival' });
    }

    // Add festival role to request for use in controllers
    req.user.festivalRole = festivalRole.role;
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Check if user can manage a specific festival (admin or festival head)
const canManageFestival = async (req, res, next) => {
  try {
    const festId = req.params.festId || req.body.festId || req.query.festId;
    
    if (!festId) {
      return res.status(400).json({ msg: 'Festival ID required' });
    }

    // Superadmin can manage all festivals
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check if user is admin or festival head for this festival
    const festivalRole = await FestivalUserRole.findOne({
      userId: req.user.id,
      festId: festId,
      isActive: true,
      role: { $in: ['admin', 'festival head'] }
    });

    if (!festivalRole) {
      return res.status(403).json({ msg: 'Insufficient permissions for this festival' });
    }

    req.user.festivalRole = festivalRole.role;
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { 
  authMiddleware, 
  permitRoles, 
  permitFestivalRoles, 
  canManageFestival 
}; 