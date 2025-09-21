const express = require('express');
const router = express.Router();
const { requireAuth, requireAvocat, requireVerifiedAvocat } = require('../middleware/auth');

// Avocat dashboard route
router.get('/dashboard', requireAuth, requireAvocat, (req, res) => {
    // nchof ken l avocat verified walla lé
    if (!req.user.verified) {
        return res.json({
            message: 'Marhba bik fi Avocat Dashboard',
            user: req.user,
            redirectUrl: '/avocat/dashboard',
            verified: false,
            status: 'pending_verification',
            alert: 'We still didnt verify you yet. Please wait for admin approval.'
        });
    }

    res.json({
        message: 'Marhba bik fi Avocat Dashboard',
        user: req.user,
        redirectUrl: '/avocat/dashboard',
        verified: req.user.verified,
        status: 'verified'
    });
});

// Get current user info (to refresh verification status)
router.get('/me', requireAuth, requireAvocat, async (req, res) => {
    try {
        const Avocat = require('../Model/Avocat');
        const avocat = await Avocat.findById(req.user._id).select('-password');
        
        if (!avocat) {
            return res.status(404).json({ error: 'Avocat not found' });
        }

        res.json({
            success: true,
            user: avocat
        });
    } catch (error) {
        console.error('Error fetching avocat profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// njib avocat profile (verified avocats barkha)
router.get('/profile', requireAuth, requireAvocat, async (req, res) => {
    try {
        // nchof ken l avocat verified walla lé
        if (!req.user.verified) {
            return res.status(403).json({
                error: 'Ma3andeksh verification baad',
                message: 'We still didnt verify you yet. Please wait for admin approval.',
                verified: false,
                fullName: req.user.fullName,
                email: req.user.email
            });
        }

        const Avocat = require('../Model/Avocat');
        const avocat = await Avocat.findById(req.user._id).select('-password');
        res.json(avocat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// nupdate avocat profile (verified avocats barkha)
router.patch('/profile', requireAuth, requireAvocat, async (req, res) => {
    try {
        // nchof ken l avocat verified walla lé
        if (!req.user.verified) {
            return res.status(403).json({
                error: 'Ma3andeksh verification baad',
                message: 'We still didnt verify you yet. You cannot update your profile until verified.',
                verified: false
            });
        }

        const Avocat = require('../Model/Avocat');
        const {
            fullName,
            phone,
            ville,
            adresseCabinet,
            specialites,
            anneExperience,
            langues,
            bio,
            disponibilites
        } = req.body;

        const updatedAvocat = await Avocat.findByIdAndUpdate(
            req.user._id,
            {
                fullName,
                phone,
                ville,
                adresseCabinet,
                specialites,
                anneExperience,
                langues,
                bio,
                disponibilites
            },
            { new: true }
        ).select('-password');

        res.json(updatedAvocat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// nchof fil verification status (kol l avocats ynajmo yadhkhlo)
router.get('/verification-status', requireAuth, requireAvocat, (req, res) => {
    if (!req.user.verified) {
        return res.json({
            verified: false,
            status: 'pending_verification',
            message: 'We still didnt verify you yet',
            details: 'Your account is under review by our admin team. You will be notified once verification is complete.',
            fullName: req.user.fullName,
            email: req.user.email,
            submittedAt: req.user.createdAt || 'Unknown'
        });
    }

    res.json({
        verified: true,
        status: 'verified',
        message: 'Your account is verified and active',
        fullName: req.user.fullName,
        email: req.user.email,
        verifiedAt: req.user.updatedAt || 'Unknown'
    });
});

// njib kol l avocats l verified (public route lel clients besh ytaloo)
router.get('/verified', async (req, res) => {
    try {
        const Avocat = require('../Model/Avocat');
        const avocats = await Avocat.find({ verified: true })
            .select('-password -documentsVerif')
            .sort({ createdAt: -1 });
        res.json(avocats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Routes li yatlabou verification
router.use(requireVerifiedAvocat);

// nzid availability (verified avocats barkha)
router.post('/availability', requireAuth, async (req, res) => {
    try {
        const Avocat = require('../Model/Avocat');
        const { disponibilites } = req.body;

        const avocat = await Avocat.findByIdAndUpdate(
            req.user._id,
            { disponibilites },
            { new: true }
        ).select('-password');

        res.json({ message: 'Availability updated', avocat });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;