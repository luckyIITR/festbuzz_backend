# Wishlist & Recently Viewed API Documentation

## Base URLs
- **Wishlist API**: `/api/wishlist`
- **Recently Viewed API**: `/api/recently-viewed`

---

## 🔖 Wishlist API

### Add Fest to Wishlist
```http
POST /api/wishlist/add/:festId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fest added to wishlist successfully",
  "data": {
    "_id": "wishlist_id",
    "userId": "user_id",
    "festId": "fest_id",
    "addedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Remove Fest from Wishlist
```http
DELETE /api/wishlist/remove/:festId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fest removed from wishlist successfully"
}
```

### Get User's Wishlist
```http
GET /api/wishlist?page=1&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wishlist": [
      {
        "_id": "wishlist_id",
        "addedAt": "2024-01-15T10:30:00.000Z",
        "festId": {
          "_id": "fest_id",
          "name": "TechFest 2024",
          "type": "Technical",
          "state": "Maharashtra",
          "city": "Mumbai",
          "venue": "IIT Bombay",
          "college": "IIT Bombay",
          "startDate": "2024-03-15T00:00:00.000Z",
          "endDate": "2024-03-17T00:00:00.000Z",
          "logo": "logo_url",
          "heroImage": "hero_image_url"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 150,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Check if Fest is in Wishlist
```http
GET /api/wishlist/check/:festId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isInWishlist": true
  }
}
```

### Get Wishlist Count
```http
GET /api/wishlist/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 25
  }
}
```

### Clear Entire Wishlist
```http
DELETE /api/wishlist/clear
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

---

## 👁️ Recently Viewed API

### Add Fest to Recently Viewed
```http
POST /api/recently-viewed/add/:festId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fest added to recently viewed successfully",
  "data": {
    "_id": "recently_viewed_id",
    "userId": "user_id",
    "festId": "fest_id",
    "viewedAt": "2024-01-15T10:30:00.000Z",
    "viewCount": 1
  }
}
```

### Get Recently Viewed Fests
```http
GET /api/recently-viewed?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recentlyViewed": [
      {
        "_id": "recently_viewed_id",
        "viewedAt": "2024-01-15T10:30:00.000Z",
        "viewCount": 3,
        "festId": {
          "_id": "fest_id",
          "name": "TechFest 2024",
          "type": "Technical",
          "state": "Maharashtra",
          "city": "Mumbai",
          "venue": "IIT Bombay",
          "college": "IIT Bombay",
          "startDate": "2024-03-15T00:00:00.000Z",
          "endDate": "2024-03-17T00:00:00.000Z",
          "logo": "logo_url",
          "heroImage": "hero_image_url"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 35,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Most Viewed Fests
```http
GET /api/recently-viewed/most-viewed?limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "recently_viewed_id",
      "viewCount": 5,
      "viewedAt": "2024-01-15T10:30:00.000Z",
      "festId": {
        "_id": "fest_id",
        "name": "TechFest 2024",
        "type": "Technical",
        "state": "Maharashtra",
        "city": "Mumbai",
        "venue": "IIT Bombay",
        "college": "IIT Bombay",
        "startDate": "2024-03-15T00:00:00.000Z",
        "endDate": "2024-03-17T00:00:00.000Z",
        "logo": "logo_url",
        "heroImage": "hero_image_url"
      }
    }
  ]
}
```

### Remove from Recently Viewed
```http
DELETE /api/recently-viewed/remove/:festId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fest removed from recently viewed successfully"
}
```

### Clear Recently Viewed History
```http
DELETE /api/recently-viewed/clear
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Recently viewed history cleared successfully"
}
```

### Get Recently Viewed Count
```http
GET /api/recently-viewed/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 35
  }
}
```

### Get Viewing Statistics
```http
GET /api/recently-viewed/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalViews": 150,
    "uniqueFests": 25,
    "avgViewsPerFest": 6
  }
}
```

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
- **404**: Fest not found
- **400**: Fest already in wishlist / Invalid request
- **403**: Access denied (for admin-only endpoints)
- **500**: Server error

---

## 🔧 Implementation Notes

### Authentication
- All endpoints require `Authorization: Bearer <token>` header
- Token should be obtained from `/api/auth/login` or `/api/auth/register`

### Pagination
- Use `page` and `limit` query parameters
- Default: `page=1`, `limit=50` (wishlist) / `limit=20` (recently viewed)

### Auto-tracking
- Call `/api/recently-viewed/add/:festId` whenever user views a fest page
- This automatically handles view count increments

### Frontend Integration Tips
1. **Wishlist Toggle**: Use `/check/:festId` to show current state
2. **Real-time Updates**: Call count endpoints for badge updates
3. **Analytics**: Use stats endpoint for user insights
4. **Performance**: Implement pagination for large lists

---

## 📋 Quick Reference

### Wishlist Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wishlist/add/:festId` | Add to wishlist |
| DELETE | `/api/wishlist/remove/:festId` | Remove from wishlist |
| GET | `/api/wishlist` | Get wishlist |
| GET | `/api/wishlist/check/:festId` | Check if in wishlist |
| GET | `/api/wishlist/count` | Get count |
| DELETE | `/api/wishlist/clear` | Clear wishlist |

### Recently Viewed Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recently-viewed/add/:festId` | Add to recently viewed |
| GET | `/api/recently-viewed` | Get recently viewed |
| GET | `/api/recently-viewed/most-viewed` | Get most viewed |
| DELETE | `/api/recently-viewed/remove/:festId` | Remove from recently viewed |
| DELETE | `/api/recently-viewed/clear` | Clear history |
| GET | `/api/recently-viewed/count` | Get count |
| GET | `/api/recently-viewed/stats` | Get statistics | 