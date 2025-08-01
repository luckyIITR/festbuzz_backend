# API Documentation - Festival Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "participant"
    }
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "participant"
    }
  }
}
```

### 3. Google OAuth Login
**POST** `/auth/google`

**Request Body:**
```json
{
  "token": "google_oauth_token"
}
```

### 4. Verify OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 5. Get Current User Profile
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "participant",
    "phone": "+1234567890",
    "profilePhoto": "https://example.com/photo.jpg"
  }
}
```

---

## Festival Endpoints

### 1. Create Festival
**POST** `/fests`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "TechFest 2024",
  "description": "Annual technology festival",
  "organizer": "University of Technology",
  "location": "Main Campus",
  "startDate": "2024-03-15T00:00:00.000Z",
  "endDate": "2024-03-17T00:00:00.000Z",
  "price": 500,
  "theme": "Innovation & Technology",
  "maxParticipants": 1000,
  "categories": ["Technology", "Innovation", "Competition"],
  "rules": "General rules and guidelines",
  "prizes": "Cash prizes and certificates",
  "specialAttractions": "Tech talks, workshops, competitions",
  "perks": "Free swag, networking opportunities"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "TechFest 2024",
    "description": "Annual technology festival",
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Festivals
**GET** `/fests`

**Query Parameters:**
- `trending=true` - Get trending festivals
- `upcoming=true` - Get upcoming festivals

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "TechFest 2024",
      "description": "Annual technology festival",
      "organizer": "University of Technology",
      "location": "Main Campus",
      "startDate": "2024-03-15T00:00:00.000Z",
      "endDate": "2024-03-17T00:00:00.000Z",
      "price": 500,
      "trending": true,
      "upcoming": true,
      "logo": "https://example.com/logo.jpg",
      "heroImage": "https://example.com/hero.jpg"
    }
  ]
}
```

### 3. Get Festival by ID
**GET** `/fests/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "TechFest 2024",
    "description": "Annual technology festival",
    "organizer": "University of Technology",
    "location": "Main Campus",
    "startDate": "2024-03-15T00:00:00.000Z",
    "endDate": "2024-03-17T00:00:00.000Z",
    "price": 500,
    "theme": "Innovation & Technology",
    "maxParticipants": 1000,
    "categories": ["Technology", "Innovation", "Competition"],
    "events": [
      {
        "id": "507f1f77bcf86cd799439013",
        "name": "Hackathon 2024",
        "description": "24-hour coding competition"
      }
    ],
    "sponsors": [
      {
        "name": "Tech Corp",
        "image": "https://example.com/sponsor.jpg",
        "title": "Gold Sponsor"
      }
    ]
  }
}
```

### 4. Update Festival
**PUT** `/fests/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "TechFest 2024 Updated",
  "description": "Updated description",
  "price": 600
}
```

### 5. Delete Festival
**DELETE** `/fests/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 6. Register for Festival
**POST** `/fests/:festId/register`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "phone": "+1234567890",
  "dateOfBirth": "1995-05-15T00:00:00.000Z",
  "gender": "Male",
  "city": "New York",
  "state": "NY",
  "instituteName": "University of Technology",
  "answers": ["Answer 1", "Answer 2"],
  "ticket": "Early Bird"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "festId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "status": "pending",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

## Event Endpoints

### 1. Create Event
**POST** `/events`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "festId": "507f1f77bcf86cd799439012",
  "name": "Hackathon 2024",
  "description": "24-hour coding competition",
  "startDate": "2024-03-15T09:00:00.000Z",
  "endDate": "2024-03-16T09:00:00.000Z",
  "location": "Computer Science Lab",
  "maxParticipants": 50,
  "isTeamEvent": true,
  "teamSize": 4,
  "category": "Competition",
  "rules": "Competition rules and guidelines",
  "prizes": "Cash prizes and certificates",
  "organizer": "CS Department"
}
```

### 2. Get All Events
**GET** `/events`

**Query Parameters:**
- `festId=507f1f77bcf86cd799439012` - Get events for specific festival
- `category=Competition` - Filter by category

### 3. Get Event by ID
**GET** `/events/:id`

### 4. Update Event
**PUT** `/events/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 5. Delete Event
**DELETE** `/events/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 6. Register for Event
**POST** `/events/:eventId/register`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (Individual Event):**
```json
{
  "phone": "+1234567890"
}
```

**Request Body (Team Event):**
```json
{
  "teamName": "Code Warriors",
  "teamMembers": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567891"
    }
  ]
}
```

---

## Festival Management Endpoints

### 1. Assign Role to User in Festival
**POST** `/festival-management/:festId/assign-role`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "festival head"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "festId": "507f1f77bcf86cd799439012",
    "role": "festival head",
    "assignedBy": "507f1f77bcf86cd799439010",
    "isActive": true,
    "assignedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Remove User Role from Festival
**DELETE** `/festival-management/:festId/remove-role/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 3. Get All Users with Roles in Festival
**GET** `/festival-management/:festId/users`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "role": "festival head",
      "isActive": true,
      "assignedAt": "2024-01-15T10:30:00.000Z",
      "userId": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 4. Get Current User's Role in Festival
**GET** `/festival-management/:festId/my-role`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "festival head",
    "hasAccess": true
  }
}
```

---

## Registration Endpoints

### 1. Get User's Registrations
**GET** `/registration/my-registrations`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "festRegistrations": [
      {
        "id": "507f1f77bcf86cd799439014",
        "festId": "507f1f77bcf86cd799439012",
        "status": "confirmed",
        "registrationDate": "2024-01-15T10:30:00.000Z"
      }
    ],
    "eventRegistrations": [
      {
        "id": "507f1f77bcf86cd799439016",
        "eventId": "507f1f77bcf86cd799439013",
        "status": "pending",
        "registrationDate": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Get Registrations for Festival
**GET** `/registration/fest/:festId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### 3. Update Registration Status
**PUT** `/registration/:id/status`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

---

## Certificate Endpoints

### 1. Generate Certificate
**POST** `/certificates/generate`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "festId": "507f1f77bcf86cd799439012",
  "eventId": "507f1f77bcf86cd799439013",
  "type": "participation"
}
```

### 2. Get User's Certificates
**GET** `/certificates/my-certificates`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439017",
      "festId": "507f1f77bcf86cd799439012",
      "eventId": "507f1f77bcf86cd799439013",
      "type": "participation",
      "certificateUrl": "https://example.com/certificates/cert.pdf",
      "generatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Certificate by ID
**GET** `/certificates/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## Upload Endpoints

### 1. Upload Image
**POST** `/upload/image`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: File (jpg, png, gif, webp)

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg"
  }
}
```

### 2. Upload Document
**POST** `/upload/document`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `document`: File (pdf, doc, docx)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "email": "Email is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Festival not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Server error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

---

## File Upload Limits

- **Images**: Max 5MB, formats: jpg, png, gif, webp
- **Documents**: Max 10MB, formats: pdf, doc, docx

---

## WebSocket Events (Future Implementation)

The system may support real-time updates via WebSocket:
- Festival updates
- Registration confirmations
- Event notifications

---

This API documentation covers all the main endpoints of the Festival Management System. For additional details, refer to the main system documentation. 