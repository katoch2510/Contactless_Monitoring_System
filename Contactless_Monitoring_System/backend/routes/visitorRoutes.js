import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { registerVisitor, getPendingVisitors, updateVisitorStatus, getVisitors } from '../controllers/visitorController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(registerVisitor));
router.get('/', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(getVisitors));
router.get('/pending', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(getPendingVisitors));
router.put('/:id/status', protect, authorizeRoles('Superadmin', 'Security', 'Staff'), asyncHandler(updateVisitorStatus));

export default router;
