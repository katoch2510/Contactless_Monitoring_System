import express from 'express';
import { registerFaculty, getFaculty, searchFaculty } from '../controllers/facultyController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, authorizeRoles('Superadmin'), registerFaculty);
router.get('/', protect, authorizeRoles('Superadmin', 'Security'), getFaculty);
router.get('/search', protect, authorizeRoles('Superadmin', 'Security'), searchFaculty);

export default router;
