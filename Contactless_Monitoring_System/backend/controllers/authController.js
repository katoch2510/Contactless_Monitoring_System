import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        const token = generateToken(res, admin._id);

        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token, // Depending on frontend structure, can use cookie or direct token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public (Should be protected in production for Superadmin only)
export const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists');
    }

    const admin = await Admin.create({
        name,
        email,
        password,
        role,
    });

    if (admin) {
        const token = generateToken(res, admin._id);
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutAdmin = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
