# Role-Based Access Control (RBAC) Implementation

This document outlines the role-based permissions implemented in the Festbuz backend system.

## User Roles

The system supports the following roles:

1. **superadmin** - Full system access
2. **admin** - Festival and event management
3. **festival head** - Festival-specific management
4. **event manager** - Event management
5. **event coordinator** - Event viewing and participant management
6. **event volunteer** - Participant viewing only
7. **participant** - Basic user permissions

## Permission Matrix

| Permission | superadmin | admin | festival head | event manager | event coordinator | event volunteer | participant |
|------------|------------|-------|---------------|---------------|-------------------|-----------------|-------------|
| Create Fests | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Fests | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Modify Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Event Roles | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send Certificates | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish Results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Event Details | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Participants | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Participant Permissions

Participants have the following specific permissions:
- Sign up / Login
- Edit Profile
- Explore and filter fests
- Wishlist fests
- Participate in events (solo or team)
- Receive tickets
- View results
- Provide reviews
- View and download certificates
- Check updates
- Contact organizers
- Access recently viewed fests

## Route-Level Permissions

### Fest Routes (`/api/fests`)
- `POST /` - Create Fest: `canCreateFests`
- `PUT /:id` - Update Fest: `canManageFests`
- `DELETE /:id` - Delete Fest: `canManageFests`
- `POST /:festId/events` - Create Event: `canCreateEvents`
- `PUT /:festId/events/:eventId` - Update Event: `canModifyEvents`
- `DELETE /:festId/events/:eventId` - Delete Event: `canManageEvents`

### Event Routes (`/api/events`)
- `POST /` - Create Event: `canCreateEvents`
- `POST /draft` - Save Draft: `canCreateEvents`
- `POST /:id/publish` - Publish Event: `canModifyEvents`
- `POST /:id/unpublish` - Unpublish Event: `canModifyEvents`
- `POST /:id/archive` - Archive Event: `canManageEvents`
- `GET /:id/status` - Get Status: `canViewEventDetails`
- `GET /drafts` - Get Drafts: `canViewEventDetails`
- `PUT /:id` - Update Event: `canModifyEvents`
- `PUT /:id/draft` - Update Draft: `canModifyEvents`
- `DELETE /:id` - Delete Event: `canManageEvents`
- `POST /:id/judges` - Add Judge: `canManageEvents`
- `DELETE /:id/judges/:judgeIndex` - Remove Judge: `canManageEvents`
- `POST /:id/roles` - Assign Role: `canAssignEventRoles`
- `DELETE /:id/roles/:roleIndex` - Remove Role: `canAssignEventRoles`

### Certificate Routes (`/api/certificates`)
- `POST /template` - Create Template: `canSendCertificates`
- `POST /issue` - Issue Certificates: `canSendCertificates`

### Registration Routes (`/api/registration`)
- `GET /fest/:festId/count` - Get Count: `canViewParticipants`
- `GET /fest/:festId/stats` - Get Stats: `canViewParticipants`
- `GET /event/:eventId/count` - Get Count: `canViewParticipants`
- `GET /event/:eventId/stats` - Get Stats: `canViewParticipants`
- `GET /fest/:festId/candidates` - Get Candidates: `canViewParticipants`
- `GET /event/:eventId/candidates` - Get Candidates: `canViewParticipants`

### Festival Management Routes (`/api/festival-management`)
- `POST /:festId/assign-role` - Assign Role: `canAssignEventRoles`
- `DELETE /:festId/remove-role/:userId` - Remove Role: `canAssignEventRoles`
- `GET /:festId/users` - Get Users: `canAssignEventRoles`

## Middleware Implementation

### Role Permissions Middleware (`src/middlewares/rolePermissions.js`)

The system uses a centralized permission system with the following key functions:

1. **`requirePermission(permission)`** - Checks global permissions
2. **`requireFestivalPermission(permission)`** - Checks festival-specific permissions
3. **`hasPermission(userRole, permission)`** - Helper function to check permissions

### Permission Checks

- **Global Permissions**: Checked against the user's global role
- **Festival-Specific Permissions**: Checked against the user's role in a specific festival
- **Superadmin Override**: Superadmin has access to all permissions
- **Admin Override**: Admin has access to most permissions globally

## Festival-Specific Roles

Users can have different roles in different festivals:

- A user can be a "festival head" in one festival
- The same user can be an "event manager" in another festival
- Global roles (superadmin, admin) have system-wide access

## Security Features

1. **JWT Authentication**: All protected routes require valid JWT tokens
2. **Role Validation**: Roles are validated against the predefined list
3. **Permission Granularity**: Fine-grained permissions for different operations
4. **Festival Isolation**: Users can only access festivals they have roles in
5. **Audit Trail**: All role assignments are tracked with timestamps

## Usage Examples

### Checking Permissions in Controllers

```javascript
// In a route handler
router.get('/fest/:festId/stats', authMiddleware, canViewParticipants, async (req, res) => {
  // Only users with canViewParticipants permission can access this
});
```

### Festival-Specific Permission Check

```javascript
// The middleware automatically checks if the user has the required role
// in the specific festival mentioned in the URL parameters
router.post('/:festId/events', authMiddleware, canCreateEvents, async (req, res) => {
  // Only users with canCreateEvents permission for this specific festival can access this
});
```

## Error Responses

When permission checks fail, the system returns:

```json
{
  "msg": "Access denied: Insufficient permissions",
  "requiredPermission": "canCreateEvents",
  "userRole": "participant"
}
```

For festival-specific permissions:

```json
{
  "msg": "Access denied: Insufficient permissions for this festival",
  "requiredPermission": "canManageEvents",
  "userRole": "participant"
}
```

## Best Practices

1. **Always use middleware**: Don't implement permission checks manually in controllers
2. **Be specific**: Use the most restrictive permission that fits the operation
3. **Test thoroughly**: Ensure all role combinations work as expected
4. **Document changes**: Update this document when adding new permissions
5. **Security first**: When in doubt, use more restrictive permissions

## Future Enhancements

1. **Dynamic Permissions**: Allow custom permission sets per festival
2. **Permission Groups**: Group related permissions for easier management
3. **Audit Logging**: Enhanced logging of permission checks and violations
4. **Permission Inheritance**: Allow permissions to be inherited from parent roles
5. **Time-based Permissions**: Allow permissions to expire or be time-limited
