const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
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
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    phone: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Login function
clientSchema.statics.login = async function(email, password) {
    const client = await this.findOne({ email });
    if (!client) {
        throw Error('Invalid email or password');
    }
    const match = await bcrypt.compare(password, client.password);
    if (!match) {
        throw Error('Invalid email or password');
    }
    return client;
}

// Signup function
clientSchema.statics.signup = async function(email, password, fullName, phone, role = 'client') {
    // Check if email already exists
    const exists = await this.findOne({ email });
    if (exists) {
        throw Error('Email already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const client = await this.create({ email, password: hash, fullName, phone, role });
    return client;
}

module.exports = mongoose.model("Client", clientSchema);