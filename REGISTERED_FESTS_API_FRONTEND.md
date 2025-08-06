# Registered Fests & Events API - Frontend Guide

## Get My Registered Fests
```http
GET /api/registration/fest/me
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "registrationId": "reg_id",
      "status": "confirmed",
      "ticket": "TICKET-123456",
      "qrCode": "data:image/png;base64,...",
      "answers": ["Answer 1", "Answer 2"],
      "registeredAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "fest": {
        "_id": "fest_id",
        "name": "TechFest 2024",
        "description": "Annual tech festival",
        "startDate": "2024-03-15T09:00:00.000Z",
        "endDate": "2024-03-17T18:00:00.000Z",
        "location": "IIT Campus",
        "image": "fest_image_url",
        "banner": "fest_banner_url",
        "status": "active"
      }
    }
  ]
}
```

## Get My Registered Events
```http
GET /api/registration/event/me
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "registrationId": "reg_id",
      "status": "confirmed",
      "ticket": "TICKET-789012",
      "qrCode": "data:image/png;base64,...",
      "type": "team",
      "answers": ["Answer 1", "Answer 2"],
      "registeredAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "event": {
        "_id": "event_id",
        "name": "Hackathon 2024",
        "description": "24-hour coding challenge",
        "startDate": "2024-03-15T10:00:00.000Z",
        "endDate": "2024-03-16T10:00:00.000Z",
        "location": "Computer Lab",
        "image": "event_image_url",
        "type": "competition",
        "maxParticipants": 50
      },
      "team": {
        "_id": "team_id",
        "teamName": "Code Warriors",
        "members": ["user1_id", "user2_id", "user3_id"]
      },
      "fest": {
        "_id": "fest_id",
        "name": "TechFest 2024"
      }
    }
  ]
}
```

## Quick Implementation

### React Hook
```javascript
const useMyRegistrations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [festRegistrations, setFestRegistrations] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch fest registrations
      const festResponse = await fetch('/api/registration/fest/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const festResult = await festResponse.json();

      // Fetch event registrations
      const eventResponse = await fetch('/api/registration/event/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventResult = await eventResponse.json();

      if (festResult.success && eventResult.success) {
        setFestRegistrations(festResult.data);
        setEventRegistrations(eventResult.data);
      } else {
        setError('Failed to fetch registrations');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { 
    festRegistrations, 
    eventRegistrations, 
    fetchMyRegistrations, 
    loading, 
    error 
  };
};
```

### Usage Example
```javascript
const MyRegistrations = () => {
  const { 
    festRegistrations, 
    eventRegistrations, 
    fetchMyRegistrations, 
    loading, 
    error 
  } = useMyRegistrations();

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>My Fest Registrations ({festRegistrations.length})</h2>
      {festRegistrations.map(reg => (
        <div key={reg.registrationId} className="fest-card">
          <h3>{reg.fest.name}</h3>
          <p>Status: {reg.status}</p>
          <p>Ticket: {reg.ticket}</p>
          <p>Registered: {new Date(reg.registeredAt).toLocaleDateString()}</p>
        </div>
      ))}

      <h2>My Event Registrations ({eventRegistrations.length})</h2>
      {eventRegistrations.map(reg => (
        <div key={reg.registrationId} className="event-card">
          <h3>{reg.event.name}</h3>
          <p>Fest: {reg.fest.name}</p>
          <p>Type: {reg.type}</p>
          <p>Status: {reg.status}</p>
          {reg.team && (
            <p>Team: {reg.team.teamName}</p>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Available Data

### Fest Registration Data:
- ✅ Registration ID and status
- ✅ Ticket and QR code
- ✅ Registration dates
- ✅ Fest details (name, dates, location, images)
- ✅ Custom answers

### Event Registration Data:
- ✅ Registration ID and status
- ✅ Ticket and QR code
- ✅ Registration type (solo/team)
- ✅ Event details (name, dates, location, type)
- ✅ Team information (if team event)
- ✅ Fest information
- ✅ Custom answers

## Notes
- Both endpoints require authentication
- Returns empty array if no registrations
- Fest registrations include complete fest details
- Event registrations include event, team, and fest details 