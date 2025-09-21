const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Client dashboard route
router.get('/dashboard', requireAuth, (req, res) => {
    // clients barkha ynajmo yadhkhlou lel route hedhi
    if (req.user.userType !== 'client') {
        return res.status(403).json({ error: 'Client access barkha' });
    }

    res.json({
        message: 'Marhba bik fi Client Dashboard',
        user: req.user,
        redirectUrl: '/client/dashboard'
    });
});

// njib client profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        if (req.user.userType !== 'client') {
            return res.status(403).json({ error: 'Client access barkha' });
        }

        const Client = require('../Model/Client');
        const client = await Client.findById(req.user._id).select('-password');
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// nupdate client profile
router.patch('/profile', requireAuth, async (req, res) => {
    try {
        if (req.user.userType !== 'client') {
            return res.status(403).json({ error: 'Client access barkha' });
        }

        const Client = require('../Model/Client');
        const { fullName, phone } = req.body;

        const updatedClient = await Client.findByIdAndUpdate(
            req.user._id,
            { fullName, phone },
            { new: true }
        ).select('-password');

        res.json(updatedClient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;