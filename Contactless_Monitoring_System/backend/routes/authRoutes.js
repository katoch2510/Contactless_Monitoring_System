import express from 'express';
import { authAdmin, registerAdmin, logoutAdmin } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/login', asyncHandler(authAdmin));
router.post('/register', asyncHandler(registerAdmin));
router.post('/logout', logoutAdmin);

export default router;
