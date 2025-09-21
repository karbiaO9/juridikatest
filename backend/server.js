require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const authRoutes = require('./Routes/authRoutes')
const adminRoutes = require('./Routes/adminRoutes')
const clientRoutes = require('./Routes/clientRoutes')
const avocatRoutes = require('./Routes/avocatRoutes')

const rendezVousRoutes = require('./Routes/rendezVousRoutes')
const caseRoutes = require('./Routes/caseRoutes')
const uploadRoutes = require('./Routes/uploadRoutes')

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))

// Increase payload limit for base64 file uploads
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/avocat', avocatRoutes)

app.use('/api/rendezvous', rendezVousRoutes)
app.use('/api/cases', caseRoutes)
app.use('/api/uploads', uploadRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(process.env.PORT, () => {
        console.log(`✅ Server running on port ${process.env.PORT} and connected to MongoDB`)
    })
    )
    .catch(err => console.log(err))

// Default route 
app.get("/", (req, res) => res.send("Juridika API is running"));