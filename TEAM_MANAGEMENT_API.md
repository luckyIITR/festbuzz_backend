# Team Management API Documentation

## Overview

The Team Management API provides a comprehensive system for handling team-based event registrations. This system supports both solo and team events with unique team codes for easy team joining.

## Key Features

- **Unique Team Codes**: Each team gets a unique code (e.g., "TEAM-A1B2C3") for easy joining
- **Team Size Management**: Automatic validation of team size limits
- **Leadership Transfer**: Team leaders can transfer leadership to other members
- **Member Management**: Add/remove members with proper validation
- **Event Registration Integration**: Automatic event registration when joining teams
- **QR Code Generation**: Each registration gets a unique QR code

## API Endpoints

### 1. Create a Team

**POST** `/api/teams/create`

Create a new team for a team event.

**Request Body:**
```json
{
  "eventId": "event_id_here",
  "teamName": "Team Awesome",
  "description": "Optional team description",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team created successfully",
  "data": {
    "team": {
      "id": "team_id",
      "teamName": "Team Awesome",
      "teamCode": "TEAM-A1B2C3",
      "leaderId": "user_id",
      "members": ["user_id"],
      "currentSize": 1,
      "maxSize": 4,
      "availableSlots": 3,
      "status": "active",
      "description": "Optional team description",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "registration": {
      "id": "registration_id",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "status": "confirmed"
    }
  }
}
```

### 2. Join a Team

**POST** `/api/teams/join`

Join an existing team using the team code.

**Request Body:**
```json
{
  "teamCode": "TEAM-A1B2C3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined team",
  "data": {
    "team": {
      "id": "team_id",
      "teamName": "Team Awesome",
      "teamCode": "TEAM-A1B2C3",
      "leaderId": "user_id",
      "members": ["user_id", "new_user_id"],
      "currentSize": 2,
      "maxSize": 4,
      "availableSlots": 2,
      "status": "active"
    },
    "registration": {
      "id": "registration_id",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "status": "confirmed"
    }
  }
}
```

### 3. Get Team Details

**GET** `/api/teams/:teamId`

Get detailed information about a specific team.

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "team_id",
      "teamName": "Team Awesome",
      "teamCode": "TEAM-A1B2C3",
      "leader": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [
        {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "instituteName": "University of Example"
        }
      ],
      "currentSize": 1,
      "maxSize": 4,
      "availableSlots": 3,
      "status": "active",
      "description": "Optional team description",
      "notes": "Optional notes",
      "event": {
        "id": "event_id",
        "name": "Hackathon 2024",
        "description": "24-hour coding challenge",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-02T00:00:00.000Z",
        "location": "Main Hall"
      },
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "userRole": {
      "isMember": true,
      "isLeader": true,
      "canManage": true
    }
  }
}
```

### 4. Leave a Team

**POST** `/api/teams/:teamId/leave`

Leave a team (cannot be used by team leader).

**Response:**
```json
{
  "success": true,
  "message": "Successfully left team",
  "data": {
    "teamId": "team_id",
    "teamName": "Team Awesome",
    "currentSize": 1,
    "availableSlots": 3
  }
}
```

### 5. Remove Team Member

**POST** `/api/teams/:teamId/remove-member`

Remove a member from the team (leader only).

**Request Body:**
```json
{
  "memberId": "user_id_to_remove"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully",
  "data": {
    "teamId": "team_id",
    "teamName": "Team Awesome",
    "currentSize": 2,
    "availableSlots": 2,
    "removedMemberId": "user_id_to_remove"
  }
}
```

### 6. Transfer Team Leadership

**POST** `/api/teams/:teamId/transfer-leadership`

Transfer team leadership to another member.

**Request Body:**
```json
{
  "newLeaderId": "new_leader_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leadership transferred successfully",
  "data": {
    "teamId": "team_id",
    "teamName": "Team Awesome",
    "newLeaderId": "new_leader_user_id",
    "currentSize": 3
  }
}
```

### 7. Disband Team

**POST** `/api/teams/:teamId/disband`

Disband the entire team (leader only).

**Response:**
```json
{
  "success": true,
  "message": "Team disbanded successfully",
  "data": {
    "teamId": "team_id",
    "teamName": "Team Awesome",
    "cancelledRegistrations": 3
  }
}
```

### 8. Get User's Teams

**GET** `/api/teams/my-teams`

Get all teams that the user is a member of.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "team_id",
      "teamName": "Team Awesome",
      "teamCode": "TEAM-A1B2C3",
      "leader": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [
        {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "instituteName": "University of Example"
        }
      ],
      "currentSize": 1,
      "maxSize": 4,
      "availableSlots": 3,
      "status": "active",
      "description": "Optional team description",
      "event": {
        "id": "event_id",
        "name": "Hackathon 2024",
        "description": "24-hour coding challenge",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-02T00:00:00.000Z",
        "location": "Main Hall"
      },
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024"
      },
      "isLeader": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 9. Get Available Teams for Event

**GET** `/api/teams/event/:eventId/available`

Get all teams for an event that have available slots and the user is not already a member of.

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "event_id",
      "name": "Hackathon 2024",
      "description": "24-hour coding challenge",
      "teamSize": 4
    },
    "teams": [
      {
        "id": "team_id",
        "teamName": "Team Awesome",
        "teamCode": "TEAM-A1B2C3",
        "leader": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "instituteName": "University of Example"
        },
        "currentSize": 2,
        "maxSize": 4,
        "availableSlots": 2,
        "description": "Optional team description",
        "event": {
          "id": "event_id",
          "name": "Hackathon 2024",
          "description": "24-hour coding challenge"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Error Responses

### Common Error Codes

- **400 Bad Request**: Missing required fields or invalid data
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: User doesn't have permission for the action
- **404 Not Found**: Team, event, or user not found
- **409 Conflict**: User already in team, team is full, etc.
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "message": "Team is full"
}
```

## Business Rules

### Team Creation
1. User must be registered for the fest before creating a team
2. Event must be a team event (`isTeamEvent: true`)
3. User cannot be in multiple teams for the same event
4. Team leader is automatically added as the first member

### Team Joining
1. User must be registered for the fest before joining a team
2. Team must have available slots
3. User cannot be in multiple teams for the same event
4. Team must be active (not disbanded)

### Team Management
1. Only team leader can remove members
2. Team leader cannot leave the team (must transfer leadership or disband)
3. Leadership can only be transferred to existing team members
4. When a team is disbanded, all event registrations are cancelled

### Event Registration
1. Solo events cannot have team registrations
2. Team events cannot have solo registrations
3. Each team member gets their own event registration
4. Event registrations are automatically created when joining teams

## Usage Examples

### Frontend Integration

```javascript
// Create a team
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
      description: 'Our awesome team'
    })
  });
  return response.json();
};

// Join a team
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

// Get available teams
const getAvailableTeams = async (eventId) => {
  const response = await fetch(`/api/teams/event/${eventId}/available`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Mobile App Integration

```javascript
// Scan team code QR code
const scanTeamCode = async (scannedCode) => {
  const response = await fetch('/api/teams/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ teamCode: scannedCode })
  });
  return response.json();
};
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only manage teams they are members of
3. **Validation**: All inputs are validated server-side
4. **Rate Limiting**: Consider implementing rate limiting for team creation/joining
5. **Audit Trail**: All team actions are logged with timestamps

## Performance Considerations

1. **Indexing**: Database indexes on frequently queried fields
2. **Pagination**: Available teams endpoint supports pagination
3. **Caching**: Consider caching team details for frequently accessed teams
4. **Optimization**: Efficient queries with proper population of related data 