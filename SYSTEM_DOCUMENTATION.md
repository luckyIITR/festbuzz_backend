# Festival Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Database Models](#database-models)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Endpoints](#api-endpoints)
6. [System Architecture](#system-architecture)
7. [Usage Examples](#usage-examples)
8. [Security Considerations](#security-considerations)

---

## System Overview

The Festival Management System is a comprehensive backend API that manages festivals, events, user registrations, and role-based access control. The system supports multiple user roles with hierarchical permissions, allowing for granular control over festival operations.

### Key Features
- **Multi-tenant Festival Management**: Each festival operates independently
- **Role-based Access Control**: Hierarchical permission system
- **User Registration & Management**: Complete user lifecycle management
- **Event Management**: Create and manage events within festivals
- **Registration System**: Handle individual and team registrations
- **Certificate Generation**: Automated certificate creation
- **File Upload System**: Support for images and documents

---

## Role Hierarchy

The system implements a hierarchical role-based access control system:

```
superadmin → admin → participant → festival head → event manager → event coordinator → event volunteer
```

### Role Descriptions

| Role | Description | Permissions |
|------|-------------|-------------|
| **superadmin** | System administrator | Full system access, can create/delete festivals, manage all users |
| **admin** | Festival administrator | Can manage specific festivals, assign roles within festivals |
| **participant** | Regular user | Can register for festivals and events, view public content |
| **festival head** | Festival manager | Manages entire festivals, oversees events |
| **event manager** | Event supervisor | Manages specific events within festivals |
| **event coordinator** | Event organizer | Coordinates specific event details |
| **event volunteer** | Event support | Provides support at event level |

### Permission Matrix

| Action | superadmin | admin | participant | festival head | event manager | event coordinator | event volunteer |
|--------|------------|-------|-------------|---------------|---------------|-------------------|-----------------|
| Create Festival | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Festival | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Register for Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Public Content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Database Models

### 1. User Model (`src/models/User.js`)

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String,
  role: String (enum: ['superadmin', 'admin', 'participant', 'festival head', 'event manager', 'event coordinator', 'event volunteer']),
  profileInfo: {
    bio: String,
    avatar: String
  },
  phone: String,
  dateOfBirth: Date,
  gender: String (enum: ['Male', 'Female', 'Other']),
  college: String,
  address: String,
  wishlistFests: [ObjectId],
  recentlyViewedFests: [ObjectId],
  googleId: String,
  googleEmail: String,
  googleAvatar: String,
  profilePhoto: String,
  otp: String,
  otpExpires: Date,
  isVerified: Boolean (default: false)
}
```

### 2. Festival Model (`src/models/Fest.js`)

```javascript
{
  name: String (required),
  description: String,
  organizer: String,
  createdBy: ObjectId (required), // Reference to User who created the festival
  location: String,
  startDate: Date,
  endDate: Date,
  price: Number,
  theme: String,
  eligibility: String,
  specialAttractions: String,
  perks: String,
  categories: [String],
  maxParticipants: Number,
  isRegistrationOpen: Boolean (default: true),
  isTeamRegistration: Boolean (default: false),
  teamSize: Number,
  rules: String,
  prizes: String,
  logo: String,
  organizerLogo: String,
  heroImage: String,
  bannerImage: String,
  galleryImages: [String],
  sponsors: [{
    name: String,
    image: String,
    title: String
  }],
  events: [ObjectId], // Reference to Event model
  trending: Boolean (default: false),
  upcoming: Boolean (default: false),
  visibility: String (default: 'public'),
  website: String,
  venue: String,
  state: String,
  city: String,
  college: String,
  instagram: String,
  linkedin: String,
  youtube: String,
  tickets: [{
    name: String,
    feeType: String,
    price: Number,
    availableFrom: Date,
    availableTill: Date,
    availableTime: String,
    endTime: String
  }]
}
```

### 3. FestivalUserRole Model (`src/models/FestivalUserRole.js`)

```javascript
{
  userId: ObjectId (required), // Reference to User
  festId: ObjectId (required), // Reference to Fest
  role: String (enum: ['admin', 'festival head', 'event manager', 'event coordinator', 'event volunteer']),
  assignedBy: ObjectId (required), // Reference to User who assigned the role
  isActive: Boolean (default: true),
  assignedAt: Date (default: Date.now),
  expiresAt: Date // Optional expiration date
}
```

### 4. Event Model (`src/models/Event.js`)

```javascript
{
  festId: ObjectId (required), // Reference to Fest
  name: String (required),
  description: String,
  price: Number,
  startDate: Date,
  endDate: Date,
  location: String,
  image: String,
  bannerImage: String,
  category: String,
  maxParticipants: Number,
  currentParticipants: Number (default: 0),
  isTeamEvent: Boolean (default: false),
  teamSize: Number,
  rules: String,
  prizes: String,
  organizer: String,
  sponsors: [{
    name: String,
    logo: String,
    website: String
  }],
  judges: [{
    name: String,
    photo: String,
    bio: String
  }]
}
```

### 5. Registration Models

#### FestRegistration (`src/models/FestRegistration.js`)
```javascript
{
  festId: ObjectId (required),
  userId: ObjectId (required),
  phone: String (required),
  dateOfBirth: Date (required),
  gender: String (enum: ['Male', 'Female', 'Other'], required),
  city: String (required),
  state: String (required),
  instituteName: String (required),
  answers: [String],
  ticket: String,
  qrCode: String,
  status: String (enum: ['pending', 'confirmed', 'cancelled'], default: 'pending')
}
```

#### EventRegistration (`src/models/EventRegistration.js`)
```javascript
{
  eventId: ObjectId (required),
  userId: ObjectId (required),
  teamName: String, // For team events
  teamMembers: [{
    name: String,
    email: String,
    phone: String
  }],
  status: String (enum: ['pending', 'confirmed', 'cancelled'], default: 'pending'),
  registrationDate: Date (default: Date.now)
}
```

---

## Authentication & Authorization

### JWT Token Structure
```javascript
{
  id: ObjectId, // User ID
  email: String,
  role: String,
  iat: Number, // Issued at
  exp: Number  // Expiration
}
```

### Middleware Functions

#### 1. `authMiddleware`
- Validates JWT token from Authorization header
- Adds user information to `req.user`
- Returns 401 if token is invalid or missing

#### 2. `permitRoles(...roles)`
- Checks if user's global role matches any of the specified roles
- Used for system-wide permissions
- Returns 403 if access denied

#### 3. `permitFestivalRoles(...roles)`
- Checks user's role within a specific festival
- Superadmin has access to all festivals
- Returns 403 if user doesn't have required role in the festival

#### 4. `canManageFestival`
- Checks if user can manage a specific festival
- Allows superadmin, admin, or festival head roles
- Used for festival management operations

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/google` | Google OAuth login | No |
| POST | `/verify-otp` | Verify OTP for registration | No |
| POST | `/resend-otp` | Resend OTP | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |

### Festival Routes (`/api/fests`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Create new festival | Yes | superadmin, admin |
| GET | `/` | Get all festivals | No | - |
| GET | `/:id` | Get festival by ID | No | - |
| PUT | `/:id` | Update festival | Yes | superadmin, admin |
| DELETE | `/:id` | Delete festival | Yes | superadmin, admin |
| POST | `/:festId/register` | Register for festival | Yes | All |
| GET | `/:festId/events` | Get events in festival | No | - |

### Event Routes (`/api/events`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Create new event | Yes | festival head, event manager |
| GET | `/` | Get all events | No | - |
| GET | `/:id` | Get event by ID | No | - |
| PUT | `/:id` | Update event | Yes | festival head, event manager |
| DELETE | `/:id` | Delete event | Yes | festival head, event manager |
| POST | `/:eventId/register` | Register for event | Yes | All |

### Festival Management Routes (`/api/festival-management`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/:festId/assign-role` | Assign role to user in festival | Yes | superadmin, admin, festival head |
| DELETE | `/:festId/remove-role/:userId` | Remove user role from festival | Yes | superadmin, admin, festival head |
| GET | `/:festId/users` | Get all users with roles in festival | Yes | superadmin, admin, festival head |
| GET | `/:festId/my-role` | Get current user's role in festival | Yes | All |

### Registration Routes (`/api/registration`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/my-registrations` | Get user's registrations | Yes |
| GET | `/fest/:festId` | Get registrations for a festival | Yes |
| PUT | `/:id/status` | Update registration status | Yes |

### Certificate Routes (`/api/certificates`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate` | Generate certificate | Yes |
| GET | `/my-certificates` | Get user's certificates | Yes |
| GET | `/:id` | Get certificate by ID | Yes |

### Upload Routes (`/api/upload`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/image` | Upload image | Yes |
| POST | `/document` | Upload document | Yes |

---

## System Architecture

### Directory Structure
```
festbuz_backend/
├── config/
│   └── db.js                 # Database configuration
├── src/
│   ├── app.js                # Main application file
│   ├── controllers/          # Business logic
│   ├── middlewares/
│   │   └── auth.js          # Authentication middleware
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Fest.js
│   │   ├── Event.js
│   │   ├── FestivalUserRole.js
│   │   ├── Registration.js
│   │   ├── FestRegistration.js
│   │   ├── EventRegistration.js
│   │   ├── Certificate.js
│   │   └── Team.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── fest.js
│   │   ├── event.js
│   │   ├── festivalManagement.js
│   │   ├── registration.js
│   │   ├── certificate.js
│   │   └── upload.js
│   ├── services/            # Business services
│   └── utils/
│       └── email.js         # Email utilities
├── uploads/                 # File uploads
├── public/                  # Static files
└── package.json
```

### Data Flow

1. **User Registration/Login**
   - User registers or logs in
   - JWT token generated and returned
   - Token stored in client for subsequent requests

2. **Festival Creation**
   - Superadmin creates festival
   - Festival linked to creator via `createdBy` field
   - Admin can also create festivals

3. **Role Assignment**
   - Superadmin/Admin assigns roles to users within festivals
   - Roles stored in `FestivalUserRole` collection
   - Users can have different roles in different festivals

4. **Event Management**
   - Festival heads and event managers create events
   - Events linked to festivals via `festId`

5. **Registration Process**
   - Users register for festivals and events
   - Registration data stored in respective collections
   - QR codes generated for registrations

6. **Certificate Generation**
   - Certificates generated based on registrations
   - PDF certificates created and stored

---

## Usage Examples

### 1. Creating a Festival (Superadmin)

```javascript
// POST /api/fests
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
  "categories": ["Technology", "Innovation", "Competition"]
}
```

### 2. Assigning Role to User in Festival

```javascript
// POST /api/festival-management/:festId/assign-role
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "festival head"
}
```

### 3. Creating an Event

```javascript
// POST /api/events
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
  "category": "Competition"
}
```

### 4. Registering for a Festival

```javascript
// POST /api/fests/:festId/register
{
  "phone": "+1234567890",
  "dateOfBirth": "1995-05-15T00:00:00.000Z",
  "gender": "Male",
  "city": "New York",
  "state": "NY",
  "instituteName": "University of Technology"
}
```

---

## Security Considerations

### 1. Authentication
- JWT tokens with expiration
- Secure password hashing
- OTP verification for registration
- Google OAuth integration

### 2. Authorization
- Role-based access control
- Festival-specific permissions
- Hierarchical permission system
- Input validation and sanitization

### 3. Data Protection
- Environment variables for sensitive data
- CORS configuration
- File upload restrictions
- SQL injection prevention (MongoDB)

### 4. API Security
- Rate limiting (recommended)
- Request validation
- Error handling without sensitive data exposure
- HTTPS enforcement (production)

---

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/festbuz
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

---

## Deployment

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
```bash
npm install
npm start
```

### Production Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Set up reverse proxy (nginx)
4. Enable HTTPS
5. Configure PM2 for process management

---

## API Response Format

### Success Response
```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Testing

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test festival creation (with auth token)
curl -X POST http://localhost:5000/api/fests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Festival","description":"Test"}'
```

---

This documentation provides a comprehensive overview of the Festival Management System. For specific implementation details, refer to the individual model and route files in the codebase. 