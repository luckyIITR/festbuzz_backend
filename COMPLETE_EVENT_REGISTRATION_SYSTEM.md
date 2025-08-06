# Complete Event Registration System

## Overview

I've created a comprehensive event registration system that handles both solo and team events with best practices. The system includes unique team codes, proper validation, and a complete API for team management.

## System Architecture

### 1. Database Models

#### Team Model (`src/models/Team.js`)
- **Unique Team Codes**: Each team gets a unique code (e.g., "TEAM-A1B2C3")
- **Team Size Management**: Automatic validation of team size limits
- **Status Tracking**: Active, full, or disbanded status
- **Leadership Management**: Team leader with transfer capabilities
- **Member Management**: Add/remove members with validation

#### EventRegistration Model (`src/models/EventRegistration.js`)
- **Type Validation**: Solo vs team registration validation
- **Payment Tracking**: Payment status and amount tracking
- **QR Code Generation**: Unique QR codes for each registration
- **Team Role Tracking**: Leader vs member roles in teams

### 2. API Endpoints

#### Team Management (`/api/teams/`)
- `POST /create` - Create a new team
- `POST /join` - Join team using team code
- `GET /:teamId` - Get team details
- `POST /:teamId/leave` - Leave team
- `POST /:teamId/remove-member` - Remove member (leader only)
- `POST /:teamId/transfer-leadership` - Transfer leadership
- `POST /:teamId/disband` - Disband team (leader only)
- `GET /my-teams` - Get user's teams
- `GET /event/:eventId/available` - Get available teams for event

#### Event Registration (`/api/registration/`)
- `POST /event/solo` - Solo event registration
- `POST /event/team` - Team event registration (redirects to team system)
- `GET /event/me` - Get user's event registrations
- `GET /fest/me` - Get user's fest registrations

## Key Features

### 1. Unique Team Code System
```javascript
// Each team gets a unique code like "TEAM-A1B2C3"
team_code: { 
  type: String, 
  unique: true, 
  required: true,
  default: function() {
    return 'TEAM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
```

### 2. Team Size Management
```javascript
// Automatic team size validation
teamSchema.methods.isFull = function() {
  return this.members.length >= this.max_size;
};

teamSchema.methods.addMember = function(userId) {
  if (this.isFull()) {
    throw new Error('Team is full');
  }
  // Add member logic
};
```

### 3. Event Type Validation
```javascript
// Ensure solo events can't have team registrations and vice versa
if (event.isTeamEvent) {
  return res.status(400).json({
    success: false,
    message: 'This is a team event. Use team registration instead.'
  });
}
```

### 4. Automatic Event Registration
When a user joins a team, they automatically get registered for the event:
```javascript
// Create event registration for the new member
const eventRegistration = new EventRegistration({
  teamId: team._id,
  eventId: team.event_id,
  festRegistrationId: festRegistration._id,
  status: 'confirmed',
  ticket: ticketCode,
  qrCode,
  type: 'team',
  teamRole: 'member'
});
```

## Business Rules

### Solo Events
1. User must be registered for the fest first
2. Cannot register for team events using solo registration
3. Cannot be in multiple teams for the same event
4. Each registration gets a unique QR code

### Team Events
1. User must be registered for the fest first
2. Can create a new team or join existing team
3. Team leader cannot leave (must transfer leadership or disband)
4. Only team leader can remove members
5. Leadership can only be transferred to existing members
6. When team is disbanded, all event registrations are cancelled

### Team Management
1. **Team Creation**: Leader creates team, gets unique code
2. **Team Joining**: Members use team code to join
3. **Member Removal**: Only leader can remove members
4. **Leadership Transfer**: Current leader can transfer to any member
5. **Team Disbanding**: Leader can disband team (cancels all registrations)

## Frontend Integration

### 1. Event Registration Flow
```javascript
// Check if event is solo or team
if (event.isTeamEvent) {
  // Show team creation/joining options
  return <TeamRegistrationComponent event={event} />;
} else {
  // Show solo registration
  return <SoloRegistrationComponent event={event} />;
}
```

### 2. Team Creation
```javascript
const createTeam = async (eventId, teamName) => {
  const response = await fetch('/api/teams/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      eventId,
      teamName,
      description: 'Optional description'
    })
  });
  return response.json();
};
```

### 3. Team Joining
```javascript
const joinTeam = async (teamCode) => {
  const response = await fetch('/api/teams/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ teamCode })
  });
  return response.json();
};
```

## Mobile App Features

### 1. QR Code Scanning
```javascript
// Scan team code QR code
const handleBarCodeScanned = ({ data }) => {
  setScanned(true);
  joinTeam(data); // data contains team code
};
```

### 2. Team Code Sharing
```javascript
// Share team code via QR code or text
const shareTeamCode = async (teamCode) => {
  await Clipboard.setStringAsync(teamCode);
  Alert.alert('Copied', 'Team code copied to clipboard');
};
```

## Security Features

### 1. Authentication
- All endpoints require valid JWT token
- User can only manage teams they are members of

### 2. Validation
- Server-side validation for all inputs
- Team size limits enforced
- Event type validation (solo vs team)

### 3. Authorization
- Only team leader can remove members
- Only team leader can transfer leadership
- Only team leader can disband team

## Error Handling

### Common Error Scenarios
1. **Team Full**: User tries to join full team
2. **Already in Team**: User tries to join team they're already in
3. **Not Fest Registered**: User tries to register without fest registration
4. **Invalid Team Code**: User enters invalid team code
5. **Unauthorized Action**: Non-leader tries to remove member

### Error Response Format
```json
{
  "success": false,
  "message": "Team is full"
}
```

## Performance Optimizations

### 1. Database Indexes
```javascript
// Efficient queries for team operations
teamSchema.index({ event_id: 1, status: 1 });
teamSchema.index({ team_code: 1 });
teamSchema.index({ leader_id: 1 });
teamSchema.index({ members: 1 });
```

### 2. Event Registration Indexes
```javascript
// Prevent duplicate registrations
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
eventRegistrationSchema.index({ teamId: 1, eventId: 1 });
```

## Usage Examples

### 1. Create a Team
```bash
curl -X POST /api/teams/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event_id",
    "teamName": "Team Awesome",
    "description": "Our awesome team"
  }'
```

### 2. Join a Team
```bash
curl -X POST /api/teams/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamCode": "TEAM-A1B2C3"
  }'
```

### 3. Register for Solo Event
```bash
curl -X POST /api/registration/event/solo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "festId": "fest_id",
    "eventId": "event_id",
    "answers": ["answer1", "answer2"]
  }'
```

## Testing Scenarios

### 1. Team Creation Flow
1. User registers for fest
2. User creates team for team event
3. Team gets unique code
4. User automatically registered for event
5. QR code generated for registration

### 2. Team Joining Flow
1. User registers for fest
2. User enters team code
3. System validates team exists and has space
4. User added to team
5. User automatically registered for event

### 3. Team Management Flow
1. Leader can remove members
2. Leader can transfer leadership
3. Leader can disband team
4. Members can leave team (except leader)

## Deployment Considerations

### 1. Environment Variables
```bash
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
PORT=3000
```

### 2. Dependencies
```json
{
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^6.0.0",
    "jsonwebtoken": "^8.5.1",
    "qrcode": "^1.4.4",
    "crypto": "^1.0.1"
  }
}
```

### 3. Database Setup
```javascript
// Ensure indexes are created
await Team.createIndexes();
await EventRegistration.createIndexes();
```

## Monitoring and Analytics

### 1. Team Statistics
- Total teams created
- Average team size
- Most popular team sizes
- Team creation trends

### 2. Registration Analytics
- Solo vs team registration ratio
- Registration success rates
- Popular events
- User engagement metrics

## Future Enhancements

### 1. Real-time Updates
- WebSocket integration for live team updates
- Real-time member notifications
- Live team status changes

### 2. Advanced Features
- Team chat functionality
- File sharing within teams
- Team performance tracking
- Team leaderboards

### 3. Mobile Enhancements
- Push notifications for team updates
- Offline team management
- Enhanced QR code scanning
- Team photo sharing

This comprehensive system provides a robust foundation for event registration with both solo and team support, following industry best practices for security, performance, and user experience. 