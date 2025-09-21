const Avocat = require('../Model/Avocat');
const Client = require('../Model/Client');

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
    try {
        const totalLawyers = await Avocat.countDocuments();
        const verifiedLawyers = await Avocat.countDocuments({ verified: true });
        const pendingLawyers = await Avocat.countDocuments({ verified: false });
        const totalClients = await Client.countDocuments({ role: 'client' });
        
        res.status(200).json({
            success: true,
            stats: {
                totalLawyers,
                verifiedLawyers,
                pendingLawyers,
                totalClients
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin statistics'
        });
    }
};

// Get all pending lawyer applications
const getPendingLawyers = async (req, res) => {
    try {
        const pendingLawyers = await Avocat.find({ 
            verified: false 
        }).select('-password'); // Exclude password from response
        
        res.status(200).json({
            success: true,
            lawyers: pendingLawyers
        });
    } catch (error) {
        console.error('Error fetching pending lawyers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending lawyers'
        });
    }
};

// Verify or reject a lawyer
const verifyLawyer = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        
        if (action === 'approve') {
            await Avocat.findByIdAndUpdate(lawyerId, { 
                verified: true 
            });
            
            res.status(200).json({
                success: true,
                message: 'Lawyer approved successfully'
            });
        } else if (action === 'reject') {
            // You can either delete the lawyer or mark as rejected
            await Avocat.findByIdAndDelete(lawyerId);
            
            res.status(200).json({
                success: true,
                message: 'Lawyer application rejected'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }
    } catch (error) {
        console.error('Error verifying lawyer:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify lawyer'
        });
    }
};

module.exports = {
    getAdminStats,
    getPendingLawyers,
    verifyLawyer
};
