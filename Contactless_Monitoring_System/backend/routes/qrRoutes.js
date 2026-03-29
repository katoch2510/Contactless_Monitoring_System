import express from 'express';
import { scanQR, getLogs } from '../controllers/qrController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/scan', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(scanQR));
router.get('/logs', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(getLogs));

export default router;
