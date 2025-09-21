const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const avocatSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    ville: {
        type: String,
        required: true
    },
    adresseCabinet: {
        type: String,
        required: false
    },
    specialites: {
        type: String, // Changed from [String] to String to match your form
        required: true
    },
    diplome: {
        type: String,
        required: true
    },
    anneExperience: {
        type: Number,
        
    },
    langues: {
        type: [String],
      
    },
    verified: {
        type: Boolean,
        default: false,
        required: true,
    } ,
    bio:{
        type: String,
        required: false
    },
    avatarUrl: {
        type: String,
        default: '' // Default avatar for avocat
    },

    workingHours: [{
        day: { type: String, required: true }, // e.g., 'Monday', 'Tuesday'
        start: { type: String, required: true }, // e.g., '08:30'
        end: { type: String, required: true }, // e.g., '16:30'
        isOpen: { type: Boolean, default: true }
    }],

    documentsVerif:{
        type: String, // Changed to String to store Cloudinary URL
        default: ''
    },
    
}, 
{ timestamps: true });

// Login function
avocatSchema.statics.login = async function(email, password) {
    const avocat = await this.findOne({ email });
    if (!avocat) {
        throw Error('Invalid email or password');
    }
    const match = await bcrypt.compare(password, avocat.password);
    if (!match) {
        throw Error('Invalid email or password');
    }
    return avocat;
}

// Signup function
avocatSchema.statics.signup = async function(
    email, password, fullName, phone, ville, adresseCabinet, specialites, diplome, bio, documentsVerif, workingHours, anneExperience, langues, avatarUrl) {
    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('Email already exists');
    }
    
    // Default working hours: 9 AM to 5 PM, Monday to Friday
    const defaultWorkingHours = [
        { day: 'Monday', start: '09:00', end: '17:00', isOpen: true },
        { day: 'Tuesday', start: '09:00', end: '17:00', isOpen: true },
        { day: 'Wednesday', start: '09:00', end: '17:00', isOpen: true },
        { day: 'Thursday', start: '09:00', end: '17:00', isOpen: true },
        { day: 'Friday', start: '09:00', end: '17:00', isOpen: true },
        { day: 'Saturday', start: '09:00', end: '13:00', isOpen: false },
        { day: 'Sunday', start: '09:00', end: '17:00', isOpen: false }
    ];
   
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const avocat = await this.create({ 
        email, 
        password: hash, 
        fullName, 
        phone, 
        ville,
        adresseCabinet, 
        specialites, 
        diplome,
        bio,
        documentsVerif,
        anneExperience,
        langues: langues || [],
        avatarUrl,
        workingHours: workingHours && workingHours.length > 0 ? workingHours : defaultWorkingHours
    });
    return avocat;
}

module.exports = mongoose.model("Avocat", avocatSchema);