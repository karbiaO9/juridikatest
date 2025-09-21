# 🏛️ Juridika - Legal Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="Juridika Logo" width="120" height="120">
  
  **A comprehensive legal platform connecting clients and lawyers in Tunisia**
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Environment Setup](#-environment-setup)
- [User Roles](#-user-roles)
- [Development Guide](#-development-guide)


---

## 🌟 Overview

Juridika is a modern, full-stack legal platform that streamlines the connection between clients seeking legal services and qualified lawyers. Built with React and Node.js, it provides a comprehensive solution for legal consultation management, appointment booking, case tracking, and document management.

### 🎯 Mission
To democratize access to legal services by providing an intuitive platform that simplifies the process of finding, booking, and managing legal consultations.

---

## ✨ Features

### 👥 For Clients
- **🔍 Lawyer Discovery**: Search and filter lawyers by specialty, location, and experience
- **📅 Appointment Booking**: Real-time availability checking and booking system
- **💬 Multi-language Support**: Available in Arabic and English
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **📋 Case Management**: Track case progress and documents
- **💳 Payment Integration**: Secure payment processing for consultations

### ⚖️ For Lawyers
- **📊 Professional Dashboard**: Comprehensive appointment and client management
- **🗓️ Availability Management**: Set and update working hours and availability
- **📁 Case Management**: Create, update, and manage client cases
- **📎 Document Management**: Upload and share legal documents
- **📈 Analytics**: Track appointments, revenue, and client interactions
- **✅ Appointment Control**: Approve, reschedule, or decline client requests

### 🛡️ For Administrators
- **👨‍💼 Lawyer Verification**: Review and approve lawyer registrations
- **📊 Platform Analytics**: Monitor platform usage and statistics
- **👥 User Management**: Manage users and platform settings
- **🚨 Content Moderation**: Ensure platform quality and compliance

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks
- **React Router 7.7.1** - Client-side routing
- **React i18next 15.7.3** - Internationalization (Arabic/English)
- **Axios 1.11.0** - HTTP client for API calls
- **React Icons 4.10.1** - Icon library
- **Material-UI 7.3.1** - Component library
- **Lottie React 2.4.1** - Animation library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **MongoDB with Mongoose 8.16.5** - Database and ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **Bcrypt 6.0.0** - Password hashing
- **Cloudinary 1.41.3** - Image and file storage
- **Multer 2.0.2** - File upload handling
- **CORS 2.8.5** - Cross-origin resource sharing

### Development Tools
- **Nodemon 3.1.10** - Development server auto-restart
- **Create React App 5.0.1** - React development environment
- **ESLint** - Code linting
- **dotenv 17.2.1** - Environment variable management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mimos123/Juridika.git
   cd Juridika
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configuration (see Environment Setup section)
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

---

## 📁 Project Structure

```
Juridika/
├── 📂 backend/                 # Node.js/Express API
│   ├── 📂 Controllers/         # Business logic handlers
│   │   ├── authController.js   # Authentication logic
│   │   ├── adminController.js  # Admin operations
│   │   ├── caseController.js   # Case management
│   │   └── rendezVousController.js # Appointment logic
│   ├── 📂 middleware/          # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── role.js            # Role-based access control
│   ├── 📂 Model/              # Database schemas
│   │   ├── Avocat.js          # Lawyer model
│   │   ├── Client.js          # Client model
│   │   ├── RendezVous.js      # Appointment model
│   │   ├── Case.js            # Case model
│   │   └── LawyerAvailability.js # Availability model
│   ├── 📂 Routes/             # API route definitions
│   │   ├── authRoutes.js      # Authentication routes
│   │   ├── adminRoutes.js     # Admin routes
│   │   ├── avocatRoutes.js    # Lawyer routes
│   │   ├── clientRoutes.js    # Client routes
│   │   ├── caseRoutes.js      # Case management routes
│   │   └── rendezVousRoutes.js # Appointment routes
│   ├── 📂 config/             # Configuration files
│   │   └── cloudinary.js      # File storage config
│   ├── 📂 scripts/            # Utility scripts
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
│
├── 📂 frontend/               # React application
│   ├── 📂 public/             # Static assets
│   │   ├── index.html         # HTML template
│   │   ├── law.png           # Application logo
│   │   └── manifest.json     # PWA configuration
│   ├── 📂 src/               # Source code
│   │   ├── 📂 components/     # Reusable UI components
│   │   │   ├── Navbar.js      # Navigation component
│   │   │   ├── Footer.js      # Footer component
│   │   │   ├── BookingModal.js # Appointment booking
│   │   │   ├── CasesManager.js # Case management
│   │   │   └── ProtectedRoute.js # Route protection
│   │   ├── 📂 pages/          # Page components
│   │   │   ├── Homepage.js     # Landing page
│   │   │   ├── LawyerListing.js # Lawyer search/listing
│   │   │   ├── LawyerProfile.js # Individual lawyer profile
│   │   │   ├── ClientDashboard.js # Client dashboard
│   │   │   ├── AvocatDashboard.js # Lawyer dashboard
│   │   │   ├── AdminDashboard.js # Admin dashboard
│   │   │   ├── CaseList.js     # Case listing
│   │   │   ├── CaseCreate.js   # Case creation
│   │   │   └── CaseDetails.js  # Case details
│   │   ├── 📂 contexts/       # React contexts
│   │   │   ├── AuthContext.js  # Authentication state
│   │   │   └── ToastContext.js # Notification system
│   │   ├── 📂 services/       # API service layers
│   │   │   ├── api.js         # Main API client
│   │   │   └── rendezVousApi.js # Appointment API
│   │   ├── 📂 locales/        # Internationalization
│   │   │   ├── 📂 en/         # English translations
│   │   │   └── 📂 ar/         # Arabic translations
│   │   ├── 📂 utils/          # Utility functions
│   │   ├── 📂 hooks/          # Custom React hooks
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   ├── index.css          # Global styles
│   │   └── theme.css          # Theme variables
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Environment template
│
├── 📂 docs/                   # Documentation
│   ├── API_DOCUMENTATION.md   # API reference
│   ├── DEVELOPMENT_GUIDE.md   # Development guidelines
│   └── INSTALLATION.md        # Installation guide
│
├── README.md                  # This file
└── .gitignore                # Git ignore rules
```

---

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup/client` - Client registration
- `POST /api/auth/signup/avocat` - Lawyer registration
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile

### Appointment Endpoints
- `GET /api/rendezvous/slots` - Get available time slots
- `POST /api/rendezvous/book` - Book appointment
- `POST /api/rendezvous/approve/:id` - Approve appointment
- `POST /api/rendezvous/reject/:id` - Reject appointment
- `PATCH /api/rendezvous/update/:id` - Update appointment

### Case Management Endpoints
- `GET /api/cases` - List cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Admin Endpoints
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/pending-lawyers` - Pending lawyer verifications
- `POST /api/admin/verify-lawyer/:id` - Verify lawyer

For detailed API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## ⚙️ Environment Setup

### Backend Environment (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/juridika
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/juridika

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (optional)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### Frontend Environment (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:4000

# Environment
REACT_APP_ENV=development

# Analytics (optional)
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

---

## 👤 User Roles

### 🧑‍💼 Client
- Browse and search lawyers
- Book appointments
- Manage profile and preferences
- Track case progress
- Access consultation history

### ⚖️ Lawyer (Avocat)
- Manage professional profile
- Set availability and working hours
- Approve/decline appointment requests
- Create and manage client cases
- Upload and share documents
- Track revenue and analytics

### 🛡️ Administrator
- Verify lawyer registrations
- Monitor platform activity
- Manage user accounts
- Access platform analytics
- Moderate content and reviews

---

## 💻 Development Guide

### Code Style and Standards
- **ES6+** JavaScript syntax
- **Functional components** with React Hooks
- **RESTful API** design principles
- **JWT** for authentication
- **Mongoose ODM** for database operations

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run test suite
```

#### Frontend
```bash
npm start           # Start development server
npm run build       # Create production build
npm test            # Run test suite
npm run eject       # Eject from Create React App
```

### Testing Credentials (Development)
```
Client:
- Email: test1@example.com
- Password: password123

Lawyer:
- Email: avocat1@example.com  
- Password: avocat12345

Admin:
- Email: admin@juridika.com
- Password: admin123456
```

### Key Development Features
- **Hot Reload** - Automatic server restart on file changes
- **Error Boundaries** - Graceful error handling in React
- **Responsive Design** - Mobile-first approach
- **Internationalization** - Arabic and English support
- **File Upload** - Cloudinary integration for documents/images
- **Authentication** - JWT-based secure authentication

---

## 🐛 Troubleshooting

### Common Issues

**Backend connection errors:**
- Verify MongoDB connection string in `.env`
- Ensure MongoDB service is running
- Check firewall and network settings

**Authentication issues:**
- Verify JWT_SECRET is set correctly
- Clear browser localStorage/cookies
- Check token expiration settings

**File upload problems:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS configuration

**Translation missing:**
- Check translation files in `frontend/src/locales/`
- Verify translation keys match component usage
- Clear browser cache
