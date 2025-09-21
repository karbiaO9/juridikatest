# Juridika Development Guide

Complete development guide for contributing to and extending the Juridika legal platform.

## 🏗️ Project Architecture

### Technology Stack
- **Frontend**: React 18.2, React Router DOM 7.7, Material-UI 7.3, i18next 25.5
- **Backend**: Node.js, Express 5.1, MongoDB 8.16, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary cloud storage
- **Internationalization**: i18next with Arabic/English support
- **Styling**: CSS-in-JS, Material-UI components, Tailwind CSS utilities
- **Development**: Nodemon, React Scripts 5.0

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Express API    │────│   MongoDB       │
│                 │    │                 │    │                 │
│ - Components    │    │ - Controllers   │    │ - User Models   │
│ - Pages         │    │ - Routes        │    │ - Collections   │
│ - Context       │────│ - Middleware    │────│ - Indexes       │
│ - Services      │    │ - Models        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📂 Project Structure Deep Dive

### Frontend Structure
```
frontend/src/
├── components/           # Reusable UI components
│   ├── BookingModal.js     # Appointment booking modal
│   ├── CasesManager.js     # Case management component
│   ├── AnimatedErrorBanner.js # Error display component
│   ├── Navbar.js           # Navigation with i18n support
│   ├── Footer.js           # Footer component
│   ├── Logo.js             # Logo component
│   ├── Loader.js           # Loading indicator
│   ├── PasswordStrength.js # Password validation UI
│   ├── FileViewer.js       # File preview component
│   ├── VerificationModal.js # Document verification modal
│   ├── ProtectedRoute.js   # Route protection wrapper
│   └── NotFound.js         # 404 error page
├── contexts/            # React Context providers
│   ├── AuthContext.js      # Authentication state management
│   └── ToastContext.js     # Toast notification context
├── pages/               # Route-level page components
│   ├── Homepage.js         # Landing page with search
│   ├── LawyerListing.js    # Lawyer directory
│   ├── LawyerProfile.js    # Individual lawyer profile
│   ├── SignupSelect.js     # Universal login/signup form
│   ├── SignupAvocat.js     # Lawyer registration form
│   ├── AdminDashboard.js   # Admin control panel
│   ├── AvocatDashboard.js  # Lawyer dashboard
│   ├── ClientDashboard.js  # Client dashboard
│   ├── CaseCreate.js       # Case creation form
│   ├── CaseList.js         # Case listing
│   └── CaseDetails.js      # Case detail view
├── services/            # External service integrations
│   ├── api.js              # Main API client configuration
│   ├── adminApi.js         # Admin-specific API calls
│   └── rendezVousApi.js    # Appointment API calls
├── locales/             # Internationalization files
│   ├── en/translation.json # English translations
│   └── ar/translation.json # Arabic translations
├── utils/               # Utility functions
│   ├── i18nMapping.js      # Translation key mapping
│   ├── password.js         # Password validation
│   └── validation.js       # Form validation helpers
├── hooks/               # Custom React hooks
│   └── useValidation.js    # Form validation hook
├── i18n/                # i18next configuration
│   └── index.js            # i18n setup and configuration
├── App.js               # Main application component with routing
├── index.js             # React DOM render entry point
├── index.css            # Global styles with Tailwind imports
└── theme.css            # Theme variables and custom styles
```

### Backend Structure
```
backend/
├── Controllers/         # Business logic handlers
│   ├── authController.js   # Authentication logic
│   ├── adminController.js  # Admin operations
│   ├── caseController.js   # Case management
│   ├── rendezVousController.js # Appointment management
│   └── uploadController.js # File upload handling
├── middleware/          # Express middleware functions
│   ├── auth.js            # JWT authentication middleware
│   └── role.js            # Role-based access control
├── Model/              # Database schema definitions
│   ├── Avocat.js          # Lawyer model with working hours
│   ├── Client.js          # Client model
│   ├── Case.js            # Case management model
│   ├── RendezVous.js      # Appointment model
│   └── LawyerAvailability.js # Lawyer availability model
├── Routes/             # API route definitions
│   ├── authRoutes.js      # Authentication routes
│   ├── adminRoutes.js     # Admin endpoint routes
│   ├── avocatRoutes.js    # Lawyer-specific routes
│   ├── clientRoutes.js    # Client-specific routes
│   ├── caseRoutes.js      # Case management routes
│   ├── rendezVousRoutes.js # Appointment routes
│   └── uploadRoutes.js    # File upload routes
├── config/             # Configuration files
│   └── cloudinary.js      # Cloudinary file storage config
├── scripts/            # Utility scripts (development only)
│   └── [various].js       # Database seeding and migration scripts
├── server.js           # Express server configuration
├── package.json        # Node.js dependencies
└── .env               # Environment variables (not in repo)
```

## 🔧 Development Setup

### Prerequisites Check
```bash
# Verify Node.js version (should be 14+)
node --version

# Verify npm version
npm --version

# Verify Git installation
git --version
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/juridika_dev

# Security Configuration
JWT_SECRET=dev_secret_key_change_in_production_minimum_32_characters

# Server Configuration
PORT=4000
NODE_ENV=development

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Optional: Logging Level
LOG_LEVEL=debug
```

### Development Scripts
```bash
# Backend development (auto-restart on changes)
cd backend
npm run dev              # Uses nodemon for auto-restart

# Frontend development (hot reload)
cd frontend
npm start               # Starts React development server

# Frontend production build
cd frontend
npm run build           # Creates optimized production build

# Frontend testing
cd frontend
npm test                # Runs React testing suite

# Backend production
cd backend
npm start               # Starts production server without nodemon
```

## 🧩 Core Components Guide

### Authentication Flow

#### 1. AuthContext (`frontend/src/contexts/AuthContext.js`)
Central authentication state management:

```javascript
const AuthContext = createContext();

// Key functions:
- login(credentials)           // Universal login
- signupClient(data)          // Client registration
- signupAvocat(data)          // Lawyer registration
- logout()                    // Clear auth state
- clearError()                // Reset error state

// State properties:
- user                        // Current user object
- token                       // JWT token
- loading                     // Loading state
- error                       // Error messages
```

#### 2. ProtectedRoute Component
Route protection with role-based access:

```javascript
// Usage examples:
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredUserType="avocat" requireVerified={true}>
  <LawyerDashboard />
</ProtectedRoute>
```

#### 3. Universal Login System
The `SignupSelect.js` component handles both login and registration:

**Key Features:**
- Auto-detects user type (Client/Lawyer) during login
- Animated form transitions
- Real-time validation
- Automatic redirect after authentication

### Database Models

#### Client Model Schema
```javascript
{
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "user" },
  timestamps: true
}

// Static methods:
- Client.login(email, password)      // Login validation
- Client.signup(userData)            // Registration with hashing
```

#### Lawyer (Avocat) Model Schema
```javascript
{
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  ville: { type: String, required: true },
  specialites: { type: [String], required: true },
  diplome: { type: String, required: true },
  documentsVerif: { type: [String], default: [] },
  verified: { type: Boolean, default: false },
  // ... additional optional fields
  timestamps: true
}

// Static methods:
- Avocat.login(email, password)      // Login validation
- Avocat.signup(userData)            // Registration with verification
```

## 🔐 Security Implementation

### JWT Token Handling

#### Backend Token Creation
```javascript
const jwt = require('jsonwebtoken');

const createToken = (_id, role, userType) => {
  return jwt.sign({ _id, role, userType }, process.env.JWT_SECRET, { 
    expiresIn: '7d' 
  });
};
```

#### Frontend Token Storage
```javascript
// AuthContext stores token and includes in requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### Middleware Protection
```javascript
// auth.js middleware
const requireAuth = async (req, res, next) => {
  // Extract token from Authorization header
  // Verify JWT token
  // Attach user to request object
  // Call next() or return error
};
```

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Validation**: Minimum 6 characters (can be extended)
- **Storage**: Never store plain text passwords

### File Upload Security
- **Type Validation**: PDF files only
- **Size Limits**: 10MB maximum
- **Encoding**: Base64 for secure transmission
- **Storage**: Organized file structure

## 🎨 Frontend Development

### Component Development Guidelines

#### 1. Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ComponentName = () => {
  // State declarations
  const [localState, setLocalState] = useState(initialValue);
  
  // Context hooks
  const { user, loading, error } = useAuth();
  
  // Effect hooks
  useEffect(() => {
    // Component logic
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = (e) => {
    // Handler logic
  };
  
  // Render logic
  return (
    <div className="component-wrapper">
      {/* JSX content */}
      <style jsx>{`
        /* Component-specific styles */
      `}</style>
    </div>
  );
};

export default ComponentName;
```

#### 2. Styling Approach
The project uses CSS-in-JS with styled-jsx:

```javascript
<style jsx>{`
  .component-class {
    /* Styles scoped to this component */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .component-class {
      /* Mobile styles */
    }
  }
`}</style>
```

#### 3. Form Handling Pattern
```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // Clear field error on change
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const validateForm = () => {
  const newErrors = {};
  if (!formData.field1.trim()) newErrors.field1 = 'Field 1 is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### State Management

#### Context Pattern
```javascript
// 1. Create Context
const MyContext = createContext();

// 2. Provider Component
export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const contextValue = {
    state,
    actions: {
      updateState: (newState) => setState(newState)
    }
  };
  
  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
};

// 3. Custom Hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

## 🔧 Backend Development

### Controller Pattern
```javascript
// authController.js structure
const controllerFunction = async (req, res) => {
  try {
    // 1. Validate input
    const { field1, field2 } = req.body;
    if (!field1 || !field2) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // 2. Business logic
    const result = await Model.someOperation(field1, field2);
    
    // 3. Return response
    res.status(200).json({ 
      message: 'Success',
      data: result 
    });
    
  } catch (error) {
    // 4. Error handling
    res.status(500).json({ error: error.message });
  }
};
```

### Route Organization
```javascript
// authRoutes.js pattern
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { 
  controllerFunction1,
  controllerFunction2 
} = require('../Controllers/authController');

// Public routes
router.post('/login', controllerFunction1);
router.post('/signup', controllerFunction2);

// Protected routes
router.get('/profile', requireAuth, getProfile);

module.exports = router;
```

### Model Static Methods
```javascript
// Model schema with static methods
const schema = new Schema({
  // field definitions
});

// Static method for business logic
schema.statics.customMethod = async function(params) {
  // Model-specific business logic
  const result = await this.findOne({ criteria });
  if (!result) {
    throw Error('Not found');
  }
  return result;
};

module.exports = mongoose.model('ModelName', schema);
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

#### Authentication Testing
- [ ] Client registration with valid data
- [ ] Lawyer registration with valid data  
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token persistence across page refreshes
- [ ] Automatic logout on token expiration
- [ ] Protected route access control

#### File Upload Testing
- [ ] PDF file upload success
- [ ] Non-PDF file rejection
- [ ] Large file (>10MB) rejection
- [ ] File upload progress indication
- [ ] Error handling for upload failures

#### UI/UX Testing
- [ ] Responsive design on mobile devices
- [ ] Form validation error messages
- [ ] Loading states during operations
- [ ] Navigation between different user dashboards
- [ ] Error boundary functionality

### API Testing with Postman
1. **Create Collection**: "Juridika API Tests"
2. **Environment Variables**:
   ```
   baseUrl: http://localhost:4000/api
   authToken: {{token_from_login}}
   ```
3. **Test Scenarios**:
   - Authentication flow
   - Protected route access
   - File upload endpoints
   - Error response handling

## 🚀 Deployment Preparation

### Environment Configuration

#### Production Environment Variables
```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/juridika_prod

# Security (use strong, unique values)
JWT_SECRET=super_long_random_production_secret_key_here

# Server
PORT=4000
NODE_ENV=production

# Optional: Additional security
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend Build Process
```bash
cd frontend
npm run build

# This creates a 'build' folder with optimized production files
```

#### Backend Production Setup
```bash
cd backend
npm install --production
npm start  # or use PM2 for process management
```

### Performance Optimization

#### Frontend Optimizations
- **Code Splitting**: Consider implementing lazy loading for routes
- **Bundle Analysis**: Use `npm run build` and analyze bundle size
- **Image Optimization**: Compress images and use appropriate formats
- **Caching**: Implement proper caching headers

#### Backend Optimizations
- **Database Indexing**: Add indexes for frequently queried fields
- **Response Compression**: Enable gzip compression
- **Query Optimization**: Review and optimize database queries
- **Rate Limiting**: Implement rate limiting for API endpoints

## 🔄 Continuous Development

### Version Control Workflow
```bash
# Feature development workflow
git checkout -b feature/new-feature-name
# Make changes
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name
# Create pull request
```

### Code Quality Standards
- **Consistent Naming**: Use camelCase for variables, PascalCase for components
- **Error Handling**: Always handle errors gracefully
- **Documentation**: Comment complex logic and update README
- **Security**: Validate all inputs, sanitize data
- **Performance**: Consider performance implications of new features

### Adding New Features

#### Adding a New API Endpoint
1. **Define Route** in appropriate route file
2. **Create Controller** function with business logic
3. **Update Model** if database changes needed
4. **Add Middleware** if authentication/authorization required
5. **Test Endpoint** with Postman or similar tool
6. **Update API Documentation**

#### Adding a New Frontend Page
1. **Create Component** in `src/pages/`
2. **Add Route** in `App.js`
3. **Implement Navigation** in existing components
4. **Add Protection** if authentication required
5. **Style Component** with consistent design
6. **Test Responsiveness** on different screen sizes

## 🐛 Debugging Guide

### Common Issues and Solutions

#### Frontend Debugging
```javascript
// Debug authentication issues
console.log('Auth state:', { user, token, loading, error });

// Debug API calls
console.log('API request:', { url, method, data, headers });

// Debug component state
console.log('Component state:', { localState, props });
```

#### Backend Debugging
```javascript
// Debug middleware
console.log('Auth middleware:', { token, user: req.user });

// Debug database operations
console.log('Database query:', { query, result });

// Debug errors
console.error('Error details:', { 
  message: error.message, 
  stack: error.stack 
});
```

### Browser DevTools Usage
- **Console**: Check for JavaScript errors and logs
- **Network Tab**: Inspect API requests and responses
- **Application Tab**: Check localStorage and sessionStorage
- **Sources Tab**: Set breakpoints for debugging

### Database Debugging
```bash
# MongoDB connection testing
mongosh "mongodb://localhost:27017/juridika_dev"

# View collections
show collections

# Query examples
db.clients.find({})
db.avocats.find({ verified: false })
```

---

## 📞 Development Support

### Getting Help
- **Code Issues**: Review error messages and stack traces
- **API Issues**: Check API documentation and test with Postman
- **Database Issues**: Verify connection strings and query syntax
- **Frontend Issues**: Use browser DevTools for debugging

### Contributing Guidelines
1. Follow the established code structure and patterns
2. Write clear, descriptive commit messages
3. Test changes thoroughly before committing
4. Update documentation when adding new features
5. Ensure code follows security best practices

This development guide provides the foundation for effectively working with and extending the Juridika platform. Happy coding! 🚀
