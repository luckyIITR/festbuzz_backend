# Get Event by ID API Documentation

## Endpoint
```
GET /api/events/:id
```

## Description
Retrieves a specific event by its unique identifier. This endpoint returns the complete event details including all associated data like sponsors, judges, rewards, tickets, and other event information.

## URL Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `id` | String | The unique identifier of the event (MongoDB ObjectId) | Yes |

## Request Headers
```
Content-Type: application/json
```

## Authentication
- **Required**: No authentication required
- **Access**: Public endpoint

## Request Example
```bash
curl -X GET \
  http://localhost:3000/api/events/507f1f77bcf86cd799439011 \
  -H 'Content-Type: application/json'
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "festId": "507f1f77bcf86cd799439012",
    "name": "Tech Hackathon 2024",
    "type": "Competition",
    "visibility": "public",
    "startDate": "2024-03-15T09:00:00.000Z",
    "endDate": "2024-03-16T18:00:00.000Z",
    "mode": "offline",
    "location": "Mumbai",
    "venue": "Tech Park, Andheri",
    "rulebookLink": "https://example.com/rulebook.pdf",
    "description": "A 24-hour hackathon for innovative tech solutions",
    "imageUrls": [
      "https://example.com/event1.jpg",
      "https://example.com/event2.jpg"
    ],
    "rewards": [
      {
        "rank": "1st",
        "cash": 50000,
        "coupon": "HACK50",
        "goodies": "Premium Tech Kit",
        "description": "First prize with cash reward and exclusive goodies"
      },
      {
        "rank": "2nd",
        "cash": 25000,
        "coupon": "HACK25",
        "goodies": "Tech Kit",
        "description": "Second prize with cash reward"
      }
    ],
    "tickets": [
      {
        "name": "Early Bird",
        "eventFeeType": "Early Bird",
        "price": 500,
        "availableFrom": "2024-02-01T00:00:00.000Z",
        "availableTill": "2024-02-28T23:59:59.000Z",
        "availableTime": "09:00 AM",
        "endTime": "06:00 PM",
        "maxQuantity": 100,
        "currentQuantity": 45,
        "description": "Early bird tickets with discounted price"
      }
    ],
    "isTeamEvent": true,
    "teamSize": 4,
    "maxParticipants": 200,
    "sponsors": [
      {
        "name": "TechCorp",
        "logo": "https://example.com/techcorp-logo.png",
        "website": "https://techcorp.com"
      }
    ],
    "judges": [
      {
        "name": "Dr. John Doe",
        "photo": "https://example.com/judge1.jpg",
        "bio": "Senior Software Engineer at TechCorp",
        "mobile": "+91-9876543210",
        "email": "john.doe@techcorp.com"
      }
    ],
    "status": "published",
    "publishedAt": "2024-01-15T10:30:00.000Z",
    "publishedBy": "507f1f77bcf86cd799439013",
    "draftVersion": 3,
    "lastSavedAsDraft": "2024-01-14T15:45:00.000Z",
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### Event Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Event not found"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Server error"
}
```

## Response Fields

### Event Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier of the event |
| `festId` | String | Reference to the parent festival |
| `name` | String | Name of the event |
| `type` | String | Type of event (e.g., "Competition", "Workshop") |
| `visibility` | String | Event visibility ("public", "private") |
| `startDate` | Date | Event start date and time |
| `endDate` | Date | Event end date and time |
| `mode` | String | Event mode ("online", "offline", "hybrid") |
| `location` | String | Event location (city/region) |
| `venue` | String | Specific venue details |
| `rulebookLink` | String | URL to event rulebook |
| `description` | String | Detailed event description |
| `imageUrls` | Array[String] | Array of event image URLs |
| `rewards` | Array[Object] | Prize structure and rewards |
| `tickets` | Array[Object] | Ticket pricing and availability |
| `isTeamEvent` | Boolean | Whether it's a team-based event |
| `teamSize` | Number | Number of members per team |
| `maxParticipants` | Number | Maximum number of participants |
| `sponsors` | Array[Object] | Event sponsors information |
| `judges` | Array[Object] | Event judges information |
| `status` | String | Event status ("draft", "published", "archived") |
| `publishedAt` | Date | When the event was published |
| `publishedBy` | String | User ID who published the event |
| `draftVersion` | Number | Version number of the draft |
| `lastSavedAsDraft` | Date | Last time event was saved as draft |
| `createdAt` | Date | Event creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Reward Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `rank` | String | Prize rank (e.g., "1st", "2nd", "Runner Up") |
| `cash` | Number | Cash prize amount |
| `coupon` | String | Coupon code or description |
| `goodies` | String | Goodies description |
| `description` | String | Additional description for this rank |

### Ticket Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Ticket name |
| `eventFeeType` | String | Fee type (e.g., "Early Bird", "Regular", "VIP") |
| `price` | Number | Ticket price |
| `availableFrom` | Date | Ticket availability start date |
| `availableTill` | Date | Ticket availability end date |
| `availableTime` | String | Daily availability start time |
| `endTime` | String | Daily availability end time |
| `maxQuantity` | Number | Maximum tickets available |
| `currentQuantity` | Number | Currently sold tickets |
| `description` | String | Additional ticket description |

### Sponsor Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Sponsor company name |
| `logo` | String | Sponsor logo URL |
| `website` | String | Sponsor website URL |

### Judge Object Structure
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Judge's name |
| `photo` | String | Judge's photo URL |
| `bio` | String | Judge's biography |
| `mobile` | String | Judge's mobile number |
| `email` | String | Judge's email address |

## Usage Examples

### JavaScript (Fetch API)
```javascript
const getEvent = async (eventId) => {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Event details:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Usage
getEvent('507f1f77bcf86cd799439011');
```

### JavaScript (Axios)
```javascript
import axios from 'axios';

const getEvent = async (eventId) => {
  try {
    const response = await axios.get(`/api/events/${eventId}`);
    console.log('Event details:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
  }
};

// Usage
getEvent('507f1f77bcf86cd799439011');
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        
        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  return { event, loading, error };
};

// Usage in component
const EventDetails = ({ eventId }) => {
  const { event, loading, error } = useEvent(eventId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      {/* Render other event details */}
    </div>
  );
};
```

## Notes

1. **Public Access**: This endpoint is publicly accessible and doesn't require authentication
2. **Event Status**: The endpoint returns events regardless of their status (draft, published, archived)
3. **Data Completeness**: All event fields are returned, including nested objects like rewards, tickets, sponsors, and judges
4. **Error Handling**: Proper error handling for non-existent events and server errors
5. **Performance**: The endpoint uses MongoDB's `findById()` for efficient single document retrieval

## Related Endpoints

- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `GET /api/events` - Get all events (with filtering and pagination) 