# Candidates API - Frontend Guide

## Endpoints

### Get Fest Candidates
```http
GET /api/registration/fest/:festId/candidates?page=1&limit=50&status=confirmed&search=john
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festId": "fest_id",
    "festName": "TechFest 2024",
    "candidates": [
      {
        "registrationId": "reg_id",
        "userId": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "college": "IIT Bombay",
        "instituteName": "IIT Bombay",
        "city": "Mumbai",
        "state": "Maharashtra",
        "gender": "Male",
        "dateOfBirth": "1995-01-15T00:00:00.000Z",
        "registrationStatus": "confirmed",
        "ticket": "TICKET-123456",
        "answers": ["Answer 1", "Answer 2"],
        "registeredAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 250,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "confirmed",
      "search": "john"
    }
  }
}
```

### Get Event Candidates
```http
GET /api/registration/event/:eventId/candidates?page=1&limit=50&status=confirmed&type=solo&search=team
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
    "candidates": [
      {
        "registrationId": "reg_id",
        "userId": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "college": "IIT Bombay",
        "instituteName": "IIT Bombay",
        "city": "Mumbai",
        "state": "Maharashtra",
        "gender": "Male",
        "dateOfBirth": "1995-01-15T00:00:00.000Z",
        "registrationType": "team",
        "registrationStatus": "confirmed",
        "ticket": "TICKET-123456",
        "answers": ["Answer 1", "Answer 2"],
        "teamInfo": {
          "teamId": "team_id",
          "teamName": "Team Alpha",
          "isTeamMember": true
        },
        "registeredAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 150,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "status": "confirmed",
      "type": "solo",
      "search": "team"
    }
  }
}
```

## Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number (default: 1) | `?page=2` |
| `limit` | Number | Items per page (default: 50) | `?limit=25` |
| `status` | String | Filter by status | `?status=confirmed` |
| `type` | String | Filter by type (event only) | `?type=solo` |
| `search` | String | Search in name, email, phone, college, city | `?search=john` |

## Quick Implementation

### React Hook
```javascript
const useCandidates = (type, id, filters = {}) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const params = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 50,
      ...(filters.status && { status: filters.status }),
      ...(filters.type && { type: filters.type }),
      ...(filters.search && { search: filters.search })
    });

    fetch(`/api/registration/${type}/${id}/candidates?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setCandidates(data.data.candidates);
      setPagination(data.data.pagination);
      setLoading(false);
    });
  }, [type, id, filters]);

  return { candidates, pagination, loading };
};
```

### Usage Examples
```javascript
// Get fest candidates
const { candidates, pagination, loading } = useCandidates('fest', festId, {
  status: 'confirmed',
  search: 'john'
});

// Get event candidates
const { candidates, pagination, loading } = useCandidates('event', eventId, {
  type: 'team',
  status: 'confirmed'
});
```

## Error Handling
```javascript
const response = await fetch(`/api/registration/fest/${festId}/candidates`);
if (!response.ok) {
  const error = await response.json();
  console.error(error.message);
  // Handle error (show toast, redirect, etc.)
}
``` 