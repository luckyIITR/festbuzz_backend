# Recently Viewed API Documentation

## Base URL
`GET /api/recently-viewed`

## Authentication
All endpoints require authentication. Include `Authorization: Bearer <token>` header.

---

## 1. Get Recently Viewed Fests
**Endpoint:** `GET /recently-viewed`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "fest_id",
      "name": "TechFest 2024",
      "type": "tech",
      "state": "Karnataka",
      "city": "Bangalore",
      "venue": "College Campus",
      "college": "ABC College",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-17T00:00:00.000Z",
      "festMode": "offline",
      "about": "Annual technical festival with workshops and competitions",
      "contact": "+91 9876543210",
      "email": "techfest@college.edu",
      "instagram": "https://instagram.com/techfest2024",
      "website": "https://techfest2024.com",
      "isRegistrationOpen": true,
      "logo": "https://example.com/logo.jpg",
      "heroImage": "https://example.com/hero.jpg",
      "organizerLogo": "https://example.com/organizer.jpg",
      "bannerImage": "https://example.com/banner.jpg",
      "galleryImages": ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"],
      "sponsors": [
        {
          "name": "Tech Corp",
          "image": "https://example.com/sponsor1.jpg",
          "title": "Platinum Sponsor"
        }
      ],
      "visibility": "public",
      "viewedAt": "2024-01-10T10:30:00.000Z",
      "viewCount": 3
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 2. Get Most Viewed Fests
**Endpoint:** `GET /recently-viewed/most-viewed`

**Query Parameters:**
- `limit` (optional): Number of items (default: 10, max: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "fest_id",
      "name": "TechFest 2024",
      "type": "tech",
      "state": "Karnataka",
      "city": "Bangalore",
      "venue": "College Campus",
      "college": "ABC College",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-17T00:00:00.000Z",
      "festMode": "offline",
      "about": "Annual technical festival with workshops and competitions",
      "contact": "+91 9876543210",
      "email": "techfest@college.edu",
      "instagram": "https://instagram.com/techfest2024",
      "website": "https://techfest2024.com",
      "isRegistrationOpen": true,
      "logo": "https://example.com/logo.jpg",
      "heroImage": "https://example.com/hero.jpg",
      "organizerLogo": "https://example.com/organizer.jpg",
      "bannerImage": "https://example.com/banner.jpg",
      "galleryImages": ["https://example.com/gallery1.jpg", "https://example.com/gallery2.jpg"],
      "sponsors": [
        {
          "name": "Tech Corp",
          "image": "https://example.com/sponsor1.jpg",
          "title": "Platinum Sponsor"
        }
      ],
      "visibility": "public",
      "viewedAt": "2024-01-10T10:30:00.000Z",
      "viewCount": 5
    }
  ]
}
```

---

## 3. Add Fest to Recently Viewed
**Endpoint:** `POST /recently-viewed/add/:festId`

**Response:**
```json
{
  "success": true,
  "message": "Fest added to recently viewed successfully",
  "data": {
    "_id": "recently_viewed_id",
    "userId": "user_id",
    "festId": "fest_id",
    "viewCount": 1,
    "viewedAt": "2024-01-10T10:30:00.000Z"
  }
}
```

---

## 4. Remove Fest from Recently Viewed
**Endpoint:** `DELETE /recently-viewed/remove/:festId`

**Response:**
```json
{
  "success": true,
  "message": "Fest removed from recently viewed successfully"
}
```

---

## 5. Clear All Recently Viewed
**Endpoint:** `DELETE /recently-viewed/clear`

**Response:**
```json
{
  "success": true,
  "message": "Recently viewed history cleared successfully"
}
```

---

## 6. Get Recently Viewed Count
**Endpoint:** `GET /recently-viewed/count`

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 25
  }
}
```

---

## 7. Get Viewing Statistics
**Endpoint:** `GET /recently-viewed/stats`

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

## Error Responses

**404 - Fest Not Found:**
```json
{
  "success": false,
  "message": "Fest not found"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Frontend Integration Notes

1. **Auto-add to recently viewed**: Call `POST /add/:festId` when user views a fest detail page
2. **Display recently viewed**: Use `GET /` with pagination for infinite scroll
3. **Most viewed section**: Use `GET /most-viewed` for recommendations
4. **Clean data structure**: Each fest object includes viewing metadata (`viewedAt`, `viewCount`)
5. **Pagination**: Use `pagination` object for navigation controls 