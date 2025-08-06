# Fest Registration API - Frontend Guide

## Register for a Fest
```http
POST /api/registration/fest
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "festId": "fest_id_here",
  "phone": "+1234567890",
  "dateOfBirth": "1995-01-15",
  "gender": "Male",
  "city": "Mumbai",
  "state": "Maharashtra",
  "instituteName": "IIT Bombay",
  "answers": ["Answer 1", "Answer 2"]
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "_id": "registration_id",
    "userId": "user_id",
    "festId": "fest_id",
    "status": "confirmed",
    "ticket": "TICKET-123456",
    "qrCode": "data:image/png;base64,...",
    "answers": ["Answer 1", "Answer 2"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// Missing fields
{
  "success": false,
  "message": "Missing required fields: phone, dateOfBirth, gender, city, state, instituteName"
}

// Invalid gender
{
  "success": false,
  "message": "Gender must be one of: Male, Female, Other"
}

// Already registered
{
  "success": false,
  "message": "Already registered for this fest"
}
```

## Quick Implementation

### React Hook
```javascript
const useFestRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerForFest = async (registrationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/registration/fest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (err) {
      setError('Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registerForFest, loading, error };
};
```

### Registration Form Component
```javascript
const FestRegistrationForm = ({ festId }) => {
  const { registerForFest, loading, error } = useFestRegistration();
  const [formData, setFormData] = useState({
    festId,
    phone: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    state: '',
    instituteName: '',
    answers: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerForFest(formData);
    if (result) {
      console.log('Registration successful:', result);
      // Show success message, redirect, etc.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      
      <input
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        required
      />
      
      <select
        value={formData.gender}
        onChange={(e) => setFormData({...formData, gender: e.target.value})}
        required
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      
      <input
        type="text"
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="State"
        value={formData.state}
        onChange={(e) => setFormData({...formData, state: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Institute Name"
        value={formData.instituteName}
        onChange={(e) => setFormData({...formData, instituteName: e.target.value})}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register for Fest'}
      </button>
    </form>
  );
};
```

## Required Fields
- `festId` - Festival ID
- `phone` - Phone number
- `dateOfBirth` - Date in YYYY-MM-DD format
- `gender` - "Male", "Female", or "Other"
- `city` - City name
- `state` - State name
- `instituteName` - College/Institute name
- `answers` - Array of answers (optional) 