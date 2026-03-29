import express from 'express';
import { registerStudent, matchFaceAndLog, getStudents, searchStudents, manualEntryLog } from '../controllers/studentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/register', protect, authorizeRoles('Superadmin', 'Security', 'Staff'), asyncHandler(registerStudent));
router.post('/match', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(matchFaceAndLog));
router.post('/manual-log', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(manualEntryLog));
router.get('/search', protect, authorizeRoles('Superadmin', 'Security'), asyncHandler(searchStudents));
router.get('/', protect, authorizeRoles('Superadmin', 'Security', 'Staff'), asyncHandler(getStudents));

export default router;
