# Registration API - Frontend Documentation

## Quick Start

### Base URL
```
https://your-api-domain.com/api/registration
```

### Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Fest Registration

### Register for a Fest
```http
POST /fest
```

**Request Body:**
```json
{
  "festId": "fest_id_here",
  "phone": "1234567890",
  "dateOfBirth": "1995-01-01",
  "gender": "Male",
  "city": "Mumbai",
  "state": "Maharashtra",
  "instituteName": "IIT Bombay",
  "answers": ["answer1", "answer2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fest registration successful",
  "data": {
    "registration": {
      "id": "registration_id",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "answers": ["answer1", "answer2"],
      "registeredAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 2. Event Registration

### Solo Event Registration
```http
POST /event/solo
```

**Request Body:**
```json
{
  "festId": "fest_id_here",
  "eventId": "event_id_here",
  "answers": ["answer1", "answer2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event registration successful",
  "data": {
    "registration": {
      "id": "registration_id",
      "type": "solo",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "answers": ["answer1", "answer2"],
      "registeredAt": "2024-01-01T00:00:00.000Z"
    },
    "event": {
      "id": "event_id",
      "name": "Hackathon 2024",
      "description": "24-hour coding challenge",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-02T00:00:00.000Z",
      "location": "Main Hall",
      "mode": "offline",
      "venue": "IIT Bombay"
    }
  }
}
```

---

## 3. Team Registration (via Team API)

### Create Team
```http
POST /api/teams/create
```

**Request Body:**
```json
{
  "eventId": "event_id_here",
  "teamName": "Team Awesome",
  "description": "Our awesome team"
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

### Join Team
```http
POST /api/teams/join
```

**Request Body:**
```json
{
  "teamCode": "TEAM-A1B2C3"
}
```

---

## 4. Get User Registrations

### Get My Fest Registrations
```http
GET /fest/me
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "registrationId": "registration_id",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "answers": ["answer1", "answer2"],
      "registeredAt": "2024-01-01T00:00:00.000Z",
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024",
        "description": "Annual tech festival",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-03T00:00:00.000Z",
        "location": "IIT Bombay"
      }
    }
  ]
}
```

### Get My Event Registrations
```http
GET /event/me
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "registrationId": "registration_id",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "type": "solo",
      "answers": ["answer1", "answer2"],
      "registeredAt": "2024-01-01T00:00:00.000Z",
      "event": {
        "id": "event_id",
        "name": "Hackathon 2024",
        "description": "24-hour coding challenge",
        "isTeamEvent": false
      },
      "team": null,
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024"
      }
    },
    {
      "registrationId": "registration_id_2",
      "status": "confirmed",
      "ticket": "TICKET-789012",
      "qrCode": "data:image/png;base64,...",
      "type": "team",
      "answers": ["answer1", "answer2"],
      "registeredAt": "2024-01-01T00:00:00.000Z",
      "event": {
        "id": "event_id_2",
        "name": "Robotics Competition",
        "description": "Build and compete",
        "isTeamEvent": true
      },
      "team": {
        "id": "team_id",
        "teamName": "Team Awesome",
        "teamCode": "TEAM-A1B2C3",
        "members": ["user_id", "user_id_2"]
      },
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024"
      }
    }
  ]
}
```

---

## 5. Check Registration Status

### Check Fest Registration Status
```http
GET /fest/{festId}/status
```

**Response:**
```json
{
  "success": true,
  "message": "Registration found",
  "data": {
    "isRegistered": true,
    "registration": {
      "id": "registration_id",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "phone": "1234567890",
      "dateOfBirth": "1995-01-01T00:00:00.000Z",
      "gender": "Male",
      "city": "Mumbai",
      "state": "Maharashtra",
      "instituteName": "IIT Bombay",
      "answers": ["answer1", "answer2"],
      "fest": {
        "id": "fest_id",
        "name": "TechFest 2024"
      }
    }
  }
}
```

---

## 6. QR Code Endpoints

### Get Fest QR Code
```http
GET /fest/qrcode/{registrationId}
```

### Get Event QR Code
```http
GET /event/qrcode/{registrationId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

## 7. Unregister

### Unregister from Fest
```http
DELETE /fest/{festId}/unregister
```

### Unregister from Event
```http
DELETE /event/{eventId}/unregister
```

---

## Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes
- `400` - Bad Request (missing fields, invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found (fest/event not found)
- `409` - Conflict (already registered, team full)
- `500` - Server Error

### Example Error Responses

**Already Registered:**
```json
{
  "success": false,
  "message": "Already registered for this fest"
}
```

**Team Event Error:**
```json
{
  "success": false,
  "message": "This is a team event. Use team registration instead."
}
```

**Team Full:**
```json
{
  "success": false,
  "message": "Team is full"
}
```

---

## Frontend Integration Examples

### React Hook for Registration
```javascript
const useRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerForFest = async (festData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/registration/fest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(festData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/registration/event/solo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerForFest,
    registerForEvent,
    loading,
    error
  };
};
```

### Registration Component
```javascript
const EventRegistration = ({ event, festId }) => {
  const [registrationType, setRegistrationType] = useState('solo');
  const { registerForEvent, loading, error } = useRegistration();

  const handleSoloRegistration = async () => {
    try {
      const result = await registerForEvent({
        festId,
        eventId: event.id,
        answers: []
      });
      
      // Show success message with QR code
      alert('Registration successful!');
      // Navigate to QR code page or show QR code modal
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Register for {event.name}</h2>
      
      {event.isTeamEvent ? (
        <div>
          <p>This is a team event. Use team registration.</p>
          <Link to={`/teams/create?eventId=${event.id}`}>
            Create Team
          </Link>
          <Link to={`/teams/join?eventId=${event.id}`}>
            Join Team
          </Link>
        </div>
      ) : (
        <button 
          onClick={handleSoloRegistration}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Solo'}
        </button>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

---

## Quick Reference

### Registration Flow
1. **Fest Registration** → `POST /fest`
2. **Solo Event** → `POST /event/solo`
3. **Team Event** → `POST /api/teams/create` or `POST /api/teams/join`

### Check Status
- **Fest Status** → `GET /fest/{festId}/status`
- **My Registrations** → `GET /fest/me` and `GET /event/me`

### QR Codes
- **Fest QR** → `GET /fest/qrcode/{id}`
- **Event QR** → `GET /event/qrcode/{id}`

### Unregister
- **From Fest** → `DELETE /fest/{festId}/unregister`
- **From Event** → `DELETE /event/{eventId}/unregister` 