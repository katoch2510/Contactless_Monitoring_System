import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Admin.deleteMany();

        const createdAdmins = await Admin.create([
            {
                name: 'System Admin',
                email: 'admin@campus.edu',
                password: 'password123',
                role: 'Superadmin'
            },
            {
                name: 'Security Gate 1',
                email: 'security@campus.edu',
                password: 'password123',
                role: 'Security'
            }
        ]);

        console.log('Admins Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
