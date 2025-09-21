# Juridika Installation Guide

This guide provides step-by-step instructions for setting up the Juridika legal platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0 or higher) - Required for React 18
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (v8.0 or higher - comes with Node.js)
  - Verify installation: `npm --version`
- **MongoDB** (v5.0 or higher)
  - Local: https://www.mongodb.com/try/download/community
  - Cloud: https://www.mongodb.com/atlas (Recommended for production)
- **Git** (for cloning the repository)
  - Download from: https://git-scm.com/

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 1GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Browser**: Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

## 🚀 Installation Steps

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone <your-repository-url>
cd Juridika
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Environment Configuration
Create a `.env` file in the backend directory:

```bash
# For Windows
copy nul .env

# For macOS/Linux
touch .env
```

Add the following environment variables to `.env`:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/juridika

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_minimum_32_chars

# Server Configuration
PORT=4000

# Environment
NODE_ENV=development

# Cloudinary Configuration (Required for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important Notes:**
- Replace `JWT_SECRET` with a strong, unique secret key (minimum 32 characters)
- For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string
- **Cloudinary Setup Required**: Create a free account at https://cloudinary.com/ for file upload functionality
- Keep the `.env` file secure and never commit it to version control
- Add `.env` to your `.gitignore` file

#### 2.4 Database Setup (Optional - Local MongoDB)
If using local MongoDB:
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB service (Linux)
sudo systemctl start mongod
```

#### 2.5 Start Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Server running on port 4000 and connected to MongoDB
✅ Cloudinary configured successfully
```

### Step 3: Frontend Setup

#### 3.1 Open New Terminal and Navigate to Frontend
```bash
# Keep the backend terminal running and open a new terminal
cd frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

**Note**: The frontend uses the following key dependencies:
- **React 18** - Latest React version with concurrent features
- **Material-UI (MUI)** - Modern React component library
- **React Router v7** - Latest routing library
- **i18next** - Internationalization (Arabic/English support)
- **Axios** - HTTP client for API requests
- **Lottie React** - Animations
- **React Icons** - Icon library

#### 3.3 Start Frontend Development Server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## ✅ Verification

### Check Backend
1. Open your browser and go to `http://localhost:4000`
2. You should see: "Juridika API is running"

### Check Frontend
1. The React app should be running at `http://localhost:3000`
2. You should see the Juridika login page

### Test Database Connection
1. Try creating a new account to verify database connectivity
2. Check the backend terminal for connection confirmations

## 🔧 Development Workflow

### Daily Development Startup
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd frontend
npm start
```

### Stopping the Application
- Press `Ctrl + C` in both terminals to stop the servers
- For local MongoDB: `brew services stop mongodb-community` (macOS) or `net stop MongoDB` (Windows)

## 🐛 Troubleshooting

### Common Installation Issues

#### 1. Port Already in Use
```
Error: Port 4000 is already in use
```
**Solution:**
- Kill the process using port 4000: `npx kill-port 4000`
- Or change the PORT in `.env` file

#### 2. MongoDB Connection Error
```
Error: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running locally
- Check if MongoDB service is started
- Verify MONGO_URI in `.env` file

#### 3. JWT Secret Error
```
Error: secretOrPrivateKey has a value of undefined
```
**Solution:**
- Add JWT_SECRET to your `.env` file
- Ensure `.env` file is in the backend directory

#### 4. npm Install Errors
```
npm ERR! peer dep missing
```
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 6. File Upload Errors
```
Error: Cloudinary configuration missing
```
**Solution:**
- Ensure Cloudinary environment variables are set in `.env`:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY` 
  - `CLOUDINARY_API_SECRET`
- Create a free Cloudinary account at https://cloudinary.com/
- Copy your credentials from Cloudinary dashboard

#### 7. React Router v7 Issues
```
Error: Cannot resolve module 'react-router-dom'
```
**Solution:**
```bash
npm install react-router-dom@^7.7.1
```

#### 8. Material-UI Dependency Conflicts
```
npm ERR! peer dependency conflicts
```
**Solution:**
```bash
npm install --force
# or
npm install --legacy-peer-deps
```

### Windows-Specific Issues

#### PowerShell Execution Policy
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Node.js Path Issues
Add Node.js to your PATH:
1. Open System Properties → Advanced → Environment Variables
2. Add Node.js installation path to PATH variable

### macOS-Specific Issues

#### Permission Errors
```bash
sudo chown -R $(whoami) ~/.npm
```

#### Xcode Command Line Tools
```bash
xcode-select --install
```

## 🔐 Security Considerations

### Development Environment
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Keep dependencies updated: `npm audit fix`

### Database Security
- Use MongoDB Atlas for production
- Enable authentication for local MongoDB
- Regular database backups

## 📱 Testing the Installation

### Test User Accounts
Use these test accounts to verify your installation:

```
CLIENT LOGIN:
Email: client@test.com
Password: password123

LAWYER LOGIN:
Email: avocat@test.com
Password: password123

ADMIN LOGIN:
Email: admin@juridika.com
Password: admin123
```

### Test Flow
1. **Registration Test**: Create a new client account
2. **Login Test**: Try logging in with test accounts above
3. **Language Toggle**: Test Arabic/English language switching
4. **Lawyer Registration**: Complete multi-step lawyer registration process
5. **File Upload**: Test document upload functionality (requires Cloudinary setup)
6. **Appointment Booking**: Test appointment booking system
7. **Dashboard Access**: Verify different user role dashboards load correctly
8. **Working Hours**: Test lawyer working hours configuration
9. **Case Management**: Test case creation and file attachments

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest versions (be careful)
npm install package-name@latest
```

### Database Maintenance
- Regular backups of your MongoDB database
- Monitor database size and performance
- Clean up test data periodically

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. **Check the main README.md** for additional information
2. **Review error messages carefully** - they often contain the solution
3. **Check browser console** for frontend errors
4. **Check backend terminal** for server errors
5. **Verify all environment variables** are set correctly

## 🎉 Next Steps

After successful installation:

1. **Explore the Application**: Test all features and user flows
2. **Review the Code**: Understand the project structure
3. **Development**: Start making your own modifications
4. **Documentation**: Read the main README.md for detailed feature information

---

**Congratulations! 🎉 You have successfully installed Juridika.**

The application should now be running and ready for development. Happy coding!
