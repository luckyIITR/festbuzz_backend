# Registration Count API Documentation

## Base URL
- **Registration API**: `/api/registration`

---

## 📊 Registration Count Endpoints

### Get Total Registration Count for a Fest
```http
GET /api/registration/fest/:festId/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festId": "fest_id_here",
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

### Get Detailed Registration Statistics (Admin Only)
```http
GET /api/registration/fest/:festId/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festId": "fest_id_here",
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
      {
        "_id": "IIT Bombay",
        "count": 25
      },
      {
        "_id": "BITS Pilani",
        "count": 20
      },
      {
        "_id": "NIT Trichy",
        "count": 15
      }
    ],
    "breakdown": {
      "confirmed": 120,
      "pending": 25,
      "cancelled": 5,
      "recent": 45
    }
  }
}
```

---

## 🔧 Endpoint Details

### `/fest/:festId/count`
**Purpose:** Get basic registration count for a fest
**Access:** All authenticated users
**Features:**
- Total active registrations (pending + confirmed)
- Breakdown by status (confirmed, pending, cancelled)
- Fest name included in response

### `/fest/:festId/stats`
**Purpose:** Get detailed registration statistics for a fest
**Access:** Admin, Superadmin, or Festival Head for the specific fest
**Features:**
- Complete registration statistics
- Gender distribution analysis
- Top institutes by registration count
- Recent registrations (last 30 days)
- Advanced analytics for festival management

---

## 📋 Response Fields

### Count Endpoint Fields
| Field | Type | Description |
|-------|------|-------------|
| `festId` | String | Festival ID |
| `festName` | String | Festival name |
| `totalRegistrations` | Number | Total active registrations |
| `confirmedCount` | Number | Confirmed registrations |
| `pendingCount` | Number | Pending registrations |
| `cancelledCount` | Number | Cancelled registrations |
| `breakdown` | Object | Status breakdown |

### Stats Endpoint Fields
| Field | Type | Description |
|-------|------|-------------|
| `festId` | String | Festival ID |
| `festName` | String | Festival name |
| `totalRegistrations` | Number | Total registrations |
| `confirmedCount` | Number | Confirmed registrations |
| `pendingCount` | Number | Pending registrations |
| `cancelledCount` | Number | Cancelled registrations |
| `recentRegistrations` | Number | Registrations in last 30 days |
| `genderDistribution` | Object | Gender-wise breakdown |
| `topInstitutes` | Array | Top 10 institutes by count |
| `breakdown` | Object | Complete status breakdown |

---

## ⚠️ Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Specific Error Cases
- **400**: Invalid fest ID
- **404**: Fest not found
- **403**: Access denied (for stats endpoint)
- **500**: Server error

---

## 🔐 Access Control

### Public Count Endpoint
- Available to all authenticated users
- Shows basic registration numbers
- Safe for public display

### Admin Stats Endpoint
- Requires admin privileges
- Available to:
  - Superadmin
  - Admin
  - Festival Head (for their specific fest)
- Contains sensitive analytics data

---

## 💡 Usage Examples

### Frontend Dashboard
```javascript
// Get basic count for public display
const response = await fetch('/api/registration/fest/123/count', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
// Display: "150 registrations"
```

### Admin Analytics
```javascript
// Get detailed stats for admin dashboard
const response = await fetch('/api/registration/fest/123/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
// Create charts and analytics
```

### Real-time Updates
```javascript
// Poll for registration count updates
setInterval(async () => {
  const response = await fetch('/api/registration/fest/123/count');
  const data = await response.json();
  updateRegistrationCounter(data.data.totalRegistrations);
}, 30000); // Update every 30 seconds
```

---

## 🚀 Performance Notes

### Optimized Queries
- Uses MongoDB aggregation for complex stats
- Indexed on `festId` and `status` fields
- Efficient population of user data

### Caching Recommendations
- Cache count results for 5-10 minutes
- Cache stats results for 1-2 minutes
- Implement cache invalidation on new registrations

### Rate Limiting
- Consider implementing rate limiting for stats endpoint
- Monitor usage patterns for optimization

---

## 📊 Analytics Use Cases

### Festival Organizers
- Track registration progress
- Monitor gender distribution
- Identify top participating institutes
- Plan capacity and resources

### Marketing Teams
- Analyze registration trends
- Identify target demographics
- Measure campaign effectiveness
- Plan future events

### Admin Dashboard
- Real-time registration monitoring
- Performance metrics
- Resource allocation
- Success indicators 