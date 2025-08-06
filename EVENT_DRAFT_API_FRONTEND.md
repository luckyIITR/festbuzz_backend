# Event Draft API - Frontend Guide

## Event Status
- `draft` - Event is being worked on
- `published` - Event is live and visible to public
- `archived` - Event is archived (hidden from public)

## Endpoints

### Create Event (as Draft)
```http
POST /api/events
Authorization: Bearer <token>
```

### Save Event as Draft
```http
POST /api/events/draft
Authorization: Bearer <token>
```

### Publish Event
```http
POST /api/events/:eventId/publish
Authorization: Bearer <token>
```

### Unpublish Event
```http
POST /api/events/:eventId/unpublish
Authorization: Bearer <token>
```

### Archive Event
```http
POST /api/events/:eventId/archive
Authorization: Bearer <token>
```

### Get Event Status
```http
GET /api/events/:eventId/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "draft",
    "publishedAt": null,
    "publishedBy": null,
    "draftVersion": 3,
    "lastSavedAsDraft": "2024-01-15T10:30:00.000Z",
    "canPublish": true
  }
}
```

### Get Events by Status
```http
GET /api/events?status=draft&festId=fest_id
GET /api/events/published?festId=fest_id
GET /api/events/drafts?festId=fest_id
```

## Quick Implementation

### React Hook for Event Status
```javascript
const useEventStatus = (eventId) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        setStatus(response.data);
      }
      setLoading(false);
    });
  }, [eventId]);

  return { status, loading };
};
```

### Event Actions Component
```javascript
const EventActions = ({ eventId, onStatusChange }) => {
  const { status, loading } = useEventStatus(eventId);

  const publishEvent = async () => {
    const response = await fetch(`/api/events/${eventId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      onStatusChange('published');
    }
  };

  const saveAsDraft = async (eventData) => {
    const response = await fetch(`/api/events/draft`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...eventData, _id: eventId })
    });
    if (response.ok) {
      onStatusChange('draft');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {status?.status === 'draft' && status?.canPublish && (
        <button onClick={publishEvent}>Publish Event</button>
      )}
      {status?.status === 'published' && (
        <button onClick={() => saveAsDraft(eventData)}>Save as Draft</button>
      )}
      <span>Status: {status?.status}</span>
      <span>Draft Version: {status?.draftVersion}</span>
    </div>
  );
};
```

## Usage Examples

### Save Draft
```javascript
const saveDraft = async (eventData) => {
  const response = await fetch('/api/events/draft', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });
  
  if (response.ok) {
    console.log('Draft saved successfully');
  }
};
```

### Publish Event
```javascript
const publishEvent = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    console.log('Event published successfully');
  } else {
    const error = await response.json();
    console.error('Cannot publish:', error.msg);
  }
};
```

## Error Handling
```javascript
const response = await fetch(`/api/events/${eventId}/publish`);
if (!response.ok) {
  const error = await response.json();
  if (error.missingFields) {
    console.error('Missing fields:', error.missingFields);
    // Show validation errors to user
  }
}
``` 