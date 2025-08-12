

// Role-based permission middleware
const rolePermissions = {
  // Superadmin: everything
  superadmin: {
    canCreateFests: true,
    canManageFests: true,
    canCreateEvents: true,
    canModifyEvents: true,
    canManageEvents: true,
    canAssignEventRoles: true,
    canSendCertificates: true,
    canPublishResults: true,
    canViewEventDetails: true,
    canViewParticipants: true,
    canManageUsers: true,
    canAccessAllFestivals: true
  },

  // Admin: Festival management + event management
  admin: {
    canCreateFests: true,
    canManageFests: true,
    canCreateEvents: true,
    canModifyEvents: true,
    canManageEvents: true,
    canAssignEventRoles: true,
    canSendCertificates: true,
    canPublishResults: true,
    canViewEventDetails: true,
    canViewParticipants: true,
    canManageUsers: false,
    canAccessAllFestivals: false
  },

  // Festival head: Same as admin but for specific festivals
  'festival head': {
    canCreateFests: false,
    canManageFests: true,
    canCreateEvents: true,
    canModifyEvents: true,
    canManageEvents: true,
    canAssignEventRoles: true,
    canSendCertificates: true,
    canPublishResults: true,
    canViewEventDetails: true,
    canViewParticipants: true,
    canManageUsers: false,
    canAccessAllFestivals: false
  },

  // Event manager: Event management only
  'event manager': {
    canCreateFests: false,
    canManageFests: false,
    canCreateEvents: true,
    canModifyEvents: true,
    canManageEvents: true,
    canAssignEventRoles: true,
    canSendCertificates: true,
    canPublishResults: true,
    canViewEventDetails: true,
    canViewParticipants: true,
    canManageUsers: false,
    canAccessAllFestivals: false
  },

  // Event coordinator: View events and participants
  'event coordinator': {
    canCreateFests: false,
    canManageFests: false,
    canCreateEvents: false,
    canModifyEvents: false,
    canManageEvents: false,
    canAssignEventRoles: false,
    canSendCertificates: false,
    canPublishResults: false,
    canViewEventDetails: true,
    canViewParticipants: true,
    canManageUsers: false,
    canAccessAllFestivals: false
  },

  // Event volunteer: View participants only
  'event volunteer': {
    canCreateFests: false,
    canManageFests: false,
    canCreateEvents: false,
    canModifyEvents: false,
    canManageEvents: false,
    canAssignEventRoles: false,
    canSendCertificates: false,
    canPublishResults: false,
    canViewEventDetails: false,
    canViewParticipants: true,
    canManageUsers: false,
    canAccessAllFestivals: false
  },

  // Participant: Basic user permissions
  participant: {
    canCreateFests: false,
    canManageFests: false,
    canCreateEvents: false,
    canModifyEvents: false,
    canManageEvents: false,
    canAssignEventRoles: false,
    canSendCertificates: false,
    canPublishResults: false,
    canViewEventDetails: false,
    canViewParticipants: false,
    canManageUsers: false,
    canAccessAllFestivals: false
  }
};

// Helper function to check if user has permission
const hasPermission = (userRole, permission) => {
  return rolePermissions[userRole] && rolePermissions[userRole][permission];
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    // Superadmin has all permissions
    if (userRole === 'superadmin') {
      return next();
    }

    // Check if user has the required permission
    if (hasPermission(userRole, permission)) {
      return next();
    }

    return res.status(403).json({ 
      msg: 'Access denied: Insufficient permissions',
      requiredPermission: permission,
      userRole: userRole
    });
  };
};

// Middleware to check festival-specific permissions
const requireFestivalPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const festId = req.params.festId || req.body.festId || req.query.festId;

      // Superadmin has all permissions
      if (userRole === 'superadmin') {
        return next();
      }

      // For global roles (admin), check if they have the permission
      if (userRole === 'admin' && hasPermission(userRole, permission)) {
        return next();
      }

      return res.status(403).json({ 
        msg: 'Access denied: Insufficient permissions for this festival',
        requiredPermission: permission,
        userRole: userRole
      });
    } catch (err) {
      return res.status(500).json({ msg: 'Server error' });
    }
  };
};

// Specific permission middlewares
const canCreateFests = requirePermission('canCreateFests');
const canManageFests = requireFestivalPermission('canManageFests');
const canCreateEvents = requireFestivalPermission('canCreateEvents');
const canModifyEvents = requireFestivalPermission('canModifyEvents');
const canManageEvents = requireFestivalPermission('canManageEvents');
const canAssignEventRoles = requireFestivalPermission('canAssignEventRoles');
const canSendCertificates = requireFestivalPermission('canSendCertificates');
const canPublishResults = requireFestivalPermission('canPublishResults');
const canViewEventDetails = requireFestivalPermission('canViewEventDetails');
const canViewParticipants = requireFestivalPermission('canViewParticipants');
const canManageUsers = requirePermission('canManageUsers');

// Participant-specific permissions (no middleware needed, handled in routes)
const participantPermissions = {
  canSignUp: true,
  canEditProfile: true,
  canExploreFests: true,
  canWishlistFests: true,
  canParticipateInEvents: true,
  canReceiveTickets: true,
  canViewResults: true,
  canProvideReviews: true,
  canViewCertificates: true,
  canCheckUpdates: true,
  canContactOrganizers: true,
  canAccessRecentlyViewed: true
};

module.exports = {
  rolePermissions,
  hasPermission,
  requirePermission,
  requireFestivalPermission,
  canCreateFests,
  canManageFests,
  canCreateEvents,
  canModifyEvents,
  canManageEvents,
  canAssignEventRoles,
  canSendCertificates,
  canPublishResults,
  canViewEventDetails,
  canViewParticipants,
  canManageUsers,
  participantPermissions
};
