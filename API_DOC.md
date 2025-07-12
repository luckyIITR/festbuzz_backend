# Festbuz Backend API Documentation

**Base URL:** `http://localhost:8000`

---

## Auth & User

### Signup
`POST /api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "mobile": "1234567890",
  "role": "Participant"
}
```
**Response:**
```json
{ "msg": "Signup successful. OTP sent to email." }
```

### Verify OTP
`POST /api/auth/verify-otp`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response:**
```json
{ "msg": "OTP verified. Account activated." }
```

### Login
`POST /api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Participant"
  }
}
```

---

## Fest

### Create Fest
`POST /api/fests`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "Music Festival 2025",
  "description": "A week-long celebration of music and culture",
  "organizer": "IIT Roorkee",
  "location": "IIT Roorkee Campus",
  "startDate": "2025-09-14T00:00:00Z",
  "endDate": "2025-09-20T23:59:59Z",
  "individualPrice": 200,
  "teamPrice": 500,
  "theme": "Retro Vibes",
  "eligibility": "Open to all college students",
  "specialAttractions": "Celebrity performances, food stalls, art installations",
  "perks": "Free goodies, certificates, networking opportunities",
  "categories": ["Dance", "Singing", "Fine arts", "Others"],
  "maxParticipants": 1000,
  "isRegistrationOpen": true,
  "isTeamRegistration": true,
  "teamSize": 4,
  "rules": "Standard competition rules apply",
  "prizes": "Cash prizes worth ₹50,000",
  "logo": "https://example.com/logo.png",
  "organizerLogo": "https://example.com/org-logo.png",
  "heroImage": "https://example.com/hero.jpg",
  "bannerImage": "https://example.com/banner.jpg",
  "galleryImages": [
    "https://example.com/gallery1.jpg",
    "https://example.com/gallery2.jpg"
  ],
  "type": "Cultural",
  "visibility": "public",
  "website": "https://fest.com",
  "venue": "Main Auditorium",
  "state": "Uttarakhand",
  "city": "Roorkee",
  "college": "IIT Roorkee",
  "instagram": "https://instagram.com/fest",
  "linkedin": "https://linkedin.com/fest",
  "youtube": "https://youtube.com/fest",
  "sponsors": [
    { "name": "Sponsor1", "image": "/uploads/sponsor1.png", "title": "Title1" }
  ],
  "tickets": [
    {
      "name": "General",
      "feeType": "Paid",
      "price": 100,
      "availableFrom": "2024-07-01",
      "availableTill": "2024-07-31",
      "availableTime": "09:00",
      "endTime": "18:00"
    }
  ]
}
```
**Response:** Fest object

### Get All Fests
`GET /api/fests`
**Response:** Array of fest objects

### Get Fest by ID
`GET /api/fests/:id`
**Response:** Fest object

### Update Fest
`PUT /api/fests/:id`  
**Headers:** `Authorization: Bearer <token>`
**Body:** Same as create
**Response:** Updated fest object

### Delete Fest
`DELETE /api/fests/:id`  
**Headers:** `Authorization: Bearer <token>`
**Response:** `{ "msg": "Fest deleted" }`

---

## Event

### Create Event
`POST /api/fests/:festId/events`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "Dance Competition",
  "description": "Show your dance moves and win prizes",
  "price": 2000,
  "startDate": "2025-09-15T10:00:00Z",
  "endDate": "2025-09-15T18:00:00Z",
  "location": "Main Auditorium",
  "category": "Dance",
  "maxParticipants": 100,
  "isTeamEvent": true,
  "teamSize": 4,
  "rules": "Any dance form allowed, 5-10 minutes performance",
  "prizes": "1st: ₹10,000, 2nd: ₹5,000, 3rd: ₹2,500",
  "image": "https://example.com/event-image.jpg",
  "bannerImage": "https://example.com/event-banner.jpg"
}
```
**Response:** Event object

### Get All Events for a Fest
`GET /api/fests/:festId/events`
**Response:** Array of event objects

### Get Event by ID
`GET /api/fests/:festId/events/:eventId`
**Response:** Event object

### Update Event
`PUT /api/fests/:festId/events/:eventId`  
**Headers:** `Authorization: Bearer <token>`
**Body:** Same as create
**Response:** Updated event object

### Delete Event
`DELETE /api/fests/:festId/events/:eventId`  
**Headers:** `Authorization: Bearer <token>`
**Response:** `{ "msg": "Event deleted" }`

---

## Registration

### Register for Fest
`POST /api/registration/fest`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "festId": "FEST_ID",
  "phone": "1234567890",
  "dateOfBirth": "2000-01-01",
  "gender": "Male",
  "city": "Mumbai",
  "state": "Maharashtra",
  "instituteName": "IIT Bombay",
  "answers": ["Answer1", "Answer2"]
}
```
**Response:** FestRegistration object (with ticket and QR code)
**Required Fields:** phone, dateOfBirth, gender, city, state, instituteName
**Gender Options:** Male, Female, Other

### Register for Event (Solo)
`POST /api/registration/event/solo`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "festId": "FEST_ID",
  "eventId": "EVENT_ID",
  "answers": ["Answer1", "Answer2"]
}
```
**Response:** EventRegistration object (with ticket and QR code)

### Check Fest Registration Status
`GET /api/registration/fest/:festId/status`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Registration status and details
```json
{
  "msg": "Registration found",
  "registered": true,
  "registration": {
    "id": "REGISTRATION_ID",
    "status": "confirmed",
    "ticket": "TICKET_CODE",
    "qrCode": "QR_CODE_DATA_URL",
    "phone": "1234567890",
    "dateOfBirth": "2000-01-01T00:00:00.000Z",
    "gender": "Male",
    "city": "Mumbai",
    "state": "Maharashtra",
    "instituteName": "IIT Bombay",
    "answers": ["Answer1", "Answer2"],
    "fest": {
      "id": "FEST_ID",
      "name": "Music Festival 2025",
      "startDate": "2025-09-14T00:00:00.000Z",
      "endDate": "2025-09-20T23:59:59.000Z",
      "location": "IIT Roorkee Campus"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```
**If not registered:**
```json
{
  "msg": "Not registered for this fest",
  "registered": false
}
```

### Register for Event (Team)
`POST /api/registration/event/team`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "festId": "FEST_ID",
  "eventId": "EVENT_ID",
  "teamName": "Team Alpha",
  "passcode": "secret",
  "memberIds": ["USER_ID1", "USER_ID2"],
  "answers": ["Answer1", "Answer2"]
}
```
**Response:**
```json
{
  "team": { /* team object */ },
  "registrations": [ /* event registration objects for each member */ ]
}
```

### Get My Fest Registrations
`GET /api/registration/fest/me`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of fest registration objects

### Get My Event Registrations
`GET /api/registration/event/me`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of event registration objects

### Get QR Code for Fest Registration
`GET /api/registration/fest/qrcode/:id`  
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{ "qrCode": "data:image/png;base64,..." }
```

### Get QR Code for Event Registration
`GET /api/registration/event/qrcode/:id`  
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{ "qrCode": "data:image/png;base64,..." }
```

---

## Certificates

### Create/Update Certificate Template
`POST /api/certificates/template`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "festId": "FEST_ID",
  "eventId": "EVENT_ID",
  "logo1": "/uploads/logo1.png",
  "logo2": "/uploads/logo2.png",
  "name1": "Prof. A",
  "designation1": "Dean",
  "name2": "Prof. B",
  "designation2": "HOD",
  "template": "default"
}
```
**Response:** Certificate object

### Issue Certificates (Assign Winners)
`POST /api/certificates/issue`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "festId": "FEST_ID",
  "eventId": "EVENT_ID",
  "participants": ["USER_ID1", "USER_ID2"],
  "winners": ["USER_ID1"]
}
```
**Response:** Certificate object

### Get Certificate for User in Event
`GET /api/certificates/user/:eventId`  
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "cert": { /* certificate object */ },
  "isWinner": true
}
```

### Get All Certificates for User
`GET /api/certificates/my`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of certificate objects

---

## File Uploads

### Upload File
`POST /api/upload`  
**Headers:** `Authorization: Bearer <token>`
**Form Data:**  
- `file`: (file to upload)

**Response:**
```json
{ "fileUrl": "/uploads/filename.ext" }
```

---

## Event Judges & Roles

### Add Judge
`POST /api/events/:id/judges`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "Judge Name",
  "mobile": "1234567890",
  "about": "Expert in X",
  "email": "judge@email.com",
  "photo": "/uploads/judge.jpg"
}
```
**Response:** Array of judges

### Remove Judge
`DELETE /api/events/:id/judges/:judgeIndex`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of judges

### List Judges
`GET /api/events/:id/judges`
**Response:** Array of judges

### Assign Event Role
`POST /api/events/:id/roles`  
**Headers:** `Authorization: Bearer <token>`
```json
{
  "type": "EventManager",
  "name": "Manager Name",
  "email": "manager@email.com"
}
```
**Response:** Array of roles

### Remove Event Role
`DELETE /api/events/:id/roles/:roleIndex`  
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of roles

### List Event Roles
`GET /api/events/:id/roles`
**Response:** Array of roles

---

## General Notes
- All endpoints requiring authentication need the header:  
  `Authorization: Bearer <your JWT token>`
- Dates should be in ISO format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`)
- For file uploads, use `multipart/form-data` in Postman.
- Users must register for a fest before registering for any event in that fest. 