const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/', swapController.createSwapRequest);
router.get('/open', swapController.getOpenSwapRequests);
router.get('/my-requests', swapController.getMySwapRequests);
router.post('/:id/claim', swapController.claimSwapRequest);
router.patch('/:id/cancel', swapController.cancelSwapRequest);

// Manager routes
router.get('/pending', requireRole('manager', 'admin'), swapController.getPendingApprovals);
router.patch('/:id/approve', requireRole('manager', 'admin'), swapController.approveSwap);

module.exports = router;
