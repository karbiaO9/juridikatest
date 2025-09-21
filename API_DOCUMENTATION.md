# Juridika API Documentation

Comprehensive API documentation for the Juridika legal platform backend.

## 🔗 Base URL
```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Flow
1. User logs in via `/auth/login`
2. Server returns JWT token
3. Frontend stores token and includes it in subsequent requests
4. Server validates token on protected routes

## 📍 API Endpoints

### Authentication Routes (`/api/auth`)

#### 🔓 Universal Login
```http
POST /api/auth/login
```

**Description**: Universal login endpoint that auto-detects user type (Client/Lawyer)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response Success (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "Client",
    "role": "user",
    "verified": true
  }
}
```

**Response Error (401)**:
```json
{
  "error": "Invalid email or password"
}
```

#### 📝 Client Registration
```http
POST /api/auth/signup/client
```

**Description**: Register a new client account

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+216123456789"
}
```

**Response Success (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "fullName": "John Doe",
    "userType": "Client",
    "role": "user"
  }
}
```

#### ⚖️ Lawyer Registration
```http
POST /api/auth/signup/avocat
```

**Description**: Register a new lawyer account (requires verification)

**Request Body** (Form data with file upload):
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+216123456789",
  "ville": "Tunis",
  "specialites": "Civil Law",
  "diplome": "Master in Law",
  "documentsVerif": "[File Upload]"
}
```

**Response Success (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "jane@example.com",
    "fullName": "Jane Smith",
    "userType": "Avocat",
    "verified": false,
    "specialites": ["Civil Law"],
    "ville": "Tunis"
  }
}
```

#### 👤 Get User Profile
```http
GET /api/auth/profile
```

**Description**: Get current user's profile information

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "Client",
    "role": "user"
  }
}
```

#### ⏳ Check Verification Status
```http
GET /api/auth/pending-verification
```

**Description**: Check lawyer verification status

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)** - Unverified:
```json
{
  "message": "Your account is still under review",
  "verified": false
}
```

**Response Success (200)** - Verified:
```json
{
  "message": "You are already verified!",
  "verified": true,
  "redirectTo": "/avocat/dashboard"
}
```

### Appointment Routes (`/api/rendezvous`)

#### 📅 Get Available Slots
```http
GET /api/rendezvous/slots?avocatId={id}&day={day}&date={date}
```

**Description**: Get available time slots for a lawyer on a specific day

**Query Parameters**:
- `avocatId`: Lawyer's ID
- `day`: Day of week (e.g., "Monday")
- `date`: Date in YYYY-MM-DD format

**Response Success (200)**:
```json
[
  {
    "startTime": "09:00",
    "endTime": "09:30",
    "period": 1
  },
  {
    "startTime": "09:30",
    "endTime": "10:00",
    "period": 1
  }
]
```

#### 📝 Book Appointment
```http
POST /api/rendezvous/book
```

**Description**: Book a new appointment

**Request Body**:
```json
{
  "clientId": "507f1f77bcf86cd799439011",
  "avocatId": "507f1f77bcf86cd799439012",
  "date": "2024-12-25",
  "heure": "09:00",
  "type": "visio",
  "services": [
    {
      "name": "Legal Consultation",
      "description": "Initial consultation",
      "price": 100,
      "currency": "USD"
    }
  ],
  "caseFiles": []
}
```

**Response Success (200)**:
```json
{
  "message": "Booking request submitted.",
  "rendezvous": {
    "_id": "507f1f77bcf86cd799439013",
    "clientId": "507f1f77bcf86cd799439011",
    "avocatId": "507f1f77bcf86cd799439012",
    "date": "2024-12-25T00:00:00.000Z",
    "heure": "09:00",
    "type": "visio",
    "statut": "en_attente",
    "services": [...]
  }
}
```

#### ✅ Approve Appointment
```http
POST /api/rendezvous/approve/:id
```

**Description**: Lawyer approves a pending appointment

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
```

**Response Success (200)**:
```json
{
  "message": "Booking approved.",
  "rendezvous": {
    "_id": "507f1f77bcf86cd799439013",
    "statut": "confirmé"
  }
}
```

#### ❌ Reject Appointment
```http
POST /api/rendezvous/reject/:id
```

**Description**: Lawyer rejects a pending appointment

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
```

**Response Success (200)**:
```json
{
  "message": "Booking rejected.",
  "rendezvous": {
    "_id": "507f1f77bcf86cd799439013",
    "statut": "annulé"
  }
}
```

#### 📝 Update Appointment
```http
PATCH /api/rendezvous/update/:id
```

**Description**: Update/reschedule an appointment

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "date": "2024-12-26",
  "heure": "10:00",
  "type": "physique",
  "notes": "Updated appointment notes"
}
```

**Response Success (200)**:
```json
{
  "message": "Appointment updated",
  "rendezvous": {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2024-12-26T00:00:00.000Z",
    "heure": "10:00",
    "type": "physique"
  }
}
```

#### 💰 Mark as Paid
```http
PATCH /api/rendezvous/mark-paid/:id
```

**Description**: Mark appointment as paid (lawyer only)

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
```

**Request Body**:
```json
{
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "paymentConfirmedBy": "507f1f77bcf86cd799439012"
}
```

#### 📋 Get Appointments
```http
GET /api/rendezvous?avocatId={id}
GET /api/rendezvous?clientId={id}
```

**Description**: Get appointments for lawyer or client

**Query Parameters**:
- `avocatId`: Get appointments for this lawyer
- `clientId`: Get appointments for this client

**Response Success (200)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2024-12-25T00:00:00.000Z",
    "heure": "09:00",
    "type": "visio",
    "statut": "confirmé",
    "clientId": {
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "services": [...]
  }
]
```

### Working Hours Routes (`/api/avocat`)

#### ⏰ Update Working Hours
```http
PUT /api/avocat/working-hours
```

**Description**: Update lawyer's working hours

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
```

**Request Body**:
```json
{
  "workingHours": [
    {
      "day": "Monday",
      "start": "09:00",
      "end": "17:00",
      "isOpen": true
    },
    {
      "day": "Tuesday",
      "start": "09:00",
      "end": "17:00",
      "isOpen": true
    }
  ]
}
```

**Response Success (200)**:
```json
{
  "message": "Working hours updated successfully",
  "workingHours": [...]
}
```

### Case Management Routes (`/api/cases`)

#### 📂 Create Case
```http
POST /api/cases
```

**Description**: Create a new case (lawyer only)

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data)**:
```
title: "Case Title"
description: "Case description"
appointment: "507f1f77bcf86cd799439013"
client: "507f1f77bcf86cd799439011"
files: [File uploads...]
```

**Response Success (201)**:
```json
{
  "case": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Case Title",
    "description": "Case description",
    "appointment": "507f1f77bcf86cd799439013",
    "client": "507f1f77bcf86cd799439011",
    "lawyer": "507f1f77bcf86cd799439012",
    "files": [...],
    "state": "ouvert"
  }
}
```

#### 📋 List Cases
```http
GET /api/cases
```

**Description**: List cases (filtered by user role)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Case Title",
    "state": "ouvert",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "client": {
      "fullName": "John Doe"
    }
  }
]
```

#### 📄 Get Case Details
```http
GET /api/cases/:id
```

**Description**: Get detailed case information

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response Success (200)**:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Case Title",
  "description": "Case description",
  "state": "ouvert",
  "files": [...],
  "appointment": {...},
  "client": {...}
}
```

### File Upload Routes (`/api/uploads`)

#### 📎 Upload Files
```http
POST /api/uploads
```

**Description**: Upload files to Cloudinary

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data)**:
```
files: [File uploads...]
```

**Response Success (200)**:
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "url": "https://res.cloudinary.com/...",
      "filename": "document.pdf",
      "contentType": "application/pdf"
    }
  ]
}
```

### Admin Routes (`/api/admin`)

#### 👥 Get All Users
```http
GET /api/admin/users
```

**Description**: Get list of all users (Admin only)

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200)**:
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "client@example.com",
      "fullName": "Client User",
      "userType": "Client",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "email": "lawyer@example.com",
      "fullName": "Lawyer User",
      "userType": "Avocat",
      "verified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### ✅ Verify Lawyer
```http
PATCH /api/admin/avocats/:id/verify
```

**Description**: Verify a lawyer's account (Admin only)

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Parameters**:
- `id`: Lawyer's user ID

**Response Success (200)**:
```json
{
  "message": "Lawyer verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "verified": true
  }
}
```

#### 📊 Get Admin Stats
```http
GET /api/admin/stats
```

**Description**: Get platform statistics (Admin only)

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response Success (200)**:
```json
{
  "totalUsers": 150,
  "totalClients": 100,
  "totalLawyers": 45,
  "verifiedLawyers": 40,
  "pendingVerifications": 5,
  "totalAppointments": 200,
  "totalCases": 75
}
```

### Client Routes (`/api/client`)

#### 📊 Client Dashboard
```http
GET /api/client/dashboard
```

**Description**: Get client dashboard data

**Headers**:
```
Authorization: Bearer <client_jwt_token>
```

**Response Success (200)**:
```json
{
  "message": "Welcome to client dashboard",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "Client User",
    "email": "client@example.com"
  },
  "stats": {
    "activeConsultations": 0,
    "completedConsultations": 0
  }
}
```

### Lawyer Routes (`/api/avocat`)

#### ⚖️ Lawyer Dashboard
```http
GET /api/avocat/dashboard
```

**Description**: Get lawyer dashboard data

**Headers**:
```
Authorization: Bearer <lawyer_jwt_token>
```

**Response Success (200)** - Verified Lawyer:
```json
{
  "message": "Welcome to lawyer dashboard",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Lawyer User",
    "email": "lawyer@example.com",
    "verified": true,
    "specialites": ["Civil Law"]
  },
  "stats": {
    "activeClients": 0,
    "completedCases": 0
  }
}
```

**Response Success (200)** - Unverified Lawyer:
```json
{
  "message": "Account pending verification",
  "verified": false,
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "fullName": "Lawyer User",
    "verified": false
  }
}
```

## 🔒 Security & Middleware

### Authentication Middleware
All protected routes use JWT authentication:

```javascript
// Middleware validates JWT token
const { requireAuth } = require('../middleware/auth');

// Usage in routes
router.get('/protected-route', requireAuth, controllerFunction);
```

### Role-based Access Control
Different middleware for different user roles:

```javascript
// Admin only routes
const { requireAdmin } = require('../middleware/role');
router.get('/admin-only', requireAuth, requireAdmin, controllerFunction);

// Lawyer only routes
const { requireAvocat } = require('../middleware/role');
router.get('/lawyer-only', requireAuth, requireAvocat, controllerFunction);

// Verified lawyer only routes
const { requireVerifiedAvocat } = require('../middleware/role');
router.get('/verified-lawyer-only', requireAuth, requireVerifiedAvocat, controllerFunction);

// Client only routes
const { requireClient } = require('../middleware/role');
router.get('/client-only', requireAuth, requireClient, controllerFunction);
```

### User Type Validation
The system supports multiple user types with specific access levels:

- **Admin**: Full system access, can verify lawyers
- **Avocat (Lawyer)**: Can manage cases, appointments, update working hours
- **Client**: Can book appointments, view own cases
- **Verified Avocat**: Lawyer with admin verification, full lawyer features
- **Unverified Avocat**: Limited access until verification

### JWT Token Structure
```json
{
  "_id": "user_object_id",
  "role": "admin|user",
  "userType": "Client|Avocat",
  "iat": 1640995200,
  "exp": 1641599999
}
```

## 📤 File Upload Handling

### Cloudinary Integration
The platform uses Cloudinary for file storage with the following configuration:

**Upload Endpoint**:
```http
POST /api/uploads
Content-Type: multipart/form-data
```

**Configuration**:
- **Cloud Storage**: Cloudinary (cloud name: configurable via env)
- **Maximum File Size**: 10MB per file
- **Allowed Types**: PDF, JPG, PNG, JPEG
- **Upload Location**: `juridika/` folder in Cloudinary
- **File Naming**: Automatic timestamped unique names

### File Upload Process

#### Frontend Implementation
```javascript
// Create FormData for file upload
const formData = new FormData();
formData.append('files', file);

// Upload via API
const response = await api.post('/api/uploads', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

#### Backend Processing
```javascript
// Multer middleware with Cloudinary storage
const { upload } = require('../config/cloudinary');

// Route with file upload support
router.post('/upload', upload.array('files', 6), uploadController.handleUpload);
```

### File Response Format
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "url": "https://res.cloudinary.com/dxxqko5qm/image/upload/v1/juridika/filename.pdf",
      "filename": "document.pdf",
      "contentType": "application/pdf",
      "size": 1024576,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### File Constraints and Validation
- **File Size**: Maximum 10MB per file
- **File Types**: Restricted to PDF, JPG, PNG, JPEG
- **Quantity Limit**: Maximum 6 files per upload
- **Security**: Files are scanned and validated on upload
- **Access Control**: Only authenticated users can upload files

## 🚨 Error Handling

### Standard Error Responses

#### 400 - Bad Request
```json
{
  "error": "All required fields must be provided"
}
```

#### 401 - Unauthorized
```json
{
  "error": "Authorization token required"
}
```

#### 403 - Forbidden
```json
{
  "error": "Access denied"
}
```

#### 404 - Not Found
```json
{
  "error": "User not found"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### Validation Errors
Field-specific validation errors:
```json
{
  "error": "Email already exists"
}
```

## 📊 Rate Limiting & Performance

### Request Limits
- **File Uploads**: 10MB maximum payload
- **JSON Requests**: 10MB maximum payload
- **Concurrent Connections**: Handled by Express.js defaults

### Performance Considerations
- **Database Indexing**: Email fields are indexed for faster queries
- **JWT Expiration**: Tokens have reasonable expiration times
- **CORS Optimization**: Configured for specific origins in production

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/juridika

# JWT Configuration
JWT_SECRET=your_secret_key_here_minimum_32_characters

# Server Configuration
PORT=4000
NODE_ENV=development

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Production Considerations
- Use MongoDB Atlas for database hosting
- Set strong, unique JWT secrets (minimum 32 characters)
- Configure CORS for production domains only
- Enable HTTPS and secure headers
- Set up proper logging and monitoring
- Use environment-specific Cloudinary accounts
- Implement rate limiting for API endpoints

## 🧪 Testing the API

### Using cURL

**Login Example**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123"}'
```

**Protected Route Example**:
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Create a new collection for Juridika API
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:4000/api`
3. Create environment variables for tokens
4. Test each endpoint with appropriate headers and body

### Response Time Expectations
- **Authentication**: < 200ms
- **Database Queries**: < 100ms
- **File Uploads**: < 2s (depending on file size)

---

## 📞 API Support

For API-related issues:
- Check endpoint URLs and HTTP methods
- Verify request headers and body format
- Ensure JWT tokens are valid and not expired
- Check server logs for detailed error information

This documentation covers all available API endpoints in the Juridika platform. For implementation examples, refer to the frontend code in the `services/api.js` file.
