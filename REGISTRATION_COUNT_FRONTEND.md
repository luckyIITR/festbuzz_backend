# Registration Count API - Frontend Guide

## Fest Endpoints

### Get Fest Registration Count
```http
GET /api/registration/fest/:festId/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festId": "fest_id",
    "festName": "TechFest 2024",
    "totalRegistrations": 150,
    "confirmedCount": 120,
    "pendingCount": 25,
    "cancelledCount": 5,
    "breakdown": {
      "confirmed": 120,
      "pending": 25,
      "cancelled": 5
    }
  }
}
```

### Get Fest Detailed Stats (Admin Only)
```http
GET /api/registration/fest/:festId/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festId": "fest_id",
    "festName": "TechFest 2024",
    "totalRegistrations": 150,
    "confirmedCount": 120,
    "pendingCount": 25,
    "cancelledCount": 5,
    "recentRegistrations": 45,
    "genderDistribution": {
      "Male": 85,
      "Female": 60,
      "Other": 5
    },
    "topInstitutes": [
      { "_id": "IIT Bombay", "count": 25 },
      { "_id": "BITS Pilani", "count": 20 }
    ]
  }
}
```

## Event Endpoints

### Get Event Registration Count
```http
GET /api/registration/event/:eventId/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "eventName": "Hackathon 2024",
    "festId": "fest_id",
    "totalRegistrations": 75,
    "confirmedCount": 60,
    "pendingCount": 10,
    "cancelledCount": 5,
    "soloCount": 45,
    "teamCount": 30,
    "breakdown": {
      "confirmed": 60,
      "pending": 10,
      "cancelled": 5,
      "solo": 45,
      "team": 30
    }
  }
}
```

### Get Event Detailed Stats (Admin Only)
```http
GET /api/registration/event/:eventId/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "event_id",
    "eventName": "Hackathon 2024",
    "festId": "fest_id",
    "totalRegistrations": 75,
    "confirmedCount": 60,
    "pendingCount": 10,
    "cancelledCount": 5,
    "recentRegistrations": 25,
    "soloCount": 45,
    "teamCount": 30,
    "genderDistribution": {
      "Male": 50,
      "Female": 20,
      "Other": 5
    },
    "topInstitutes": [
      { "_id": "IIT Bombay", "count": 15 },
      { "_id": "BITS Pilani", "count": 10 }
    ],
    "teamStats": {
      "totalTeams": 15,
      "avgTeamSize": 2.5
    },
    "breakdown": {
      "confirmed": 60,
      "pending": 10,
      "cancelled": 5,
      "recent": 25,
      "solo": 45,
      "team": 30
    }
  }
}
```

## Quick Implementation

### React Hooks Example
```javascript
// Fest registration count hook
const useFestRegistrationCount = (festId) => {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/registration/fest/${festId}/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setCount(data.data);
      setLoading(false);
    });
  }, [festId]);

  return { count, loading };
};

// Event registration count hook
const useEventRegistrationCount = (eventId) => {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/registration/event/${eventId}/count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setCount(data.data);
      setLoading(false);
    });
  }, [eventId]);

  return { count, loading };
};
```

### Display Components
```javascript
// Fest counter component
const FestRegistrationCounter = ({ festId }) => {
  const { count, loading } = useFestRegistrationCount(festId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>{count.festName}</h3>
      <p>Total: {count.totalRegistrations}</p>
      <p>Confirmed: {count.confirmedCount}</p>
      <p>Pending: {count.pendingCount}</p>
    </div>
  );
};

// Event counter component
const EventRegistrationCounter = ({ eventId }) => {
  const { count, loading } = useEventRegistrationCount(eventId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h3>{count.eventName}</h3>
      <p>Total: {count.totalRegistrations}</p>
      <p>Solo: {count.soloCount}</p>
      <p>Team: {count.teamCount}</p>
      <p>Confirmed: {count.confirmedCount}</p>
    </div>
  );
};
```

## Error Handling
```javascript
const response = await fetch(`/api/registration/fest/${festId}/count`);
if (!response.ok) {
  const error = await response.json();
  console.error(error.message);
  // Handle error (show toast, redirect, etc.)
}
```

## Real-time Updates
```javascript
// Poll every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    // Refetch count data
  }, 30000);
  return () => clearInterval(interval);
}, []);
``` 