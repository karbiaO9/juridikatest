const Client = require('../Model/Client');
const Avocat = require('../Model/Avocat');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { cloudinary } = require('../config/cloudinary');

//JWT token creation
const createToken = (_id, role, userType) => {
    return jwt.sign({ _id, role, userType }, process.env.JWT_SECRET, { expiresIn: '3d' });
}

// Login controller
const loginUser = async (req, res) => {
    const { email, password, userType } = req.body;

    try {
        let user;
        let role;
        let redirectUrl;
        let actualUserType;

        if (userType) {
            // If userType is specified, use it directly
            if (userType === 'client') {
                user = await Client.login(email, password);
                role = user.role;
                actualUserType = 'Client';
                if (role === 'admin') {
                    redirectUrl = '/admin/dashboard';
                } else {
                    redirectUrl = '/client/dashboard';
                }
            } else if (userType === 'avocat') {
                user = await Avocat.login(email, password);
                role = 'avocat';
                actualUserType = 'Avocat';
                redirectUrl = '/avocat/dashboard';
            } else {
                return res.status(400).json({ error: 'userType must be client or avocat' });
            }
        } else {
            // If no userType specified, try both collections
            try {
                // First try Client collection
                user = await Client.login(email, password);
                role = user.role;
                actualUserType = 'Client';
                if (role === 'admin') {
                    redirectUrl = '/admin/dashboard';
                } else {
                    redirectUrl = '/client/dashboard';
                }
            } catch (clientError) {
                try {
                    // If Client login fails, try Avocat collection
                    user = await Avocat.login(email, password);
                    role = 'avocat';
                    actualUserType = 'Avocat';
                    redirectUrl = '/avocat/dashboard';
                } catch (avocatError) {
                    // If both fail, return error
                    return res.status(400).json({ error: 'Invalid email or password' });
                }
            }
        }

        const token = createToken(user._id, role, actualUserType);

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: role,
                userType: actualUserType,
                verified: actualUserType === 'Avocat' ? user.verified : undefined
            },
            token: token,
            redirectUrl: redirectUrl,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// Client signup controller
const signupClient = async (req, res) => {
    const { email, password, fullName, phone, role = 'client' } = req.body;

    // Validation
    if (!email || !password || !fullName || !phone) {
        return res.status(400).json({
            error: 'All required fields must be provided',
            missing: {
                email: !email,
                password: !password,
                fullName: !fullName,
                phone: !phone
            }
        });
    }

    try {
        const user = await Client.signup(email, password, fullName, phone, role);
        const token = createToken(user._id, user.role, 'Client');

        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                userType: 'Client'
            },
            token: token,
            redirectUrl: redirectUrl,
            message: 'Client signup successful'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Avocat signup controller
const signupAvocat = async (req, res) => {
    console.log('🔍 Signup request received');
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    const {
        fullName,
        email,
        password,
        phone,
        ville,
        specialites,
        diplome,
        adresseCabinet,
        anneExperience,
        langues,
        bio,
        disponibilites
    } = req.body;

    // Validation for required fields
    if (!fullName || !email || !password || !phone || !ville || !specialites || !diplome) {
        return res.status(400).json({
            error: 'All required fields must be provided',
            missing: {
                fullName: !fullName,
                email: !email,
                password: !password,
                phone: !phone,
                ville: !ville,
                specialites: !specialites,
                diplome: !diplome
            }
        });
    }

    try {
        // Get uploaded files URLs from Cloudinary
        let documentUrl = null;
        let avatarUrl = null;
        
        // Handle multiple files - check if req.files exists (for multiple file uploads)
        if (req.files) {
            if (req.files.documentsVerif && req.files.documentsVerif[0]) {
                documentUrl = req.files.documentsVerif[0].path;
            }
            if (req.files.avatarUrl && req.files.avatarUrl[0]) {
                avatarUrl = req.files.avatarUrl[0].path;
            }
        } else if (req.file) {
            // Fallback for single file upload
            documentUrl = req.file.path;
        }

        // Parse availability data if provided
        let parsedDisponibilites = null;
        if (disponibilites) {
            try {
                parsedDisponibilites = JSON.parse(disponibilites);
            } catch (error) {
                console.error('Error parsing availability data:', error);
                parsedDisponibilites = null;
            }
        }

        // Normalize disponibilites into workingHours using default times (08:00 - 17:00)
        const dayMap = {
            lundi: 'Monday',
            mardi: 'Tuesday',
            mercredi: 'Wednesday',
            jeudi: 'Thursday',
            vendredi: 'Friday',
            samedi: 'Saturday',
            dimanche: 'Sunday'
        };

        const DEFAULT_START = '08:00';
        const DEFAULT_END = '17:00';

        let workingHoursNormalized = [];
        if (parsedDisponibilites && typeof parsedDisponibilites === 'object') {
            for (const [key, val] of Object.entries(parsedDisponibilites)) {
                // Only include days marked available; always use default times
                if (val && val.available) {
                    const dayName = dayMap[key] || key;
                    // Skip Sunday by default (unless explicitly available)
                    workingHoursNormalized.push({ day: dayName, start: DEFAULT_START, end: DEFAULT_END });
                }
            }
        } else {
            // If no data provided, default to Monday-Saturday 08:00-17:00
            ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].forEach(d => {
                workingHoursNormalized.push({ day: d, start: DEFAULT_START, end: DEFAULT_END });
            });
        }

        // Parse languages data if provided
        let parsedLangues = [];
        if (langues) {
            try {
                parsedLangues = typeof langues === 'string' ? JSON.parse(langues) : langues;
            } catch (error) {
                console.error('Error parsing languages data:', error);
                parsedLangues = [];
            }
        }

        const user = await Avocat.signup(
            email,
            password,
            fullName,
            phone,
            ville,
            adresseCabinet,
            specialites,
            diplome,
            bio,
            documentUrl,
            workingHoursNormalized,
            anneExperience ? parseInt(anneExperience) : null,
            parsedLangues,
            avatarUrl
        );

        const token = createToken(user._id, 'avocat', 'Avocat');

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: 'avocat',
                userType: 'Avocat',
                verified: user.verified
            },
            token: token,
            redirectUrl: '/avocat/dashboard',
            message: 'Avocat signup successful, Please Wait for Verification.'
        });
    } catch (error) {
        console.error('Avocat signup error:', error);
        
        // If there was an error and files were uploaded, delete them from Cloudinary
        if (req.files) {
            const filesToDelete = [];
            if (req.files.documentsVerif && req.files.documentsVerif[0] && req.files.documentsVerif[0].public_id) {
                filesToDelete.push(req.files.documentsVerif[0].public_id);
            }
            if (req.files.avatarUrl && req.files.avatarUrl[0] && req.files.avatarUrl[0].public_id) {
                filesToDelete.push(req.files.avatarUrl[0].public_id);
            }
            
            for (const publicId of filesToDelete) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Error deleting file from Cloudinary:', deleteError);
                }
            }
        } else if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
            } catch (deleteError) {
                console.error('Error deleting file from Cloudinary:', deleteError);
            }
        }
        
        res.status(400).json({ error: error.message });
    }
};

// Get user profile controller
const getUserProfile = async (req, res) => {
    try {
    const { userType, _id } = req.user;
    const normalizedUserType = String(userType || '').toLowerCase();
        let user;

        if (normalizedUserType === 'client') {
            user = await Client.findById(_id).select('-password');
        } else if (normalizedUserType === 'avocat') {
            user = await Avocat.findById(_id).select('-password');
        }
        if (!user) {
            return res.status(404).json({ error: 'No User found' });
        }
        res.status(200).json({
            user: user,
            userType: normalizedUserType,
            role: normalizedUserType === 'client' ? user.role : 'avocat'
        });
    } catch (error) {
        console.error('❌ Signup error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

// Update user profile controller
const updateProfile = async (req, res) => {
    try {
    const { userType, _id } = req.user;
    const normalizedUserType = String(userType || '').toLowerCase();
        const updateData = req.body;
        
        console.log('🔍 Update profile request received');
        console.log('User Type:', userType);
        console.log('User ID:', _id);
        console.log('Update Data:', updateData);
        
        // Remove sensitive fields that shouldn't be updated here
        delete updateData.password;
        delete updateData._id;
        delete updateData.role;
        delete updateData.verified;

        let user;
        let Model;

        if (normalizedUserType === 'client') {
            Model = Client;
        } else if (normalizedUserType === 'avocat') {
            Model = Avocat;
            // Map frontend field names to backend field names for Avocat
            if (updateData.specialization) {
                updateData.specialites = updateData.specialization;
                delete updateData.specialization;
            }
            if (updateData.experience) {
                updateData.anneExperience = parseInt(updateData.experience);
                delete updateData.experience;
            }
            if (updateData.barNumber) {
                updateData.numeroBarreau = updateData.barNumber;
                delete updateData.barNumber;
            }
            if (updateData.address) {
                updateData.adresseCabinet = updateData.address;
                delete updateData.address;
            }
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

    // If disponibilites provided in updateData, normalize to workingHours
    if (normalizedUserType === 'avocat' && updateData.disponibilites) {
            try {
                const parsed = typeof updateData.disponibilites === 'string' ? JSON.parse(updateData.disponibilites) : updateData.disponibilites;
                const dayMap = {
                    lundi: 'Monday',
                    mardi: 'Tuesday',
                    mercredi: 'Wednesday',
                    jeudi: 'Thursday',
                    vendredi: 'Friday',
                    samedi: 'Saturday',
                    dimanche: 'Sunday'
                };
                const DEFAULT_START = '08:00';
                const DEFAULT_END = '17:00';
                const wh = [];
                if (parsed && typeof parsed === 'object') {
                    for (const [k, v] of Object.entries(parsed)) {
                        if (v && v.available) {
                            wh.push({ day: dayMap[k] || k, start: DEFAULT_START, end: DEFAULT_END });
                        }
                    }
                }
                updateData.workingHours = wh;
                delete updateData.disponibilites;
            } catch (e) {
                console.error('Error normalizing disponibilites in update:', e);
            }
        }

    // Update the user
        user = await Model.findByIdAndUpdate(
            _id, 
            updateData, 
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('✅ Profile updated successfully');
        console.log('Updated user:', user);

        res.status(200).json({
            message: 'Profile updated successfully',
            user: user
        });
    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

// Change password controller
const changePassword = async (req, res) => {
    console.log('🔐 changePassword called');
    console.log('req.user:', req.user);
    console.log('req.body keys:', Object.keys(req.body));
    try {
    const { userType, _id } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Ensure we have a normalized, lowercase userType for comparisons
    const normalizedUserType = String(userType || '').toLowerCase();
    console.log('Normalized userType will be used for checks:', normalizedUserType);
        console.log('changePassword received body (masked):', { currentPassword: !!currentPassword, newPasswordLength: newPassword ? newPassword.length : 0 });

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }

        // Enforce stronger password policy: minimum 8 chars and at least one digit
        const pwdPolicy = /^(?=.*\d).{8,}$/;
        if (!pwdPolicy.test(newPassword)) {
            console.log('Password policy validation failed for user:', _id);
            console.log('changePassword request body:', { currentPassword: !!currentPassword, newPasswordLength: newPassword ? newPassword.length : 0 });
            return res.status(400).json({ 
                error: 'New password must be at least 8 characters and include at least one number' 
            });
        }

        let user;
        let Model;

        if (normalizedUserType === 'client') {
            Model = Client;
        } else if (normalizedUserType === 'avocat') {
            Model = Avocat;
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        // Get user with password
        user = await Model.findById(_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await Model.findByIdAndUpdate(_id, { password: hashedPassword });

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
};

module.exports = {
    loginUser,
    signupClient,
    signupAvocat,
    getUserProfile,
    updateProfile,
    changePassword
};