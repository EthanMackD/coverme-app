const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Employee routes
router.get('/my-shifts', shiftController.getMyShifts);
router.get('/calendar', shiftController.getCalendarData);
router.get('/employees', shiftController.getEmployees);

// Manager routes
router.get('/all', requireRole('manager', 'admin'), shiftController.getAllShifts);
router.post('/', requireRole('manager', 'admin'), shiftController.createShift);
router.put('/:id', requireRole('manager', 'admin'), shiftController.updateShift);
router.delete('/:id', requireRole('manager', 'admin'), shiftController.deleteShift);

module.exports = router;
