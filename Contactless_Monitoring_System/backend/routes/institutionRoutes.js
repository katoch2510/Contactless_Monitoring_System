import express from 'express';
import {
    getColleges, getDepartments, getCourses, getSections,
    createCollege, createDepartment, createCourse, createSection,
    editInstitution, deleteInstitution
} from '../controllers/institutionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/colleges', protect, asyncHandler(getColleges));
router.get('/departments/:collegeId', protect, asyncHandler(getDepartments));
router.get('/courses/:departmentId', protect, asyncHandler(getCourses));
router.get('/sections/:courseId', protect, asyncHandler(getSections));

router.post('/colleges', protect, authorizeRoles('Superadmin'), asyncHandler(createCollege));
router.post('/departments', protect, authorizeRoles('Superadmin'), asyncHandler(createDepartment));
router.post('/courses', protect, authorizeRoles('Superadmin'), asyncHandler(createCourse));
router.post('/sections', protect, authorizeRoles('Superadmin'), asyncHandler(createSection));

router.put('/:type/:id', protect, authorizeRoles('Superadmin'), asyncHandler(editInstitution));
router.delete('/:type/:id', protect, authorizeRoles('Superadmin'), asyncHandler(deleteInstitution));

export default router;
